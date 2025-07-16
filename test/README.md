# LaunchDarkly Lite Test Suite

This directory contains comprehensive test cases for the LaunchDarkly Lite feature flag management system. The test suite follows the same clean architecture principles as the main application and provides comprehensive coverage of all layers.

## 📁 Test Structure

```
test/
├── domain/                     # Domain layer tests
│   ├── entities/              # Entity business logic tests
│   │   ├── User.entity.test.ts
│   │   └── FeatureFlag.entity.test.ts
│   └── repositories/          # Repository interface tests
├── application/               # Application layer tests
│   ├── use-cases/            # Use case business logic tests
│   │   ├── auth/             # Authentication use cases
│   │   ├── feature-flag/     # Feature flag use cases
│   │   └── user/             # User management use cases
│   ├── services/             # Application service tests
│   └── dto/                  # DTO validation tests
├── infrastructure/           # Infrastructure layer tests
│   ├── web/                  # Web layer tests
│   │   ├── controllers/      # HTTP controller tests
│   │   ├── middleware/       # Middleware tests
│   │   └── routes/           # Route definition tests
│   ├── database/             # Database layer tests
│   │   ├── repositories/     # Repository implementation tests
│   │   └── models/           # Database model tests
│   └── services/             # External service tests
├── integration/              # Integration tests
├── e2e/                      # End-to-end API tests
└── helpers/                  # Test utilities and setup
    ├── test-setup.ts         # Global test configuration
    └── mocks/                # Mock implementations
```

## 🧪 Testing Strategy

### Test Categories

1. **Unit Tests** (`domain/`, `application/`)
   - Test individual functions and business logic
   - Use mocked dependencies
   - Focus on business rules and validation
   - Fast execution

2. **Integration Tests** (`integration/`)
   - Test component interactions
   - Use real dependencies where possible
   - Test data flow between layers
   - Medium execution time

3. **End-to-End Tests** (`e2e/`)
   - Test complete user workflows
   - Use HTTP API endpoints
   - Test full application stack
   - Slower execution but high confidence

### Testing Principles

- **Effect.js Testing**: All tests work with Effect.js patterns using `Effect.runPromise()`
- **Functional Testing**: Pure functions are easier to test and reason about
- **Mock Strategies**: Strategic mocking of external dependencies
- **Data Isolation**: Each test uses fresh data and clean state
- **Type Safety**: Full TypeScript coverage in tests

## 🚀 Running Tests

### Prerequisites

```bash
# Install dependencies (including test dependencies)
npm install

# Ensure PostgreSQL is running for integration tests
docker-compose up -d postgres
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch, with coverage)
npm run test:ci

# Run specific test files
npm test -- User.entity.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should validate"

# Run tests in a specific directory
npm test -- test/domain/

# Run tests with verbose output
npm test -- --verbose
```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- `coverage/html/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI tools
- Terminal output shows summary

Target coverage: **85%+**

## 🔧 Test Configuration

### Jest Configuration

The Jest configuration is defined in `package.json`:

```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "roots": ["<rootDir>/test"],
    "setupFilesAfterEnv": ["<rootDir>/test/jest.setup.ts"],
    "moduleNameMapping": {
      "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
      "^@application/(.*)$": "<rootDir>/src/application/$1",
      "^@domain/(.*)$": "<rootDir>/src/domain/$1"
    }
  }
}
```

### Test Database

Tests use an in-memory SQLite database for fast, isolated testing:

```typescript
// test/helpers/test-setup.ts
export const testDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  logging: false,
  entities: [UserModel, FeatureFlagModel, FlagRuleModel, FlagConditionModel],
});
```

## 📋 Test Examples

### Entity Test Example

```typescript
// test/domain/entities/User.entity.test.ts
import { Effect } from 'effect';
import { createUserEntity, validateEmail } from '@domain/entities/User.entity';

describe('User Entity', () => {
  it('should create a user entity with valid data', () => {
    const user = createUserEntity('id', 'test@example.com', 'Test User', UserRole.USER);
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
  });

  it('should validate email format', async () => {
    const result = await Effect.runPromise(validateEmail('test@example.com'));
    expect(result).toBe('test@example.com');
  });
});
```

### Use Case Test Example

```typescript
// test/application/use-cases/auth/LoginUser.use-case.test.ts
import { loginUserUseCase } from '@application/use-cases/auth/LoginUser.use-case';

describe('LoginUser Use Case', () => {
  it('should login user with valid credentials', async () => {
    const mockRepository = createMockUserRepository();
    const loginRequest = { email: 'test@example.com', password: 'password123' };
    
    const result = await Effect.runPromise(loginUserUseCase(loginRequest, mockRepository));
    expect(result.user.email).toBe('test@example.com');
  });
});
```

### E2E Test Example

```typescript
// test/e2e/api.test.ts
import request from 'supertest';
import { app } from '../helpers/test-app';

describe('API E2E Tests', () => {
  it('should create feature flag via API', async () => {
    const response = await request(app)
      .post('/api/flags')
      .set('Authorization', 'Bearer mock-token')
      .send({ key: 'test-flag', name: 'Test Flag' })
      .expect(201);

    expect(response.body.data.key).toBe('test-flag');
  });
});
```

## 🛠️ Writing Tests

### Best Practices

1. **Descriptive Test Names**
   ```typescript
   it('should return default value when no rules match user context')
   ```

2. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should create feature flag with validation', async () => {
     // Arrange
     const flagData = { key: 'test', name: 'Test' };
     
     // Act
     const result = await Effect.runPromise(createFlag(flagData));
     
     // Assert
     expect(result.key).toBe('test');
   });
   ```

3. **Test Edge Cases**
   - Invalid inputs
   - Boundary conditions
   - Error scenarios
   - Empty states

4. **Mock External Dependencies**
   ```typescript
   const mockRepository = {
     findById: jest.fn().mockResolvedValue(Effect.succeed(mockUser)),
     create: jest.fn().mockResolvedValue(Effect.succeed(newUser)),
   };
   ```

5. **Clean Up After Tests**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

### Testing Effect.js Code

When testing Effect.js code, use `Effect.runPromise()`:

```typescript
// Testing Effect that succeeds
const result = await Effect.runPromise(myEffect);
expect(result).toBe(expectedValue);

// Testing Effect that fails
await expect(Effect.runPromise(myEffect)).rejects.toThrow('Error message');
```

## 🔍 Debugging Tests

### Common Issues

1. **Module Resolution**: Ensure path mappings are correct in `jest.config.js`
2. **Async Timing**: Use `await` with `Effect.runPromise()`
3. **Mock State**: Clear mocks between tests
4. **Database State**: Tests should be isolated and not depend on order

### Debug Commands

```bash
# Run tests with Node.js debugger
npm test -- --inspect-brk

# Run single test with debugging
npm test -- --testNamePattern="specific test" --verbose

# Show all test output
npm test -- --verbose --no-coverage
```

## 📊 Coverage Goals

| Layer | Target Coverage | Focus Areas |
|-------|----------------|-------------|
| Domain Entities | 95%+ | Business logic, validation |
| Use Cases | 90%+ | Business workflows |
| Services | 85%+ | Service orchestration |
| Controllers | 80%+ | HTTP handling |
| Repositories | 85%+ | Data access |
| Integration | 75%+ | Component interaction |

## 🔄 Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Release tags

CI Configuration ensures:
- All tests pass
- Coverage thresholds met
- No linting errors
- Type checking passes

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Effect.js Testing Guide](https://effect.website/docs/testing)
- [Supertest API Testing](https://github.com/visionmedia/supertest)
- [TypeScript Testing Best Practices](https://typescript-testing.netlify.app/)

---

For questions about testing patterns or adding new tests, refer to existing test examples or consult the team. 