create table users (
  id integer unique not null primary key autoincrement,
  full_name text,
  email text unique not null,
  avatar_url text,
  billing_address JSON,
  payment_method JSON,
  created_at datetime default current_timestamp
);

create table customers (
  id integer unique not null primary key autoincrement,
  stripe_customer_id text
);

create table products (
  id text unique primary key,
  active boolean,
  name text,
  description text,
  image text,
  metadata JSON 
);

create table prices (
  id text unique not null primary key,
  product_id text references products(id), 
  active boolean,
  description text,
  unit_amount int,  
  currency text check (char_length(currency) = 3),
  type ID 
);

create table cart_items (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade,
  price_id text references prices(id),
  quantity int not null check (quantity > 0),
  created_at timestamp with time zone default current_timestamp
);
alter table cart_items enable row level security;
create policy "Allow access to own cart_items" on cart_items for select using (
  auth.uid() = (select user_id from carts where carts.id = cart_items.cart_id)
);
create index idx_cart_item_cart_id on cart_items (cart_id);

create type order_status as enum ('pending', 'delivered');
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  shipping_email text not null,
  total_price numeric not null,
  order_status order_status not null default 'pending',
  created_at timestamp with time zone default current_timestamp
);
alter table orders enable row level security;
create policy "Allow access to own orders" on orders for select using (auth.uid() = user_id);
create index idx_order_user_id on orders (user_id);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id text references products(id),
  quantity int not null check (quantity > 0),
  price_at_purchase numeric not null,
  created_at timestamp with time zone default current_timestamp
);
alter table order_items enable row level security;
create policy "Allow access to own order_items" on order_items for select using (auth.uid() = (select user_id from orders where orders.id = order_items.order_id));
create index idx_order_item_order_id on order_items (order_id);