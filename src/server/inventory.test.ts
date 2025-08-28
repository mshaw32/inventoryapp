import request from 'supertest';
import { app, server, startServer } from './index';
import { closeDB } from './config/database';

describe('Inventory API', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await startServer();
  });

  it('should return 200 for GET /api', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toBe(200);
  });

  afterAll(async () => {
    if (server && server.close) {
      await new Promise((resolve) => server.close(resolve));
    }
    await closeDB();
  });
});