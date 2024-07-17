create table users (
  id uuid references auth.users not null primary key,
  full_name text,
  email text unique not null,
  avatar_url text,
  billing_address jsonb,
  payment_method jsonb,
  created_at timestamp with time zone default current_timestamp
);
alter table users enable row level security;

create table customers (
  id uuid references auth.users not null primary key,
  stripe_customer_id text
);
alter table customers enable row level security;

create table products (
  id text primary key,
  active boolean,
  name text,
  description text,
  image text,
  metadata jsonb
);
alter table products enable row level security;
create policy "Allow public read-only access." on products for select using (true);

create type pricing_type as enum ('one_time', 'recurring');
create type pricing_plan_interval as enum ('day', 'week', 'month', 'year');
create table prices (
  id text primary key,
  product_id text references products(id), 
  active boolean,
  description text,
  unit_amount bigint,  
  currency text check (char_length(currency) = 3),
  type pricing_type,
);
alter table prices enable row level security;
create policy "Allow public read-only access." on prices for select using (true);

create table carts (
  id uuid not null default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade
);
alter table carts enable row level security;
create policy "Allow access to own carts" on carts for select using (auth.uid() = user_id);
create index idx_cart_user_id on carts (user_id);

create table cart_items (
  id uuid not null default uuid_generate_v4() primary key,
  cart_id uuid references carts(id) on delete cascade,
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

create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  insert into public.carts (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

