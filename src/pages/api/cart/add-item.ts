export const prerender = false;
import type { APIRoute } from "astro";
import { addCartItem } from "../../../lib/supabase/admin";

export const POST: APIRoute = async ({ request }) => {
	const formData = await request.formData();
	const priceId = formData.get("priceId")?.toString();
	const cartId = formData.get("cartId")?.toString();

	if (!priceId || !cartId) {
		return new Response("Price Id not provided", { status: 400 });
	}

	try {
		addCartItem(priceId, 1);
	} catch {
		return new Response(`Failed to add cart item ${priceId}`, { status: 500 });
	}

	return new Response("Added cart item successfully", { status: 200 })
};

