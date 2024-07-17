insert into products (id, active, name, description, image, metadata) values ('b1201df5-3d52-4662-84c7-96bddc79ef21', true, 'Bread Ww Cluster', 'product small description', 'http://dummyimage.com/183x100.png/dddddd/000000', '{}');
insert into products (id, active, name, description, image, metadata) values ('7639d125-0ae8-424c-a3e2-0a7a202dbb8e', true, 'Jolt Cola - Red Eye', 'product small description', 'http://dummyimage.com/241x100.png/5fa2dd/ffffff', '{}');
insert into products (id, active, name, description, image, metadata) values ('7639d125-0ae8-424c-88ad-0a7a202dbb8e', true, 'Jolt Cola - Red Eye', 'product small description', 'http://dummyimage.com/241x100.png/5fa2dd/ffffff', '{}');
insert into products (id, active, name, description, image, metadata) values ('1234sa2s-ab6e-487f-a9b1-90ce351f67e2', false, 'Energy - Boo - Koo', 'product small description', 'http://dummyimage.com/200x100.png/5fa2dd/ffffff', '{}');

insert into prices (id, product_id, active, description, unit_amount, type) values ('cfe0495d-3137-4b53-a539-c44c8b5e134a', 'b1201df5-3d52-4662-84c7-96bddc79ef21', true, 'price description', 1, 'one_time');
insert into prices (id, product_id, active, description, unit_amount, type) values ('13c505c2-6029-473a-9006-3939e440817c', '7639d125-0ae8-424c-a3e2-0a7a202dbb8e', true, 'price description', 1, 'one_time');
insert into prices (id, product_id, active, description, unit_amount, type) values ('07f3e060-1c95-42b1-9e8e-13ff6bce9d23', '7639d125-0ae8-424c-88ad-0a7a202dbb8e', true, 'price description', 1, 'one_time');
insert into prices (id, product_id, active, description, unit_amount, type) values ('4723c4e3-ba72-463f-bf37-f0638ca5661a', '1234sa2s-ab6e-487f-a9b1-90ce351f67e2', false, 'price description', 1, 'one_time');
