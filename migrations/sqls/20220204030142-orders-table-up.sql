CREATE TABLE orders (
	id SERIAL PRIMARY KEY,
	complete BOOLEAN,
	user_id bigint REFERENCES users(id)
);