import { createClient } from '@supabase/supabase-js';
import type { Database, Tables, TablesInsert } from 'types_db';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;


// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!
const supabaseAdmin = createClient<Database>(
	import.meta.env.SUPABASE_URL,
	import.meta.env.SUPABASE_ROLE_KEY
);

interface IProduct {
	id: string,
	active: boolean,
	name: string,
	description?: string,
	images?: Array<any>,
	metadata: object
}
// TODO: check Stripe product attribute types

const upsertProductRecord = async (product: IProduct) => {
	const productData: Product = {
		id: product.id,
		active: product.active,
		name: product.name,
		description: product.description ?? null,
		image: product.images?.[0] ?? null,
		metadata: product.metadata
	};

	const { error: upsertError } = await supabaseAdmin
		.from('products')
		.upsert([productData]);
	if (upsertError)
		throw new Error(`Product insert/update failed: ${upsertError.message}`);
	console.log(`Product inserted/updated: ${product.id}`);
};

interface IPrice {
	id: string,
	product: string,
	active: boolean,
	currency: string,
	type: string,
	unit_amount?: number,
}
// TODO: check Strip price attribute types

const upsertPriceRecord = async (
	price: IPrice,
	retryCount = 0,
	maxRetries = 3
) => {
	const priceData: Price = {
		id: price.id,
		product_id: typeof price.product === 'string' ? price.product : '',
		active: price.active,
		currency: price.currency,
		type: price.type,
		unit_amount: price.unit_amount ?? null,
	};

	const { error: upsertError } = await supabaseAdmin
		.from('prices')
		.upsert([priceData]);

	if (upsertError?.message.includes('foreign key constraint')) {
		if (retryCount < maxRetries) {
			console.log(`Retry attempt ${retryCount + 1} for price ID: ${price.id}`);
			await new Promise((resolve) => setTimeout(resolve, 2000));
			await upsertPriceRecord(price, retryCount + 1, maxRetries);
		} else {
			throw new Error(
				`Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`
			);
		}
	} else if (upsertError) {
		throw new Error(`Price insert/update failed: ${upsertError.message}`);
	} else {
		console.log(`Price inserted/updated: ${price.id}`);
	}
};

const deleteProductRecord = async (product: IProduct) => {
	const { error: deletionError } = await supabaseAdmin
		.from('products')
		.delete()
		.eq('id', product.id);
	if (deletionError)
		throw new Error(`Product deletion failed: ${deletionError.message}`);
	console.log(`Product deleted: ${product.id}`);
};

const deletePriceRecord = async (price: IPrice) => {
	const { error: deletionError } = await supabaseAdmin
		.from('prices')
		.delete()
		.eq('id', price.id);
	if (deletionError) throw new Error(`Price deletion failed: ${deletionError.message}`);
	console.log(`Price deleted: ${price.id}`);
};

const upsertCustomerToSupabase = async (uuid: string, customerId: string) => {
	const { error: upsertError } = await supabaseAdmin
		.from('customers')
		.upsert([{ id: uuid, stripe_customer_id: customerId }]);

	if (upsertError)
		throw new Error(`Supabase customer record creation failed: ${upsertError.message}`);

	return customerId;

};

async function addCartItem(price_id: string, quantity: number) {
	const { data: { user } } = await supabaseAdmin.auth.getUser();
	const { error: upsertError } = await supabaseAdmin
		.from('cart_items')
		.upsert([{ user_id: user.id, price_id, quantity }]);

	if (upsertError)
		throw new Error(`Supabase customer record creation failed: ${upsertError.message}`);

	return price_id;
}

const deleteCartItemRecord = async (cart_item_id: string) => {
	const { error: deletionError } = await supabaseAdmin
		.from('cart_items')
		.delete()
		.eq('id', cart_item_id);
	if (deletionError)
		throw new Error(`Cart Item deletion failed: ${deletionError.message}`);
	console.log(`Product deleted: ${cart_item_id}`);
};

// const createCustomerInStripe = async (uuid: string, email: string) => {
// 	const customerData = { metadata: { supabaseUUID: uuid }, email: email };
// 	const newCustomer = await stripe.customers.create(customerData);
// 	if (!newCustomer) throw new Error('Stripe customer creation failed.');
//
// 	return newCustomer.id;
// };

// const createOrRetrieveCustomer = async ({
// 	email,
// 	uuid
// }: {
// 	email: string;
// 	uuid: string;
// }) => {
// 	// Check if the customer already exists in Supabase
// 	const { data: existingSupabaseCustomer, error: queryError } =
// 		await supabaseAdmin
// 			.from('customers')
// 			.select('*')
// 			.eq('id', uuid)
// 			.maybeSingle();
//
// 	if (queryError) {
// 		throw new Error(`Supabase customer lookup failed: ${queryError.message}`);
// 	}
//
// 	// Retrieve the Stripe customer ID using the Supabase customer ID, with email fallback
// 	let stripeCustomerId: string | undefined;
// 	if (existingSupabaseCustomer?.stripe_customer_id) {
// 		const existingStripeCustomer = await stripe.customers.retrieve(
// 			existingSupabaseCustomer.stripe_customer_id
// 		);
// 		stripeCustomerId = existingStripeCustomer.id;
// 	} else {
// 		// If Stripe ID is missing from Supabase, try to retrieve Stripe customer ID by email
// 		const stripeCustomers = await stripe.customers.list({ email: email });
// 		stripeCustomerId =
// 			stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined;
// 	}
//
// 	// If still no stripeCustomerId, create a new customer in Stripe
// 	const stripeIdToInsert = stripeCustomerId
// 		? stripeCustomerId
// 		: await createCustomerInStripe(uuid, email);
// 	if (!stripeIdToInsert) throw new Error('Stripe customer creation failed.');
//
// 	if (existingSupabaseCustomer && stripeCustomerId) {
// 		// If Supabase has a record but doesn't match Stripe, update Supabase record
// 		if (existingSupabaseCustomer.stripe_customer_id !== stripeCustomerId) {
// 			const { error: updateError } = await supabaseAdmin
// 				.from('customers')
// 				.update({ stripe_customer_id: stripeCustomerId })
// 				.eq('id', uuid);
//
// 			if (updateError)
// 				throw new Error(
// 					`Supabase customer record update failed: ${updateError.message}`
// 				);
// 			console.warn(
// 				`Supabase customer record mismatched Stripe ID. Supabase record updated.`
// 			);
// 		}
// 		// If Supabase has a record and matches Stripe, return Stripe customer ID
// 		return stripeCustomerId;
// 	} else {
// 		console.warn(
// 			`Supabase customer record was missing. A new record was created.`
// 		);
//
// 		// If Supabase has no record, create a new record and return Stripe customer ID
// 		const upsertedStripeCustomer = await upsertCustomerToSupabase(
// 			uuid,
// 			stripeIdToInsert
// 		);
// 		if (!upsertedStripeCustomer)
// 			throw new Error('Supabase customer record creation failed.');
//
// 		return upsertedStripeCustomer;
// 	}
// };

// /**
//  * Copies the billing details from the payment method to the customer object.
//  */
// const copyBillingDetailsToCustomer = async (
// 	uuid: string,
// 	payment_method: Stripe.PaymentMethod
// ) => {
// 	//Todo: check this assertion
// 	const customer = payment_method.customer as string;
// 	const { name, phone, address } = payment_method.billing_details;
// 	if (!name || !phone || !address) return;
// 	//@ts-ignore
// 	await stripe.customers.update(customer, { name, phone, address });
// 	const { error: updateError } = await supabaseAdmin
// 		.from('users')
// 		.update({
// 			billing_address: { ...address },
// 			payment_method: { ...payment_method[payment_method.type] }
// 		})
// 		.eq('id', uuid);
// 	if (updateError) throw new Error(`Customer update failed: ${updateError.message}`);
// };
//

export {
	upsertProductRecord,
	upsertPriceRecord,
	deleteProductRecord,
	deletePriceRecord,
	addCartItem,
	deleteCartItemRecord,
	// createOrRetrieveCustomer,
};
