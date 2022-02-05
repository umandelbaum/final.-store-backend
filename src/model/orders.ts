import client from '../database';

export type Order = {
	id: number, 
	userID: number,
	complete: boolean
}

export class OrderStore {
	
	async index(): Promise<Order[]> {
		// @ts-ignore
		try{
			const conn = await client.connect();
			const sql = 'SELECT * from orders';
			const result = await conn.query(sql);
			conn.release();
			return result.rows;
		} catch (err) {
			throw new Error(`Database error: ${err}`);
		};
	};

	async show(id: string): Promise<Order> {
		// @ts-ignore
		try {
			const conn = await client.connect();
			const sql = 'SELECT * from books where id=($1)';
			const result = await conn.query(sql, [id]);
			conn.release();
			return result.rows[0];
		} catch (err) {
			throw new Error(`Could not find book ${id}. Error: ${err}`)
		};
	};

	async create(b: Order): Promise<Order[]> {
		// @ts-ignore
		try {
			const conn = await client.connect();
			const sql = 'INSERT INTO books (title, total_pages, author, type, summary) ' +
						'VALUES($1, $2, $3, $4, $5)';
			const result = await conn.query(sql, [b.title, b.total_pages, b.author, b.type, b.summary]);
			conn.release();
			return result.rows;
		} catch (err) {
			throw new Error(`Could not create book. Database error: ${err}`)
		};
	};

	async delete(id: string): Promise<Order[]> {
		//@ts-ignore
		try {
			const conn = await client.connect();
			const sql = 'DELETE FROM books where id=($1)';
			const result = await conn.query(sql, [id]);
			conn.release();
			return result.rows;
		} catch (err) {
			throw new Error(`Could not delete book ${id}. Error: ${err}`)
		};
	};

	async update(b: Order): Promise<Order> {
		//@ts-ignore
		try {
			const conn = await client.connect();
			const sql = 'UPDATE books SET title=($1), total_pages=($2), author=($3), ' +
						'type=($4), summary=($5) where id=($6)';
			const result = await conn.query(sql, 
											[b.title, b.total_pages, b.author, b.type, b.summary, b.id]);
			conn.release();
			return result.rows[0];
		} catch (err) {
			throw new Error(`Could not update book ${b.id}. Error: ${err}`);
		};
	};

	async addProduct(quantity: number, orderId: string, productId: string): Promise<Order> {
		try {
		  const sql = 'INSERT INTO order_products (quantity, order_id, product_id) ' +
		  			  'VALUES($1, $2, $3) RETURNING *';
		  //@ts-ignore
		  const conn = await Client.connect();
	
		  const result = await conn.query(sql, [quantity, orderId, productId]);
	
		  const order = result.rows[0];
	
		  conn.release();
	
		  return order;
		} catch (err) {
		  throw new Error(`Could not add product ${productId} to order ${orderId}: ${err}`)
		};
	  };
}