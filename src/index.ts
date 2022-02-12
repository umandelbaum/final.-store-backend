import express from 'express';
import usersRoutes from './handlers/usersHandler';
import loginRoutes from './handlers/loginHandler';
import cors from 'cors';
import dotenv from 'dotenv';
import {User, UserStore} from './model/usersModel'
import jwt from 'jsonwebtoken';
import productsRoutes from './handlers/productsHandler';
import ordersRoutes from './handlers/ordersHandler';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/users', usersRoutes);
app.use('/products', productsRoutes);
app.use('/login', loginRoutes);
app.use('/orders', ordersRoutes);

//Create default admin account upon startup to allow initial login and log JWT

const admin : User = {
    id: NaN,
    first_name: process.env.ADMIN_FIRST as string,
    last_name: process.env.ADMIN_LAST as string,
    password_digest: process.env.ADMIN_PASSWORD as string
}
const store = new UserStore;

app.listen(port, async (): Promise<void> => {
    try { 
        await store.create(admin);  
    } catch (err) {
        console.log(err)
    }
    console.log(`Server started at http://localhost:${port}/`); 
    console.log('Admin JWT: '+ jwt.sign({ user: admin }, process.env.TOKEN_SECRET as string));
});

export default app;
