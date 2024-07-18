import { defineMiddleware } from "astro:middleware";
import { supabase } from '../lib/supabase/client';
import micromatch from 'micromatch';
import type { AstroCookies } from "astro";

const protectedRoutes = ["/account(|/)"];
const redirectRoutes = ["/signin(|/)", "/register(|/)"];
const SB_ACCESS_TOKEN_KEY = 'sb-access-token';
const SB_REFRESH_TOKEN_KEY = 'sb-refresh-token';

function getTokens(cookies: AstroCookies) {
	const accessToken = cookies.get(SB_ACCESS_TOKEN_KEY);
	const refreshToken = cookies.get(SB_REFRESH_TOKEN_KEY);

	return { accessToken, refreshToken };
}

async function handleSession(locals, cookies: AstroCookies) {
	const { accessToken, refreshToken } = getTokens(cookies);

	const { data, error } = await supabase.auth.setSession({
		refresh_token: refreshToken!.value,
		access_token: accessToken!.value,
	});

	if (error) {
		console.error(error);
		cookies.delete(SB_ACCESS_TOKEN_KEY, {
			path: "/",
		});
		cookies.delete(SB_REFRESH_TOKEN_KEY, {
			path: "/",
		});
		// throw new Error("Error setting up session");
	}

	locals.email = data.user?.email!;
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

		if (micromatch.isMatch(url.pathname, redirectRoutes)) {
			if (hasTokens) {
				return redirect("/");
			}

		}

		if (hasTokens) {
			try {
				await handleSession(locals, cookies);
			} catch {
				redirect("/");
			}
		}

		// Home -> has or doesnt have tokens -> should still set locals
		// Register -> has tokens -> home
		// SignIn -> has tokens -> home
		// Cart -> has or doesnt have tokens -> should set session nad locals
		// Account -> has tokens -> redirect to signin if not 
		return next();
	}
);
