import client from '../database';

export type Product = {
	id : number,
	name: string,
    price: number,
	category: string    
}

export type ProductListEntry = {
	id: number,
	name: string,
	total_ordered: string
}

export class ProductStore {
	
	async index(): Promise<Product[]> {
		try{
			const conn = await client.connect();
			const sql = 'SELECT * from products';
			const result = await conn.query(sql);
			conn.release();
			return result.rows;
		} catch (err) {
			throw new Error(`Database error: ${err}`);
		};
	};

	async show(id: string): Promise<Product | null> {
		try {
			const conn = await client.connect();
			const sql = 'SELECT * from products where id=($1)';
			const result = await conn.query(sql, [id]);
			conn.release();
			if (result.rows[0]) {			
				return result.rows[0];
			} else {
				return null;
			}			
		} catch (err) {
			throw new Error(`Could not access database. Error: ${err}`);
		};
	};

	async create(p: Product): Promise<Product[]> {
		try {
			const conn = await client.connect();
			const sql = 'INSERT INTO products (name, price, category) '+ 
						'VALUES ($1, $2, $3) RETURNING *';
			const result = await conn.query(sql, [p.name, p.price, p.category]);
			conn.release();
			return result.rows;
		} catch (err) {
			throw new Error(`Could not create product. Database error: ${err}`)
		};
	}

	//Top Products
	async topProducts(limit: number): Promise<ProductListEntry[]> {
		try {
			const conn = await client.connect();
			const sql = 'SELECT products.id, name, SUM(quantity) total_ordered FROM products '+
						'INNER JOIN order_products ON products.id = order_products.product_id '+
						'GROUP BY products.id ORDER BY total_ordered DESC LIMIT ($1)';
			const result = await conn.query(sql, [limit]);
			conn.release();
			return result.rows;
		} catch (err) {
			throw new Error(`Database error: ${err}`)
		};
	}

	//By category
	async showCategory(category: string): Promise<Product[]> {
		try {
			const conn = await client.connect();
			const sql = 'SELECT * from products where category=($1)';
			const result = await conn.query(sql, [category]);
			conn.release();					
			return result.rows;
		} catch (err) {
			throw new Error(`Could not access database. Error: ${err}`);
		};
	};
}