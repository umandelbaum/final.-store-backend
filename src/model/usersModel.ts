import client from '../database';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pepper = process.env.BCRYPT_PASSWORD as string;
const saltRounds = process.env.SALT_ROUNDS as string;

export type User = {
	id : number,
	first_name: string,
    last_name: string,
    password_digest: string
}

export class UserStore {
	
	async index(): Promise<User[]> {
		try{
			const conn = await client.connect();
			const sql = 'SELECT * from users';
			const result = await conn.query(sql);
			conn.release();
			return result.rows;
		} catch (err) {
			throw new Error(`Database error: ${err}`);
		};
	};

	async show(id: string): Promise<User | null> {
		try {
			const conn = await client.connect();
			const sql = 'SELECT * from users where id=($1)';
			const result = await conn.query(sql, [id]);
			conn.release();
			if (result.rows[0]) {			
				return result.rows[0];
			} else {
				return null;
			}
		} catch (err) {
			throw new Error(`Could not access database. Error: ${err}`)
		};
	};

	async create(u: User): Promise<User | null> {
		try {
			const conn = await client.connect();
			//First check if user name is in use
			const nameCheckSQL = 'SELECT password_digest FROM users WHERE first_name=($1) '+
									'AND last_name=($2)'
			const nameCheckResult = await conn.query(nameCheckSQL, [u.first_name, u.last_name]);
			
			//If user name is in use, return null
			if (nameCheckResult.rows.length) {
				return null;
			}

			//If user name isn't in use, continue
			const sql = 'INSERT INTO users (first_name, last_name, password_digest) '+
						'VALUES ($1, $2, $3) RETURNING *';
			const hash = bcrypt.hashSync(u.password_digest + pepper, parseInt(saltRounds));
			
			const result = await conn.query(sql, [u.first_name, u.last_name, hash]);
			conn.release();
			return result.rows[0];
		} catch (err) {
			throw new Error(`Could not create user. Database error: ${err}`)
		};
	};

	async authenticate(firstName :string, lastName: string, password: string): Promise<User | null> {
		try{
			const conn = await client.connect();
			const sql = 'SELECT * FROM users WHERE first_name=($1) AND last_name=($2)';
			const result = await conn.query(sql, [firstName, lastName]);		
	
			if(result.rows.length) {
				const user = result.rows[0] as User;
			  	if (bcrypt.compareSync(password+pepper, user.password_digest)) {
					return user;
		  		}
			}
			return null;
	 	} catch (err) {
			 throw new Error(`Could not access database to authenticate. Error: ${err}`);
		 	}
	};
}