import { useMemo } from "react";

export default function Nav({ user }) {
	const isLoggedIn = useMemo(() => user?.email, [user]);
	return (
		<header>
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
						<a href="/">
							Shop
						</a>

						<a href="/cart">
							Cart
						</a>

						<a href="/account">
							Account
						</a>

						{isLoggedIn ? (
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
		</header>
	);
}
