import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { UserModel } from '@infrastructure/database/models/User.model';
import { FeatureFlagModel } from '@infrastructure/database/models/FeatureFlag.model';
import { FlagRuleModel } from '@infrastructure/database/models/FlagRule.model';
import { FlagConditionModel } from '@infrastructure/database/models/FlagCondition.model';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Test database configuration
export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  logging: false,
  entities: [UserModel, FeatureFlagModel, FlagRuleModel, FlagConditionModel],
});

// Global test setup
beforeAll(async () => {
  if (!testDataSource.isInitialized) {
    await testDataSource.initialize();
  }
});

afterAll(async () => {
  if (testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
});

// Clean database before each test
beforeEach(async () => {
  if (testDataSource.isInitialized) {
    const entities = testDataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = testDataSource.getRepository(entity.name);
      await repository.clear();
    }
  }
});

// Test utilities
export const createTestUser = async (overrides?: Partial<UserModel>) => {
  const userRepository = testDataSource.getRepository(UserModel);
  const user = userRepository.create({
    email: 'test@example.com',
    password: 'hashedpassword',
    name: 'Test User',
    role: 'user' as any,
    ...overrides,
  });
  return await userRepository.save(user);
};

export const createTestFeatureFlag = async (overrides?: Partial<FeatureFlagModel>) => {
  const flagRepository = testDataSource.getRepository(FeatureFlagModel);
  const flag = flagRepository.create({
    key: 'test-flag',
    name: 'Test Flag',
    description: 'A test feature flag',
    enabled: true,
    defaultValue: false,
    rules: [],
    createdBy: 'test-user-id',
    ...overrides,
  });
  return await flagRepository.save(flag);
}; 