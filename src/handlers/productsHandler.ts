import express, {Request, Response} from 'express';
import { Product, ProductStore } from '../model/productsModel';
import verifyAuthToken from '../services/auth';

const store = new ProductStore();
const productsRoutes = express.Router();

productsRoutes.get('/', async (req: Request, res: Response):Promise<void> => {
    //First check parameters for what action is requested
    if ((!req.query.ranked) && (!req.query.category)){ //First try default case
        try {
            const products = await store.index();
            res.json(products);
        } catch (err) {
            res.status(404).json(`${err}`);
        };
    } else if (req.query.ranked) { //Next do the top ranked products, overriding category
        try {
            const products = await store.topProducts(parseInt(req.query.ranked as string));
            res.json(products);
        } catch (err) {
            res.status(404).json(`${err}`);
        };
    } else if (req.query.category) { //Finally do the 'search by category' actvitiy
        try {
            const products = await store.showCategory(req.query.category as string);
            res.json(products);
        } catch (err) {
            res.status(404).json(`${err}`);
        };
    } else {
        res.status(404).json('Invalid query');
    }    
});
  
productsRoutes.get('/:id', async (req: Request, res: Response):Promise<void> => {    
    try{
        const user = await store.show(req.params.id);
        if (user != null) {
            res.json(user);
        } else {
            res.status(404).json(`Product id #${req.params.id} not found.`)
        }
    } catch (err) {
        res.status(404).json(`${err}`);
    }
});
  
productsRoutes.post('/', verifyAuthToken, async (req: Request, res: Response):Promise<void> => {
    //First validate input
    if (!(req.body.name&&req.body.price&&req.body.category)){
        res.json("Insufficient information to create product");
        return;
    }    
    const p: Product = {
        id: NaN,
        name: req.body.name,
        price: req.body.price as number,
        category: req.body.category
    }
    try {
        const newProduct = await store.create(p);        
        res.json(newProduct[0]);
    } catch(err) {
        res.status(400);
        res.json(`${err}` + p);
    }
});

export default productsRoutes;