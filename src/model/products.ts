import client from '../database';

export type Product = {
	id : number,
	name: string,
    price: number,
	category: string    
}

export class ProductStore {
	
	async index(): Promise<Product[]> {
		// @ts-ignore
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

	async show(id: string): Promise<Product> {
		// @ts-ignore
		try {
			const conn = await client.connect();
			const sql = 'SELECT * from products where id=($1)';
			const result = await conn.query(sql, [id]);
			conn.release();
			return result.rows[0];
		} catch (err) {
			throw new Error(`Could not find product #${id}. Error: ${err}`)
		};
	};

	async create(p: Product): Promise<Product[]> {
		// @ts-ignore
		try {
			const conn = await client.connect();
			const sql = 'INSERT INTO products (name, price, category) VALUES ($1, $2, $3)';
			const result = await conn.query(sql, [p.name, p.price, p.category]);
			conn.release();
			return result.rows;
		} catch (err) {
			throw new Error(`Could not create product. Database error: ${err}`)
		};
	}

	//Top 5

	//By category
}