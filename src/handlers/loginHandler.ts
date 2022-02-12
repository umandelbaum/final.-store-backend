import express, {Request, Response} from 'express';
import { UserStore } from '../model/usersModel';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const store = new UserStore();
const loginRoutes = express.Router();

loginRoutes.post('/', async (req: Request, res: Response) => {
    try {
        const newUser = await store.authenticate(req.body.first_name, req.body.last_name, req.body.password);
        if (newUser != null) {
            var token = jwt.sign({ user: newUser }, process.env.TOKEN_SECRET as string);
            res.json(token);
        } else {
            res.json("Bad username/password combination");
        }
    } catch(err) {
        res.status(400);
        res.json(`${err}`);
    }
});

export default loginRoutes;