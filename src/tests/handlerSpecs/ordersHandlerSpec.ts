import { Product, ProductStore } from '../../model/productsModel';
import { User, UserStore } from '../../model/usersModel';
import { Order, OrderStore } from '../../model/ordersModel';
import app from '../../index';
import supertest from 'supertest';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { standardTestOrder, standardTestProduct } from '../helpers/testItems';

dotenv.config();

const request = supertest(app);
const userStore = new UserStore();
const productStore = new ProductStore();
const orderStore = new OrderStore();
const pepper = process.env.BCRYPT_PASSWORD as string;
let adminUser : User | null;
let adminJWT : string;
let testProduct : Product | null;
let testOrder : Order | null;

describe("Order Handler Tests", () => {

	beforeAll(async ()=>{

		//First, give time for app to finish setting up so the admin user exists
		adminUser = await userStore.show('1');
		while (adminUser == null) {
			setTimeout(()=>{},500);
			adminUser  = await userStore.show('1') as User;
		}		
		adminJWT = jwt.sign({ user: adminUser }, process.env.TOKEN_SECRET as string);

		//If this is the first spec run, create the test order
		try {
			testOrder = await orderStore.show('1');
		} catch {
			testOrder = await orderStore.create(standardTestOrder);
		}
	});

	it('ensures get/orders returns correctly', async () => {
		const response = await request.get('/orders')
									  .set("Authorization", "Bearer " + adminJWT);
        expect(response.status).toBe(200);
		expect(response.body[0]).toEqual(testOrder);
    });

	it('ensures get/orders/:id returns correctly for a real order', async () => {
		const response = await request.get('/orders/1')
									  .set("Authorization", "Bearer " + adminJWT);		  
        expect(response.status).toBe(200);
		expect(response.body).toEqual(testOrder);
    });

	it('ensures get/orders/:id returns correctly for a fake order', async () => {
		const response = await request.get('/products/300');									  
        expect(response.status).toBe(404);
    });
});