import { User, UserStore } from '../../model/usersModel';
import app from '../../index';
import supertest from 'supertest';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { execPath } from 'process';

dotenv.config();

const request = supertest(app);
const store = new UserStore();
const pepper = process.env.BCRYPT_PASSWORD as string;
let adminUser : User | null;
let adminJWT : string;

describe("User Handler Tests", () => {

	beforeAll(async ()=>{

		//Give time for app to finish setting up so admin user exists
		adminUser = await store.show('1');
		while (adminUser == null) {
			setTimeout(()=>{},500);
			adminUser  = await store.show('1') as User;
		}		
		adminJWT = jwt.sign({ user: adminUser }, process.env.TOKEN_SECRET as string)
	});

	it('ensures get/users returns correctly for an existing user', async () => {
		const response = await request.get('/users')
									  .set("Authorization", "Bearer " + adminJWT);
        expect(response.status).toBe(200);
		expect(response.body[0]).toEqual(adminUser);
    });

	it('ensures get/users/:id returns correctly for a real user', async () => {
		const response = await request.get('/users/1')
									  .set("Authorization", "Bearer " + adminJWT);
        expect(response.status).toBe(200);
		expect(response.body).toEqual(adminUser);
    });

	it('ensures get/users/:id returns correctly for a fake user', async () => {
		const response = await request.get('/users/300')
									  .set("Authorization", "Bearer " + adminJWT);
        expect(response.status).toBe(404);
    });

	it('ensures post/users adds a user and returns the right JWT',async () => {
		const response = await request.post('/users')
									  .set("Authorization", "Bearer " + adminJWT)
									  .send({first_name:'Tom',
											 last_name:'Bombadil',
											 password:'Goldberry'});
		const addedUser = await store.authenticate('Tom','Bombadil','Goldberry') as User;
		const addedUserJWT = jwt.sign({ user: addedUser }, process.env.TOKEN_SECRET as string);
		expect(response.status).toBe(200);
		expect(response.body).toBe(addedUserJWT);
	});
});