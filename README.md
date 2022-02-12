# 1. INTRODUCTION AND FILE STRUCTURE

This readme introduces my Store Backend API.  This API introduces a simple model of user, orders, and products.  It has handlers for users, orders, and products, and a handler for 'login' to allow someone to access their JWT so they can interact with other handlers.

## 1.1 INSTALLATION

### Install all dependencies with "npm i"

### Set up the database 
- Create a .env file and fill it with the items required in section 1.3
- Create a user in your postgres database and create the databases defined as POSTGRES_DB and POSTGRES_TEST_DB
- Migrate the database by running the script 'npm run migrate up'
- Migrate the test database by running the script 'npm run migrate_test_db_up'

- At that point, the server can be started with the script "npm start" and accessed at **http://localhost:3000/**

**Whenever the server is started, it will automatically generate an Admin User in the database (from the .env file)  and will log the admin user's JWT to the console.  That JWT is needed to access many endpoints and to creat additional users.**

The build is created with "npm run build"

## 1.2 FILE STRUCTURE
All source files are in /src.  
Models are found in /src/model.  
Handlers are found in /src/handlers.  
Tests are in /src/test/modelSpecs and /src/test/handlerSpecs.  
There is one service function that verifies JWTs under /src/services

## 1.3 REQUIRED ENVIRONMENT VARIABLES AND MY VALUES FOR THEM
- POSTGRES_HOST: address of the postgres database host. My value: 127.0.0.1
- POSTGRES_DB: name of the dev environment datbase.  My value: full_stack_dev
- POSTGRES_TEST_DB: name of the test environment database. My value: fsd_test
- POSTGRES_USER: name of the user to access the databases. My value: javascriptuser
- POSTGRES_PASSWORD: password of the postgres user. My value: ****
- POSTGRES_PORT: port on which to access the postgres host.  My value: 5432
- BCRYPT_PASSWORD: the 'pepper' used to help secure passwords.  My value: **********
- SALT_ROUNDS: an integer number of rounds used by bcrypt to salk.  My value: 10
- TOKEN_SECRET: the secret to sign/validate generated JWTs. My value: **********
- ADMIN_FIRST: the first part of the username for an admin user.  My value: adminfirst
- ADMIN_LAST: the second part of the username for an admin user.  My value: adminlast
- ADMIN_PASSWORD: the password for the admin user.  My value: ****
- TEST_OR_DEV: sets the db migrate and database to the correct environment. MUST BE 'dev' for development. My value: test

## 1.4 TESTING

To run tests, ensure the .env TEST_OR_DEV variable is set to 'test'.  Then run the script "npm run test"

# 2. DATA SHAPES
## Product
| id: SERIAL PRIMARY KEY | name: varchar(255) | price: MONEY | category: varchar(255)|
---

## User
| id: SERIAL PRIMARY KEY | firstName: varchar(255) | lastName: varchar(255) | password_digest: varchar(255) |
---

## Orders
| id: SERIAL PRIMARY KEY | user_id: bigint REFERENCES users(id) | status of order (active/complete) BOOLEAN |
---

## Order Products Associating Table
| id: SERIAL PRIMARY KEY | quantity: INTEGER | order_id: bigint REFERENCES orders(id) | product_id bigint REFERENCES products(id) |
---

# 3. ENDPOINT OVERVIEW

## 3.1 USERS ENDPOINTS

### GET /users
- Returns a JSON list of all users in the database
- Requires a user's JWT to access

### GET /users/:id
- Returns the info of a given user as JSON
- Returns 404 if the userid doesn't exist
- Requires a user's JWT to access

### POST /users/
- Requires a JSON blob in the request body in the following format:
`{
	first_name: <string>,
	last_name: <string>,
	password: <string>
}`
If the blob is missing a field, it will return an error.
- If the user creation is successful, it will return a JSON of the new user's JWT
- If the first_name and last_name are already in use, it will return an JSON error
- Requires a user's JWT to post (use the admin JWT to create the first new user)

## 3.2 PRODUCTS ENDPOINTS

### GET /products
- Returns a JSON list of prodcuts in the database

### GET /products?ranked=`<integer>`
- Returns a JSON list of the most popular products that have been ordered, up to the integer given

### GET /products?category=`<string>`
- Returns a JSON list of all products of the given category

### GET /products/:id
- Returns a JSON blob of the requested product's information
- Returns 404 if the product id doesn't exist

### POST /products
- Requires a JSON blob in the request body in the following format:
`{
	name: <string>,
	price: <number>,
	category: <string>
}`
If the blob is missing a field, it will return an error.
- If the product creation is successful, it will return a JSON blob of the new product in the database
- Requires a user's JWT to access 

## 3.3 ORDERS ENDPOINTS

### GET /orders
- Returns a JSON list of orders in the database
- Requires a user's JWT to access 

### GET /orders?user=`<integer>`
- Returns a JSON list of orders in the database that are associated with the given user ID
- Requires a user's JWT to access 

### GET /orders?user=`<integer>`&status=`<boolean>`
- Returns a JSON list of orders in the database that are associated with the given user ID and have the given completion status
- Requires a user's JWT to access 

### GET /orders/:id
- Returns a JSON blob of the requested orders's information
- Returns 404 if the product id doesn't exist
  
## 3.4 LOGIN ENDPOINT

### POST /login
- Requires a JSON blob in the request body in the following format:
`{
	first_name: <string>,
	last_name: <string>,
	password: <string>
}`
- If the blob matches a user in the database, returns a JWT for that user
- Returns an error if the blob doesn't match a user in the database
