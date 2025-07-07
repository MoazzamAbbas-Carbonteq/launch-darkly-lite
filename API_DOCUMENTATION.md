# LaunchDarkly Lite API Documentation

## Overview

This document provides comprehensive API documentation for the LaunchDarkly Lite feature flag management system. The API is built using **Effect.js**, **Clean Architecture principles**, and **functional programming patterns**, providing a robust, type-safe, and maintainable interface for managing feature flags and user authentication.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [OpenAPI Specification](#openapi-specification)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)
- [Client Generation](#client-generation)
- [Development Tools](#development-tools)

## 🏗️ Architecture Overview

The API follows **Clean Architecture** principles with **Effect.js** for functional programming:

### Key Architectural Patterns

- **Domain-Driven Design**: Business logic is encapsulated in domain entities
- **Repository Pattern**: Data access abstraction with Effect.js
- **Use Cases**: Single-responsibility business operations
- **Functional Programming**: Pure functions with Effect.js
- **Type Safety**: Full TypeScript coverage with Effect.js types
- **Dependency Injection**: Effect.js Context for DI
- **Composable Error Handling**: Effect.js error composition

### Layer Structure

```
Controllers (HTTP Layer)
    ↓
Application Services (Use Cases)
    ↓
Domain Layer (Business Logic)
    ↓
Infrastructure (Data Access)
```

## 🚀 Getting Started

### Base URLs

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.launchdarkly-lite.com/api`

### Content Type

All requests should use `application/json` content type.

### Response Format

All responses follow a consistent structure:

```json
{
  "success": boolean,
  "data": any,           // Present on successful requests
  "error": string,       // Present on failed requests
  "message": string      // Optional descriptive message
}
```

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. **Register** a new account or **login** with existing credentials
2. The response will include a `token` field
3. Use this token for subsequent authenticated requests

### Token Expiration

- Tokens expire after **24 hours** (configurable)
- You'll need to login again to get a new token
- Expired tokens will return a `401 Unauthorized` response

## 🛠 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/register` | User registration | No |
| POST | `/auth/logout` | User logout | No |
| GET | `/auth/profile` | Get user profile | Yes |

### Feature Flag Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/flags` | Get all flags | Yes | No |
| GET | `/flags/{key}` | Get flag by key | Yes | No |
| POST | `/flags` | Create flag | Yes | Yes |
| PUT | `/flags/{id}` | Update flag | Yes | Yes |
| DELETE | `/flags/{id}` | Delete flag | Yes | Yes |
| POST | `/flags/evaluate/{key}` | Evaluate flag | No | No |

### User Management Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/users` | Create user | Yes | Yes |
| GET | `/users/{id}` | Get user by ID | Yes | No |

## 📖 OpenAPI Specification

The complete API specification is available in the `openapi.yaml` file. You can:

### View the Documentation

1. **Swagger UI**: Visit `http://localhost:3000/docs` for interactive documentation
2. **Raw Spec**: Access `http://localhost:3000/api/openapi.json` for the JSON specification
3. **YAML File**: View the complete `openapi.yaml` file in the project root

### Available Documentation Scripts

```bash
# Serve API documentation locally
npm run docs:serve

# Validate OpenAPI specification
npm run docs:validate

# Generate TypeScript client
npm run docs:generate-client
```

## ⚠️ Error Handling

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (resource already exists)
- **500**: Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

### Common Error Scenarios

1. **Invalid JWT Token**
   ```json
   {
     "success": false,
     "error": "Invalid or expired token"
   }
   ```

2. **Validation Error**
   ```json
   {
     "success": false,
     "error": "Validation failed: Email is required and must be a string"
   }
   ```

3. **Resource Not Found**
   ```json
   {
     "success": false,
     "error": "Feature flag not found"
   }
   ```

4. **Permission Denied**
   ```json
   {
     "success": false,
     "error": "Admin role required for this operation"
   }
   ```

## 🔄 Rate Limiting

Rate limiting is applied to prevent abuse:

- **Authentication endpoints**: 10 requests per minute per IP
- **Feature flag evaluation**: 1000 requests per minute per IP
- **Other endpoints**: 100 requests per minute per authenticated user

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (Unix timestamp)

## 📝 Examples

### 1. User Registration and Login

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'

# Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 2. Feature Flag Management

```bash
# Create a feature flag (Admin only)
curl -X POST http://localhost:3000/api/flags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "key": "new-checkout-flow",
    "name": "New Checkout Flow",
    "description": "Enable the new checkout flow for users",
    "enabled": true,
    "defaultValue": false,
    "rules": [
      {
        "type": "user_id",
        "conditions": [
          {
            "field": "userId",
            "operator": "equals",
            "value": "user123"
          }
        ],
        "value": true,
        "priority": 1
      },
      {
        "type": "percentage",
        "conditions": [
          {
            "field": "percentage",
            "operator": "less_than",
            "value": "25"
          }
        ],
        "value": true,
        "priority": 2
      }
    ]
  }'

# Get all flags
curl -X GET http://localhost:3000/api/flags \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get specific flag by key
curl -X GET http://localhost:3000/api/flags/new-checkout-flow \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Feature Flag Evaluation

```bash
# Evaluate a flag (Public endpoint)
curl -X POST http://localhost:3000/api/flags/evaluate/new-checkout-flow \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "userEmail": "user@example.com",
    "userRole": "user",
    "attributes": {
      "plan": "premium",
      "country": "US",
      "version": "1.2.0"
    }
  }'

# Response
{
  "success": true,
  "data": {
    "flagKey": "new-checkout-flow",
    "enabled": true,
    "reason": "matched_rule",
    "ruleId": "rule-uuid",
    "value": true
  }
}
```

### 4. User Management

```bash
# Create a new user (Admin only)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepassword123",
    "name": "Jane Smith",
    "role": "user"
  }'

# Get user profile
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get user by ID
curl -X GET http://localhost:3000/api/users/user-uuid-here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Client Generation

Generate client SDKs using OpenAPI Generator:

```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
npm run docs:generate-client

# Or manually:
openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./client/typescript

# Generate Python client
openapi-generator-cli generate \
  -i openapi.yaml \
  -g python \
  -o ./client/python

# Generate other clients (Java, C#, etc.)
openapi-generator-cli generate \
  -i openapi.yaml \
  -g java \
  -o ./client/java
```

### Using Generated TypeScript Client

```typescript
import { Configuration, DefaultApi } from './client/typescript';

const config = new Configuration({
  basePath: 'http://localhost:3000/api',
  accessToken: 'your-jwt-token'
});

const api = new DefaultApi(config);

// Login
const loginResponse = await api.login({
  email: 'user@example.com',
  password: 'password123'
});

// Create flag
const flag = await api.createFlag({
  key: 'new-feature',
  name: 'New Feature',
  description: 'A new feature flag',
  enabled: true,
  defaultValue: false
});

// Evaluate flag
const evaluation = await api.evaluateFlag('new-feature', {
  userId: 'user123',
  userEmail: 'user@example.com'
});
```

## 🛠 Development Tools

### Recommended Tools

1. **Postman**: Import the OpenAPI spec for easy API testing
2. **Insomnia**: Alternative REST client with OpenAPI support
3. **curl**: Command-line testing
4. **HTTPie**: User-friendly command-line HTTP client
5. **Swagger Editor**: Edit and validate OpenAPI specifications

### Testing with HTTPie

```bash
# Install HTTPie
pip install httpie

# Login
http POST localhost:3000/api/auth/login email=admin@example.com password=password123

# Create flag with token
http POST localhost:3000/api/flags \
  Authorization:"Bearer YOUR_TOKEN" \
  key=test-flag \
  name="Test Flag" \
  enabled:=true \
  defaultValue:=false

# Evaluate flag
http POST localhost:3000/api/flags/evaluate/test-flag \
  userId=user123 \
  userEmail=user@example.com
```

### Development Scripts

```bash
# Start development server with hot reload
npm run dev

# Build the project
npm run build

# Run production server
npm start

# Generate API documentation
npm run docs:serve

# Validate OpenAPI specification
npm run docs:validate
```

## 🏗 Architecture Implementation Details

### Effect.js Integration

The API heavily uses Effect.js for:

#### Use Cases
```typescript
// Example use case implementation
export const createFeatureFlagUseCase = (
  dto: CreateFeatureFlagRequestDto,
  featureFlagRepository: FeatureFlagRepository
): Effect.Effect<FeatureFlagResponseDto, Error> =>
  pipe(
    validateCreateFeatureFlagRequest(dto),
    Effect.flatMap((validatedDto) => featureFlagRepository.create(validatedDto)),
    Effect.map((flag) => toFeatureFlagResponseDto(flag))
  );
```

#### Repository Pattern
```typescript
// Repository interface (domain layer)
export interface FeatureFlagRepository {
  findById(id: string): Effect.Effect<FeatureFlagEntity | null, Error>;
  findByKey(key: string): Effect.Effect<FeatureFlagEntity | null, Error>;
  create(flagData: CreateFeatureFlagData): Effect.Effect<FeatureFlagEntity, Error>;
  // ...
}

// Repository implementation (infrastructure layer)
export const createFeatureFlagRepositoryImpl = (
  repository: Repository<FeatureFlagModel>
): FeatureFlagRepository => ({
  findById: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const flag = await repository.findOne({ where: { id } });
        return flag;
      },
      catch: (e) => new Error(`Failed to find feature flag: ${String(e)}`),
    }),
  // ...
});
```

#### Dependency Injection
```typescript
// Context setup
export const AppContextLive = Layer.mergeAll(
  UserRepositoryLive,
  FeatureFlagRepositoryLive,
  UserServiceLive,
  FeatureFlagServiceLive
);

// Usage in controllers
const result = await Effect.runPromise(
  pipe(
    featureFlagService.createFeatureFlag(dto),
    Effect.provide(AppContextLive)
  )
);
```

### Clean Architecture Benefits

1. **Testability**: Easy to test with mock dependencies
2. **Maintainability**: Clear separation of concerns
3. **Scalability**: Modular design allows easy extension
4. **Type Safety**: Full TypeScript coverage with Effect.js
5. **Error Handling**: Composable error types with Effect.js

## 📞 Support

For API support and questions:

- **Documentation**: Check the interactive Swagger UI at `/docs`
- **Issues**: Report issues in the project repository
- **Examples**: Reference this documentation for implementation examples

## 📚 Additional Resources

- [Effect.js Documentation](https://effect.website/)
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [OpenAPI Specification](https://swagger.io/specification/)
- [TypeORM Documentation](https://typeorm.io/)
- [Express.js Documentation](https://expressjs.com/) 