import request from 'supertest';
import app from './index';

describe('Inventory API', () => {
  it('should return 200 for GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});