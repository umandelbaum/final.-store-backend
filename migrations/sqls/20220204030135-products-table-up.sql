CREATE TABLE products(
	id SERIAL PRIMARY KEY,
	name VARCHAR(64) NOT NULL,
	price MONEY NOT NULL,
	category VARCHAR(64) NOT NULL
);