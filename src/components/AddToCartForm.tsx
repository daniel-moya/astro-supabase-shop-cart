import type { ReactNode } from 'react';

interface Props {
	priceId: string
	children: ReactNode
}

export default function AddToCartForm({ priceId, children }: Props) {
	return (
		<form method="post" action="/api/cart/add-item">
			{children}
			<input
				name="priceId"
				value={priceId}
				type="hidden"
			/>
		</form>

	)
}
