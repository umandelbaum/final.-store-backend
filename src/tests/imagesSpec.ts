import supertest from 'supertest';
import app from '../index';

const request = supertest(app);

describe('Test images endpoint responses', async () => {
    it('ensures get/images returns correctly', async () => {
        const response = await request.get('/api/images');
        expect(response.status).toBe(200);
    });

    it('ensures the get/<filename> returns correctly', async () => {
        const response = await request.get(`/api/images/image1.jpg`);
        expect(response.status).toBe(200);
    });

    it('ensures the get/<filename> returns a 404 for a fake file', async () => {
        const response = await request.get(`/api/images/fakeimage.jpb`);
        expect(response.status).toBe(404);
    });

    it('ensures the get/<filename>?height=400&width=600 returns a good file', async () => {
        const response = await request.get(
            `/api/images/image1.jpg?height=400&width=600`
        );
        expect(response.status).toBe(200);
    });

    it('ensures an invalid width/height returns an error', async () => {
        const response = await request.get(
            `/api/images/image1.jpg?height=andy&width=bob`
        );
        expect(response.status).toBe(422);
    });
});
