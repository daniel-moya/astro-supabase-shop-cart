import Cart from '../components/cart.tsx';
import Account from '../components/account.tsx';

export default function Nav({ user }) {
	return (
		<nav style={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			maxWidth: '100vw',
			background: '#C8ACD6',
			padding: 40,
		}}>
			<a href="/"><span className="logo">logo</span></a>
			<div>
				<div className="menu" style={{ display: 'flex', flexDirection: 'row', gap: 20, justifyContent: 'space-between', alignItems: 'center' }}>
					<a href="/cart">
						Cart
					</a>
					<a href="/account">
						Account
					</a>

					{user.email ? (
						<a href="api/auth/signout">Log out</a>
					) : (
						<a href="/signin">Sign in</a>
					)}

				</div>
				<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
					{user.email}
				</div>
			</div>
		</nav>
	);
}
