import { User, UserStore } from '../../model/usersModel';
import app from '../../index';
import supertest from 'supertest';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import exp from 'constants';

dotenv.config();

const request = supertest(app);
const store = new UserStore();

const testUser: User = {
  id: NaN,
  first_name: 'testfirst',
  last_name: 'testLast',
  password_digest: 'testPass'
};

const pepper = process.env.BCRYPT_PASSWORD as string;
const saltRounds = process.env.SALT_ROUNDS as string;
const admin_pass = process.env.ADMIN_PASSWORD as string;
const hash = bcrypt.hashSync(admin_pass + pepper, parseInt(saltRounds));
const adminUser : User = {
  id: 1,
  first_name: process.env.ADMIN_FIRST as string,
  last_name: process.env.ADMIN_LAST as string,
  password_digest: hash
}

describe("User Model Tests", () => {

  it('should have an index method', () => {
    expect(store.index).toBeDefined();
  });

  it('should have a show method', () => {
    expect(store.show).toBeDefined();
  });

  it('should have a create method', () => {
    expect(store.create).toBeDefined();
  });

  it('create method should add a user', async () => {
    const result = await store.create(testUser) as User;
    expect(result.first_name).toEqual(testUser.first_name);
    expect(result.last_name).toEqual(testUser.last_name);
    expect(bcrypt.compareSync(testUser.password_digest+pepper, result.password_digest)).toBeTrue;      
  });

  it('create user should return null for a user that already exists',async () => {
    const result = await store.create(testUser) as User;
    expect(result).toBeNull;
  });

  it('index method should return a list of users', async () => {
    const result = await store.index();
    expect(result[0].first_name).toEqual(adminUser.first_name);       
    expect(result[0].last_name).toEqual(adminUser.last_name);  
    expect(bcrypt.compareSync(adminUser.password_digest, result[0].password_digest)).toBeTrue;
  });

  it('show method should return the correct user', async () => {
    const result = await store.show("1") as User; 
    expect(result.first_name).toEqual(adminUser.first_name);
    expect(result.last_name).toEqual(adminUser.last_name);
    expect(bcrypt.compareSync(adminUser.password_digest, result.password_digest)).toBeTrue; 
  });

  it('show method should return null for non-existent user', async () => {
    const result = await store.show("30");
    expect(result).toBeNull;
  });

  it('autheticate method should return user for good auth',async () => {
    const result = await store.authenticate(testUser.first_name, 
                                            testUser.last_name, 
                                            testUser.password_digest) as User;
    expect(result.first_name).toEqual(testUser.first_name);
    expect(result.last_name).toEqual(testUser.last_name);
    expect(bcrypt.compareSync(testUser.password_digest+pepper, result.password_digest)).toBeTrue;                                            
  });

  it('autheticate method should return null for bad auth',async () => {
    const result = await store.authenticate(testUser.first_name, 
                                            testUser.last_name, 
                                            testUser.password_digest+'badpass');
    expect(result).toBeNull;                                            
  });
});