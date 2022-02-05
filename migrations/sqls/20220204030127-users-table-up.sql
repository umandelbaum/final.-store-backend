CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	first_name VARCHAR(64) NOT NULL,
	last_name VARCHAR(64) NOT NULL,
	password_digest VARCHAR(255) NOT NULL
);