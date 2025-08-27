import request from 'supertest';
import app from './index';

describe('Inventory API', () => {
  it('should return 200 for GET /api', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toBe(200);
  });
});