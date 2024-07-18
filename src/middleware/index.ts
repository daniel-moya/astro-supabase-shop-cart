import { defineMiddleware } from "astro:middleware";
import { supabase } from '../lib/supabase/client';
import micromatch from 'micromatch';
import type { AstroCookies } from "astro";
import { CredentialsErrorCode } from "../utils/error";

const protectedRoutes = ["/account(|/)"];
const redirectRoutes = ["/signin(|/)", "/register(|/)"];

const SB_ACCESS_TOKEN_KEY = 'sb-access-token';
const SB_REFRESH_TOKEN_KEY = 'sb-refresh-token';

function getTokens(cookies: AstroCookies) {
	const accessToken = cookies.get(SB_ACCESS_TOKEN_KEY);
	const refreshToken = cookies.get(SB_REFRESH_TOKEN_KEY);

	return { accessToken, refreshToken };
}

function clearCookies(cookies: AstroCookies) {
	cookies.delete(SB_ACCESS_TOKEN_KEY, {
		path: "/",
	});
	cookies.delete(SB_REFRESH_TOKEN_KEY, {
		path: "/",
	});

}

export const onRequest = defineMiddleware(
	async ({ locals, url, cookies, redirect }, next) => {
		const { accessToken, refreshToken } = getTokens(cookies);
		const hasTokens = accessToken && refreshToken;

		if (micromatch.isMatch(url.pathname, protectedRoutes)) {
			if (!hasTokens) {
				return redirect("/signin");
			}
		}
		//
		if (micromatch.isMatch(url.pathname, redirectRoutes)) {
			if (hasTokens) {
				return redirect("/");
			}

		}

		if (hasTokens) {
			let invalidCookies = false;
			try {
				const { data, error } = await supabase.auth.setSession({
					refresh_token: refreshToken!.value,
					access_token: accessToken!.value,
				});

				if (error) {
					invalidCookies = true;
				}

				locals.email = data.user?.email!;
				locals.userId = data.user?.id!;
				cookies.set(SB_ACCESS_TOKEN_KEY, data?.session?.access_token!, {
					sameSite: "strict",
					path: "/",
					secure: true,
				});
				cookies.set(SB_REFRESH_TOKEN_KEY, data?.session?.refresh_token!, {
					sameSite: "strict",
					path: "/",
					secure: true,
				});

			} catch {
				invalidCookies = true;
			}
			if (invalidCookies) {
				clearCookies(cookies);
				return redirect(`/error/${CredentialsErrorCode}`);
			}
		}

		return next();
	}
);
