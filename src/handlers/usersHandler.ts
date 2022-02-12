import express, {Request, Response} from 'express';
import { User, UserStore } from '../model/usersModel';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import verifyAuthToken from '../services/auth';

dotenv.config();

const store = new UserStore();
const usersRoutes = express.Router();

usersRoutes.get('/', verifyAuthToken, async (_req: Request, res: Response) => {
    const users = await store.index();
    res.json(users);
});
  
usersRoutes.get('/:id', verifyAuthToken, async (req: Request, res: Response) => {    
    try{
        const user = await store.show(req.params.id);
        if (user != null) {
            res.json(user);
        } else {
            res.status(404).json(`User id #${req.params.id} not found.`)
        }
    } catch (err) {
        res.status(404).json(`${err}`);
    }
});
  
usersRoutes.post('/', verifyAuthToken, async (req: Request, res: Response) => {
    //First validate input
    if (!(req.body.first_name&&req.body.last_name&&req.body.password)){
        res.json("Insufficient information to create user");
        return;
    }    
    const user: User = {
        id: NaN,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password_digest: req.body.password,
    }
    try {
        const newUser = await store.create(user);
        if (newUser != null) {
            var token = jwt.sign({ user: newUser }, process.env.TOKEN_SECRET as string);
            res.json(token);
        } else {
            res.json('Username taken');
        }
    } catch(err) {
        res.status(400);
        res.json(`${err}` + user);
    }
});

export default usersRoutes;