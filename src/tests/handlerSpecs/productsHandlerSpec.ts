import { Product, ProductStore } from '../../model/productsModel';
import { User, UserStore } from '../../model/usersModel';
import { Order, OrderStore } from '../../model/ordersModel';
import app from '../../index';
import supertest from 'supertest';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { standardTestOrder, standardTestProduct } from '../helpers/testItems';
import exp from 'constants';

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

describe("Product Handler Tests", () => {

	beforeAll(async ()=>{

		//First, give time for app to finish setting up so the admin user exists
		adminUser = await userStore.show('1');
		while (adminUser == null) {
			setTimeout(()=>{},500);
			adminUser  = await userStore.show('1') as User;
		}		
		adminJWT = jwt.sign({ user: adminUser }, process.env.TOKEN_SECRET as string);

		//Next get the test product in case the productModelSpec or orderModelSpec already made it
		testProduct = await productStore.show('1');
		
		//If this is the first spec run, create the test product
		if (testProduct == null) {
			testProduct  = (await productStore.create(standardTestProduct))[0];
		}

		//Now do the same for the test order
		try {
			testOrder = await orderStore.show('1');
		} catch {
			testOrder = await orderStore.create(standardTestOrder);
		}
	});

	it('ensures get/products returns correctly', async () => {
		const response = await request.get('/products');								  
        expect(response.status).toBe(200);
		expect(response.body[0]).toEqual(testProduct);
    });

	it('ensures get/products/:id returns correctly for a real product', async () => {
		const response = await request.get('/products/1');								  
        expect(response.status).toBe(200);
		expect(response.body).toEqual(testProduct);
    });

	it('ensures get/products/:id returns correctly for a fake product', async () => {
		const response = await request.get('/products/300');									  
        expect(response.status).toBe(404);
    });

	it('ensures the post/products correctly adds a product',async () => {
		const response = await request.post('/products')
									  .set("Authorization", "Bearer " + adminJWT)
									  .send({name:'New Product',
											 price:15.73,
											 category:'New Stuff'});
		const newProduct : Product = response.body as Product;
		const productList = await productStore.index();
		expect(response.status).toBe(200);
		expect(productList).toContain(newProduct);
	});
});