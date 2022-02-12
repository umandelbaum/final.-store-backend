import { Product } from "../../model/productsModel";
import { Order } from "../../model/ordersModel";

const standardTestOrder: Order = {
	id: 1,
	userID: 1,
	complete: false,
	orderedProducts: []
  }
  
const standardTestProduct: Product = {
	  id: 1,
	  name: 'testName',
	  price: 2.35,
	  category: 'testCategory'
};

export {standardTestOrder, standardTestProduct};