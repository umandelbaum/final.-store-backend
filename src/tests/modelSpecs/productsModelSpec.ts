import { Product, ProductListEntry, ProductStore } from '../../model/productsModel';
import { Order, OrderStore} from '../../model/ordersModel';
import app from '../../index';
import supertest from 'supertest';

const request = supertest(app);
const store = new ProductStore();
const orderStore = new OrderStore();

const testProduct: Product = {
  id: NaN,
  name: 'testName',
  price: 2.35,
  category: 'testCategory'
};

const testOrder: Order = {
  id: NaN,
  userID: 1,
  complete: false,
  orderedProducts: []
}

describe("Product Model Tests", () => {

  it('should have an index method', () => {
    expect(store.index).toBeDefined();
  });

  it('should have a show method', () => {
    expect(store.show).toBeDefined();
  });

  it('should have a create method', () => {
    expect(store.create).toBeDefined();
  });

  it('create method should add a product', async () => {
    const result = await store.create(testProduct);
    expect(result[0].name).toEqual(testProduct.name);
    expect(result[0].price as unknown).toEqual('$'+`${testProduct.price}`);
    expect(result[0].category).toEqual(testProduct.category);
  });

  it('index method should return a list of products', async () => {
    const result = await store.index();  
    expect(result[0].id).toEqual(1);
    expect(result[0].name).toEqual(testProduct.name);
    expect(result[0].price as unknown).toEqual('$'+`${testProduct.price}`);
    expect(result[0].category).toEqual(testProduct.category);
  });

  it('show method should return the correct product', async () => {
    const result = await store.show("1") as Product;
    expect(result.id).toEqual(1);
    expect(result.name).toEqual(testProduct.name);
    expect(result.price as unknown).toEqual('$'+`${testProduct.price}`);
    expect(result.category).toEqual(testProduct.category);
  });

  it('show method should return null for non-existent product', async () => {
    const result = await store.show("3");
    expect(result).toBeNull;
  });

  it('show category method should return a list of products by category',async () => {
    const result = await store.showCategory('testCategory');
    expect(result[0].id).toEqual(1);
    expect(result[0].name).toEqual(testProduct.name);
    expect(result[0].price as unknown).toEqual('$'+`${testProduct.price}`);
    expect(result[0].category).toEqual(testProduct.category);
  });

  it('top product method should return the top products up to a given limit',async () => {
    await orderStore.create(testOrder);
    await orderStore.addProduct(30, '1', '1');
    const result: ProductListEntry[] = await store.topProducts(1);
    expect(result[0].name).toEqual(testProduct.name);
  });
});