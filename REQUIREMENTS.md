# API Requirements
The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application. 

## API Endpoints
#### Products
- Index: '/products' [GET]
- Show: '/products/:id' [GET]
- Create [token required]: '/products' [POST] 
- Top 5 most popular products '/products?ranked=value(integer)' [GET]
- Products by category '/products?category=category(string)' [GET] 

#### Users
- Index [token required]: '/users' [GET]
- Show [token required]: '/users/:id' [GET]
- Create [token required]: '/users' [POST]

#### Orders
- Current Order by user [token required]: '/orders?user=userid(integer)' [GET]
- Completed Orders by user [token required]: '/orders?user=userid(integer)&completed=status(boolean)' [GET]

#### Login
- Accepts a JSON blob with "firstname", "lastname", and "password".  Returns a JWT if the blob is valid.

## Data Shapes
#### Product
-  id: SERIAL PRIMARY KEY
- name: varchar(255)
- price: MONEY
- category: varchar(255)

#### User
- id: SERIAL PRIMARY KEY
- firstName: varchar(255)
- lastName: varchar(255)
- password_digest: varchar(255)

#### Orders
- id: SERIAL PRIMARY KEY
- user_id: bigint REFERENCES users(id)
- status of order (active or complete) BOOLEAN

#### Order Products Associating Table
- id: SERIAL PRIMARY KEY
- quantity: INTEGER
- order_id: bigint REFERENCES orders(id)
- product_id bigint REFERENCES products(id)