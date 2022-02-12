import { PoolClient } from 'pg';
import client from '../database';


export type orderedProduct = {
	product_id: string,
	quantity: number
}

export type Order = {
	id: number, 
	userID: number,
	complete: boolean,
	orderedProducts: orderedProduct[]
}

//This format is needed because for some reason the query results come back with the foreign key as a string
type sqlOrderFormat = {
	id: number, 	
	complete: boolean,
	user_id: string
}

//This function does the work of querying the association table to fill the 'ordered product' arrays
//The for loop was being repeated in index, show, showbyuser, and showbyuserandstatus, so I abstracted it
async function fillOrdersWithMatchedProducts(conn: PoolClient, orders:sqlOrderFormat[]) : Promise<Order[]> {
	try{
		let orderResults : Order[] = [];
		for (let index = 0; index < orders.length; index++) {
			const order = orders[index];
			const sql = 'SELECT product_id, quantity FROM order_products WHERE order_id =($1)';
			const matchingProducts = await conn.query(sql, [order.id]);
			const productEntries = matchingProducts.rows as orderedProduct[];
			const foundOrder : Order = {
				id: order.id,
				userID: parseInt(order.user_id),
				complete: order.complete,
				orderedProducts : productEntries
			};
			orderResults.push(foundOrder);
		}
		return orderResults;
	} catch (err) {
		throw new Error(`Database error: ${err}`);
	};
}

export class OrderStore {
	
	async index(): Promise<Order[]> {		
		try{
			const conn = await client.connect();
			const sql = 'SELECT * FROM orders';
			const result = await conn.query(sql);
			const orders = result.rows as sqlOrderFormat[];			
			const fullOrders = await fillOrdersWithMatchedProducts(conn, orders);
			conn.release();
			return fullOrders;
		} catch (err) {
			throw new Error(`Database error: ${err}`);
		};
	};

	async show(id: string): Promise<Order> {		
		try{		
			const conn = await client.connect();
			const sql = 'SELECT * FROM orders WHERE id=($1)';
			const result = await conn.query(sql, [id]);
			if (!result.rows.length) {
				throw new Error(`Order #${id} doesn't exist`);
			}
			const resultOrder = result.rows as sqlOrderFormat[];
			const fullOrder = await fillOrdersWithMatchedProducts(conn, resultOrder);
			conn.release();
			return fullOrder[0];
		} catch (err) {
			throw new Error(`Database error: ${err}`);
		};
	};

	async showByUser(id: string): Promise<Order[]> {
		try{		
			const conn = await client.connect();
			const sql = 'SELECT * FROM orders WHERE user_id=($1)';
			const result = await conn.query(sql, [id]);
			if (!result.rows.length) {
				return [];
			}
			const resultOrder = result.rows as sqlOrderFormat[];
			const fullOrders = await fillOrdersWithMatchedProducts(conn, resultOrder);
			conn.release();
			return fullOrders;
		} catch (err) {
			throw new Error(`Database error: ${err}`);
		}
	}

	async showByUserAndStatus(id:string, status:boolean): Promise<Order[]> {
		try{		
			const conn = await client.connect();
			const sql = 'SELECT * FROM orders WHERE user_id=($1) AND complete=($2)';
			const result = await conn.query(sql, [id, status]);
			if (!result.rows.length) {
				return [];
			}
			const resultOrder = result.rows as sqlOrderFormat[];
			const fullOrders = await fillOrdersWithMatchedProducts(conn, resultOrder);
			conn.release();
			return fullOrders;
		} catch (err) {
			throw new Error(`Database error: ${err}`);
		}
	}

	async create(o: Order): Promise<Order> {		
		try {
			const conn = await client.connect();
			const sql = 'INSERT INTO orders (complete, user_id) '+
						'VALUES($1, $2) RETURNING *';
			const result = await conn.query(sql, [o.complete, o.userID]);
			conn.release();
			const sqlResult = result.rows[0] as sqlOrderFormat;
			const returnOrder : Order = {
				id: sqlResult.id,
				userID: parseInt(sqlResult.user_id),
				complete: sqlResult.complete,
				orderedProducts: []
			}
			return returnOrder;
		} catch (err) {
			throw new Error(`Could not create order. Database error: ${err}`)
		};
	};

	async update(o: Order): Promise<Order> {
		try {
			const conn = await client.connect();
			const sql = 'UPDATE orders SET complete=($1), user_id=($2) ' +
						'WHERE id=($3) RETURNING *';
			const result = await conn.query(sql, [o.complete, o.userID, o.id]);
			if (!result.rows.length) {
				throw new Error('Order does not exist');;
			}
			const resultOrder = result.rows as sqlOrderFormat[];
			const fullOrders = await fillOrdersWithMatchedProducts(conn, resultOrder);
			conn.release();
			return fullOrders[0];
		} catch (err) {
			throw new Error(`Could not update order ${o.id}. Error: ${err}`);
		};
	};

	async addProduct(quantity: number, orderId: string, productId: string): Promise<Order> {
		try {
		  const sql = 'INSERT INTO order_products (quantity, order_id, product_id) ' +
		  			  'VALUES($1, $2, $3) RETURNING *';
		  const conn = await client.connect();
		  await conn.query(sql, [quantity, orderId, productId]);		  
		  conn.release(); 
		  return this.show(orderId);
		} catch (err) {
		  throw new Error(`Could not add product ${productId} to order ${orderId}: ${err}`)
		};
	  };
}