import request from 'supertest';
import app from '../app';

describe('QueueSphere Server API Suite', () => {
  it('GET /api/v1/health - should return 200 OK and health payload', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toContain('QueueSphere API Service is healthy');
  });

  it('POST /api/v1/auth/login - should validate missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('email and password');
  });

  it('POST /api/v1/tokens/kiosk - should validate missing branchId', async () => {
    const res = await request(app).post('/api/v1/tokens/kiosk').send({
      priority: 'NORMAL',
    });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('POST /api/v1/tokens/call-next - should require authentication', async () => {
    const res = await request(app).post('/api/v1/tokens/call-next').send({});
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('Authentication required');
  });
});
