import { atom, map } from 'nanostores';

export const isCartOpen = atom(false);

export type CartItem = {
	id: string;
	name: string;
	imageSrc: string;
	quantity: number;
}

type ItemDisplayInfo = Pick<CartItem, 'id' | 'name' | 'imageSrc'>;

export const cartItems = map<Record<string, CartItem>>({});

export function addCartItem({ id, name, imageSrc }: ItemDisplayInfo) {
	const existingEntry = cartItems.get()[id];
	let quantity = 1;
	if (existingEntry) {
		cartItems.setKey(id, {
			...existingEntry,
			quantity: existingEntry.quantity + 1,
		});
		quantity = existingEntry.quantity + 1;
	} else {
		cartItems.setKey(
			id,
			{ id, name, imageSrc, quantity: 1 }
		);
	}
	return quantity;
}

