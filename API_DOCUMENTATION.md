# LaunchDarkly Lite API Documentation

## Overview

This document provides comprehensive API documentation for the LaunchDarkly Lite feature flag management system. The API is built using **Effect.js** and **functional programming principles**, providing a robust and type-safe interface for managing feature flags and user authentication.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [OpenAPI Specification](#openapi-specification)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)
- [SDKs and Tools](#sdks-and-tools)

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

Tokens expire after 24 hours. You'll need to login again to get a new token.

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
| POST | `/flags` | Create flag | Yes | Yes |
| GET | `/flags/{key}` | Get flag by key | Yes | No |
| PUT | `/flags/{id}` | Update flag | Yes | Yes |
| DELETE | `/flags/{id}` | Delete flag | Yes | Yes |
| POST | `/flags/evaluate/{key}` | Evaluate flag | No | No |

### User Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users` | Create user | No |
| GET | `/users/{id}` | Get user by ID | No |

## 📖 OpenAPI Specification

The complete API specification is available in the `openapi.yaml` file. You can:

### View the Documentation

1. **Swagger UI**: Open the `openapi.yaml` file in [Swagger Editor](https://editor.swagger.io/)
2. **Redoc**: Use [Redoc](https://redocly.github.io/redoc/) for a different documentation format
3. **Postman**: Import the OpenAPI spec directly into Postman

### Generate SDKs

Use the OpenAPI specification to generate client SDKs:

```bash
# Generate JavaScript SDK
openapi-generator-cli generate -i openapi.yaml -g javascript -o ./sdk/javascript

# Generate Python SDK
openapi-generator-cli generate -i openapi.yaml -g python -o ./sdk/python

# Generate TypeScript SDK
openapi-generator-cli generate -i openapi.yaml -g typescript-fetch -o ./sdk/typescript
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

## 🔄 Rate Limiting

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
      }
    ]
  }'

# Get all flags
curl -X GET http://localhost:3000/api/flags \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get specific flag
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
      "country": "US"
    }
  }'
```

### 4. JavaScript/TypeScript Example

```typescript
// Using fetch API
const API_BASE = 'http://localhost:3000/api';

// Login and get token
async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  return data.data.token;
}

// Evaluate feature flag
async function evaluateFlag(flagKey: string, userId: string) {
  const response = await fetch(`${API_BASE}/flags/evaluate/${flagKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  
  const data = await response.json();
  return data.data.enabled;
}

// Create feature flag (Admin only)
async function createFlag(token: string, flagData: any) {
  const response = await fetch(`${API_BASE}/flags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(flagData),
  });
  
  return response.json();
}
```

### 5. Python Example

```python
import requests
import json

API_BASE = 'http://localhost:3000/api'

def login(email, password):
    response = requests.post(f'{API_BASE}/auth/login', json={
        'email': email,
        'password': password
    })
    return response.json()['data']['token']

def evaluate_flag(flag_key, user_id):
    response = requests.post(f'{API_BASE}/flags/evaluate/{flag_key}', json={
        'userId': user_id
    })
    return response.json()['data']['enabled']

def create_flag(token, flag_data):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.post(f'{API_BASE}/flags', json=flag_data, headers=headers)
    return response.json()
```

## 🛠 SDKs and Tools

### Recommended Tools

1. **Postman**: Import the OpenAPI spec for easy API testing
2. **Insomnia**: Alternative REST client
3. **curl**: Command-line testing
4. **HTTPie**: User-friendly command-line HTTP client

### Client Libraries

Generate client libraries using OpenAPI Generator:

```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./client/typescript

# Generate Python client
openapi-generator-cli generate \
  -i openapi.yaml \
  -g python \
  -o ./client/python
```

## 🏗 Architecture Notes

This API is built using **functional programming principles** with **Effect.js**:

- **Pure functions**: All business logic is implemented as pure functions
- **Immutable data**: Domain entities are immutable
- **Type safety**: Full TypeScript support with Effect.js types
- **Error handling**: Composable error handling with Effect.js
- **Dependency injection**: Functional dependency injection patterns

### Key Benefits

1. **Predictable**: Pure functions make behavior predictable
2. **Testable**: Easy to test with mock dependencies
3. **Composable**: Functions can be easily composed
4. **Type-safe**: Full TypeScript support prevents runtime errors
5. **Maintainable**: Clear separation of concerns

## 📞 Support

For API support, please:

1. Check this documentation first
2. Review the OpenAPI specification
3. Create an issue in the GitHub repository
4. Contact support@launchdarkly-lite.com

## 📄 License

This API documentation is licensed under the MIT License. 