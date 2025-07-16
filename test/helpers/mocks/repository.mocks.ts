import { Effect } from 'effect';

// Mock factory functions for consistent mocking across tests

export const createMockEffect = {
  succeed: <T>(value: T) => Effect.succeed(value),
  fail: (error: Error) => Effect.fail(error),
  async: <T>(value: T) => Effect.tryPromise({
    try: () => Promise.resolve(value),
    catch: (e) => new Error(String(e))
  })
};

// Base mock repository creator
export const createBaseMockRepository = () => ({
  findById: jest.fn(() => createMockEffect.succeed(null)),
  findAll: jest.fn(() => createMockEffect.succeed([])),
  create: jest.fn((data: any) => createMockEffect.succeed(data)),
  update: jest.fn((id: string, data: any) => createMockEffect.succeed({ id, ...data })),
  delete: jest.fn(() => createMockEffect.succeed(true))
});

// Specialized mock creators
export const createMockUserRepository = () => ({
  ...createBaseMockRepository(),
  findByEmail: jest.fn(() => createMockEffect.succeed(null)),
  findByEmailWithPassword: jest.fn(() => createMockEffect.succeed(null))
});

export const createMockFeatureFlagRepository = () => ({
  ...createBaseMockRepository(),
  findByKey: jest.fn(() => createMockEffect.succeed(null))
});

// Test data factories
export const createTestUser = (overrides: any = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides
});

export const createTestFeatureFlag = (overrides: any = {}) => ({
  id: 'test-flag-id',
  key: 'test-feature',
  name: 'Test Feature',
  description: 'A test feature flag',
  enabled: true,
  defaultValue: false,
  rules: [],
  createdBy: 'test-user-id',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides
});

// Reset all mocks helper
export const resetAllMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
}; 