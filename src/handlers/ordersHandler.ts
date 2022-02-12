import express, {Request, Response} from 'express';
import { Order, OrderStore } from '../model/ordersModel';
import verifyAuthToken from '../services/auth';

const store = new OrderStore();
const ordersRoutes = express.Router();

ordersRoutes.get('/', verifyAuthToken, async (req: Request, res: Response):Promise<void> => {
    //First check parameters for what action is requested
    if (!req.query.user) { //First try default case of showing index
        try {
            const orders = await store.index();
            res.json(orders);
        } catch (err) {
            res.status(404).json(`${err}`);
        };
    //Next determine if it is just user and not user and complete
    } else if ((req.query.user) && (!req.query.status)) { 
        try {
            const orders = await store.showByUser(req.query.user as string);
            res.json(orders);
        } catch (err) {
            res.status(404).json(`${err}`);
        };
    //Next do the user and status query
    } else if ((req.query.user) && (req.query.status)) { 
        try {
            const orders = await store.showByUserAndStatus(
                                        req.query.user as string, 
                                        eval(req.query.status as string));
            res.json(orders);
        } catch (err) {
            res.status(404).json(`${err}`);
        };
    } else {
        res.status(404).json('Invalid query');
    }    
});
  
ordersRoutes.get('/:id', verifyAuthToken, async (req: Request, res: Response):Promise<void> => {    
    try{
        const user = await store.show(req.params.id);
        res.json(user);
    } catch (err) {
        res.status(404).json(`${err}`);
    }
});

export default ordersRoutes;