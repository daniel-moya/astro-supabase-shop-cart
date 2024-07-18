export const prerender = false;
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params }) => {
	const id = params.id;
	const product = await queries.getProduct(id);

	if (!product) {
		return new Response(null, {
			status: 404,
			statusText: 'Not found'
		});
	}

	return new Response(
		JSON.stringify(product), {
		status: 200,
		headers: {
			"Content-Type": "application/json"
		}
	}
	);
};

