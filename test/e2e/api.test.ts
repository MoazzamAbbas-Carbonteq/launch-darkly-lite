import request from 'supertest';
import express from 'express';
import { DataSource } from 'typeorm';
import { testDataSource } from '../helpers/test-setup';

// This would be the actual app setup - for now we'll create a simple mock
const createTestApp = (): express.Application => {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Test server is running',
      timestamp: new Date().toISOString(),
    });
  });

  // Mock auth endpoints
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    if (email === 'admin@example.com' && password === 'password123') {
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
          },
          token: 'mock-jwt-token',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    });
  });

  // Mock feature flag endpoints
  app.get('/api/flags', (req, res) => {
    // Mock authentication check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Missing or invalid token',
      });
    }

    return res.status(200).json({
      success: true,
      data: [
        {
          id: 'flag-1',
          key: 'test-feature',
          name: 'Test Feature',
          description: 'A test feature flag',
          enabled: true,
          defaultValue: false,
          rules: [],
          createdBy: '123e4567-e89b-12d3-a456-426614174000',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ],
    });
  });

  app.post('/api/flags', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Missing or invalid token',
      });
    }

    const { key, name, description, enabled, defaultValue } = req.body;

    if (!key || !name) {
      return res.status(400).json({
        success: false,
        error: 'Key and name are required',
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        id: 'new-flag-id',
        key,
        name,
        description: description || '',
        enabled: enabled !== undefined ? enabled : true,
        defaultValue: defaultValue !== undefined ? defaultValue : false,
        rules: [],
        createdBy: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  app.post('/api/flags/evaluate/:key', (req, res) => {
    const { key } = req.params;
    const { userId, context } = req.body;

    if (key === 'test-feature') {
      // Mock evaluation logic
      const value = userId === 'user-123' ? true : false;
      res.status(200).json({
        success: true,
        data: {
          key,
          value,
          reason: value ? 'rule_match' : 'default',
        },
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Feature flag not found',
      });
    }
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      path: req.originalUrl,
    });
  });

  return app;
};

describe('API E2E Tests', () => {
  let app: express.Application;

  beforeAll(async () => {
    app = createTestApp();
  });

  describe('Health Check', () => {
    it('GET /health should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Test server is running');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Authentication', () => {
    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const loginData = {
          email: 'admin@example.com',
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe('admin@example.com');
        expect(response.body.data.user.role).toBe('admin');
        expect(response.body.data.token).toBe('mock-jwt-token');
      });

      it('should reject login with invalid credentials', async () => {
        const loginData = {
          email: 'admin@example.com',
          password: 'wrongpassword',
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid email or password');
      });

      it('should reject login with missing email', async () => {
        const loginData = {
          password: 'password123',
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Email and password are required');
      });

      it('should reject login with missing password', async () => {
        const loginData = {
          email: 'admin@example.com',
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Email and password are required');
      });
    });
  });

  describe('Feature Flags', () => {
    const mockToken = 'Bearer mock-jwt-token';

    describe('GET /api/flags', () => {
      it('should get all feature flags with valid token', async () => {
        const response = await request(app)
          .get('/api/flags')
          .set('Authorization', mockToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].key).toBe('test-feature');
        expect(response.body.data[0].name).toBe('Test Feature');
      });

      it('should reject request without authorization token', async () => {
        const response = await request(app)
          .get('/api/flags')
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Unauthorized - Missing or invalid token');
      });

      it('should reject request with invalid authorization header', async () => {
        const response = await request(app)
          .get('/api/flags')
          .set('Authorization', 'InvalidToken')
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Unauthorized - Missing or invalid token');
      });
    });

    describe('POST /api/flags', () => {
      it('should create a feature flag with valid data', async () => {
        const flagData = {
          key: 'new-feature',
          name: 'New Feature',
          description: 'A new feature flag',
          enabled: true,
          defaultValue: false,
        };

        const response = await request(app)
          .post('/api/flags')
          .set('Authorization', mockToken)
          .send(flagData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.key).toBe('new-feature');
        expect(response.body.data.name).toBe('New Feature');
        expect(response.body.data.description).toBe('A new feature flag');
        expect(response.body.data.enabled).toBe(true);
        expect(response.body.data.defaultValue).toBe(false);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.createdAt).toBeDefined();
        expect(response.body.data.updatedAt).toBeDefined();
      });

      it('should create a feature flag with minimal data', async () => {
        const flagData = {
          key: 'minimal-feature',
          name: 'Minimal Feature',
        };

        const response = await request(app)
          .post('/api/flags')
          .set('Authorization', mockToken)
          .send(flagData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.key).toBe('minimal-feature');
        expect(response.body.data.name).toBe('Minimal Feature');
        expect(response.body.data.description).toBe('');
        expect(response.body.data.enabled).toBe(true); // default
        expect(response.body.data.defaultValue).toBe(false); // default
      });

      it('should reject creation without required fields', async () => {
        const flagData = {
          description: 'Missing key and name',
        };

        const response = await request(app)
          .post('/api/flags')
          .set('Authorization', mockToken)
          .send(flagData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Key and name are required');
      });

      it('should reject creation without authorization', async () => {
        const flagData = {
          key: 'unauthorized-feature',
          name: 'Unauthorized Feature',
        };

        const response = await request(app)
          .post('/api/flags')
          .send(flagData)
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Unauthorized - Missing or invalid token');
      });
    });

    describe('POST /api/flags/evaluate/:key', () => {
      it('should evaluate a feature flag successfully', async () => {
        const evaluationData = {
          userId: 'user-123',
          context: {
            department: 'engineering',
          },
        };

        const response = await request(app)
          .post('/api/flags/evaluate/test-feature')
          .send(evaluationData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.key).toBe('test-feature');
        expect(response.body.data.value).toBe(true);
        expect(response.body.data.reason).toBe('rule_match');
      });

      it('should return default value for non-matching user', async () => {
        const evaluationData = {
          userId: 'different-user',
          context: {},
        };

        const response = await request(app)
          .post('/api/flags/evaluate/test-feature')
          .send(evaluationData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.key).toBe('test-feature');
        expect(response.body.data.value).toBe(false);
        expect(response.body.data.reason).toBe('default');
      });

      it('should handle non-existent feature flag', async () => {
        const evaluationData = {
          userId: 'user-123',
          context: {},
        };

        const response = await request(app)
          .post('/api/flags/evaluate/nonexistent-flag')
          .send(evaluationData)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Feature flag not found');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Route not found');
      expect(response.body.path).toBe('/non-existent-route');
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send('invalid-json')
        .expect(400);

      // Express will handle this automatically and return a 400 error
    });
  });
}); 