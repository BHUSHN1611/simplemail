const request = require('supertest');
const app = require('../index');

describe('Integration Tests', () => {
  describe('CORS Configuration', () => {
    it('should allow requests from allowed origins', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:5173');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('CORS test successful');
    });

    it('should block requests from disallowed origins', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://malicious-site.com');

      expect(response.status).toBe(500);
    });
  });

  describe('Authentication Routes', () => {
    it('should return 400 for missing email or app password', async () => {
      const response = await request(app)
        .post('/auth/app-login')
        .send({
          email: '',
          appPassword: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing email or appPassword');
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });
  });

  describe('Email Routes', () => {
    it('should return 401 for missing authorization header', async () => {
      const response = await request(app)
        .post('/email/send')
        .send({
          to: 'test@example.com',
          subject: 'Test',
          body: 'Test body'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No authorization header provided');
    });

    it('should return 401 for invalid token format', async () => {
      const response = await request(app)
        .post('/email/send')
        .set('Authorization', 'Bearer invalid-token-format')
        .send({
          to: 'test@example.com',
          subject: 'Test',
          body: 'Test body'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token verification failed');
    });
  });
});
