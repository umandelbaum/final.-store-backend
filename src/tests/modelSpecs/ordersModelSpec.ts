import { Order, OrderStore, orderedProduct} from '../../model/ordersModel';
import { Product, ProductStore } from '../../model/productsModel';
import app from '../../index';
import supertest from 'supertest';
import { standardTestOrder, standardTestProduct } from '../helpers/testItems';
import { User, UserStore } from '../../model/usersModel';


const request = supertest(app);
const orderStore = new OrderStore();
const productStore = new ProductStore();
const userStore = new UserStore();
let testProduct : Product | null;

describe("Order Model Tests", () => {
  
  
  beforeAll(async ()=>{
    //Give time for app to finish setting up so admin user exists
		let adminUser : User | null = await userStore.show('1');
		while (adminUser == null) {
			setTimeout(()=>{},500);
			adminUser  = await userStore.show('1') as User;
		}		

    //Next see if test product exists in database or create it if needed
    testProduct = await productStore.show('1');
    if (testProduct == null) {
      testProduct = (await productStore.create(standardTestProduct))[0];      
    }
	});

  it('should have an index method', () => {
    expect(orderStore.index).toBeDefined();
  });

  it('should have a show method', () => {
    expect(orderStore.show).toBeDefined();
  });

  it('should have a create method', () => {
    expect(orderStore.create).toBeDefined();
  });

  it('create method should add an order', async () => {
	  const result = await orderStore.create(standardTestOrder);
	  expect(result.userID).toEqual(1);
    expect(result.complete).toBeFalse;
  });
 
  it('index method should return a list of orders', async () => { 
	  const result = await orderStore.index();  
    expect(result[0].id).toEqual(1);
    expect(result[0].userID).toEqual(standardTestOrder.userID);
    expect(result[0].complete).toBeFalse;
  });

  it('show method should return the correct order', async () => {
    const result = await orderStore.show("1") as Order;
	  expect(result.id).toEqual(1);
	  expect(result.userID).toEqual(standardTestOrder.userID);
    expect(result.complete).toBeFalse;
  });

  it('show by user method should return the correct order', async () => {
    const result = await orderStore.showByUser("1") as Order[];
    expect(result[0].id).toEqual(1);
    expect(result[0].userID).toEqual(standardTestOrder.userID);
    expect(result[0].complete).toBeFalse;
  });

  it('show by user and status method should return the correct order', async () => {
    const result = await orderStore.showByUserAndStatus('1', false) as Order[];
    expect(result[0].id).toEqual(1);
    expect(result[0].userID).toEqual(standardTestOrder.userID);
    expect(result[0].complete).toBeFalse;
  });

  it('update order should update the order',async () => {
	  const updateOrder : Order = { id: 1,
		                						  userID: 1,
								                  complete: true,
								                  orderedProducts: []};
	  const result = await orderStore.update(updateOrder);
	  expect(result.id).toEqual(1);
    expect(result.userID).toEqual(standardTestOrder.userID);
    expect(result.complete).toBeTrue;
  });

  it('add product should update the associating table for a given product',async () => {
    await orderStore.addProduct(30, '1', '1');
    const result = await orderStore.show("1") as Order;
    expect(result.orderedProducts[0].product_id).toEqual('1');
    expect(result.orderedProducts[0].quantity).toEqual(30);
  });

});