# Launch Darkly Lite 🚀

A lightweight, production-ready feature flag server built with **TypeScript**, **Express**, **Effect.js**, **TypeORM**, and **Passport**. This server provides a robust, type-safe API for managing feature flags with advanced targeting rules, user authentication, and clean architecture principles.

## Features ✨

- 🎯 **Advanced Feature Flags** with complex targeting rules and conditions
- 🔐 **JWT Authentication** with Passport.js integration
- 🛡️ **Role-based Access Control** (Admin/User)
- 🗄️ **PostgreSQL Database** with TypeORM and migrations
- ⚡ **Effect.js** for functional programming, type safety, and error handling
- 🏗️ **Clean Architecture** with domain-driven design principles
- 🔒 **Security-first** with Helmet, CORS, and bcrypt
- 📝 **Request Logging** with Morgan
- 🔄 **Database Migrations** and automated seeding
- 📚 **OpenAPI/Swagger Documentation** with interactive UI
- 🐳 **Docker Support** for easy deployment
- 🧪 **Type-safe** with full TypeScript coverage

## Architecture 🏗️

The project follows **Clean Architecture** principles with **Effect.js** for functional programming:

```
src/
├── application/                # Application layer
│   ├── context/                # Effect.js context and dependency injection
│   ├── dto/                    # Data transfer objects with validation
│   ├── services/               # Application services
│   └── use-cases/              # Business use cases
├── domain/                     # Domain layer (business logic)
│   ├── entities/               # Domain entities with validation
│   └── repositories/           # Repository interfaces
├── infrastructure/             # Infrastructure layer
│   ├── web/                    # Web/API interface adapters
│   │   ├── controllers/        # Express controllers
│   │   ├── routes/             # API route definitions
│   │   ├── middleware/         # Express middleware
│   │   ├── types/              # TypeScript type definitions
│   │   ├── config/             # Web server configuration
│   │   └── index.ts            # Web server entry point
│   ├── database/               # Database configuration and persistence
│   │   ├── models/             # TypeORM entities
│   │   ├── repositories/       # Repository implementations
│   │   ├── migrations/         # Database migrations
│   │   ├── seeds/              # Database seed scripts
│   │   └── DataSource.config.ts# Database connection config
│   └── services/               # Infrastructure services (e.g., email, external APIs)
```

### Key Architectural Benefits

- **Pure Functions**: All business logic is implemented as pure functions
- **Immutable Data**: Domain entities are immutable
- **Type Safety**: Full TypeScript support with Effect.js types
- **Composable Error Handling**: Effect.js provides robust error composition
- **Dependency Injection**: Functional dependency injection with Effect.js Context
- **Testability**: Easy to test with mock dependencies

## Quick Start 🚀

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd launch-darkly-lite
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Set up PostgreSQL database**
```bash
# Option 1: Using Docker Compose (recommended)
docker-compose up -d postgres

# Option 2: Local PostgreSQL
createdb launch_darkly_lite

# Run migrations (if needed)
npm run migration:run
```

5. **Start the development server**
```bash
npm run dev
```

The server will start on `http://localhost:3000` with automatic database setup and seeding.

## Environment Configuration 🔧

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration | `24h` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | `test` |
| `DB_PASSWORD` | Database password | `test` |
| `DB_NAME` | Database name | `launch_darkly_lite` |
| `DEFAULT_FLAG_TTL` | Default flag TTL in seconds | `3600` |
| `MAX_FLAGS_PER_USER` | Maximum flags per user | `100` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

## Available Scripts 📜

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run clean        # Clean build directory

# Database Operations
npm run migration:generate -- MigrationName  # Generate new migration
npm run migration:run                        # Run pending migrations
npm run migration:revert                     # Revert last migration
npm run migration:show                       # Show migration status
npm run schema:sync                          # Sync schema (dev only)
npm run schema:drop                          # Drop schema (destructive)
npm run seed:run                             # Run database seeds

# Documentation
npm run docs:serve                           # Serve API documentation
npm run docs:validate                        # Validate OpenAPI spec
npm run docs:generate-client                 # Generate TypeScript client

# Architecture
npm run migrate:clean-architecture           # Migrate to clean architecture
```

## API Documentation 📚

### Interactive Documentation

- **Swagger UI**: `http://localhost:3000/docs`
- **OpenAPI Spec**: `http://localhost:3000/api/openapi.json`

The documentation includes:
- Complete API reference with examples
- Authentication flows
- Request/response schemas
- Error handling details
- Try-it-out functionality

### Quick API Overview

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/auth/login` | User login | No | - |
| POST | `/api/auth/register` | User registration | No | - |
| POST | `/api/auth/logout` | User logout | No | - |
| GET | `/api/auth/profile` | Get user profile | Yes | - |
| GET | `/api/flags` | Get all flags | Yes | - |
| GET | `/api/flags/:key` | Get flag by key | Yes | - |
| POST | `/api/flags` | Create flag | Yes | Admin |
| PUT | `/api/flags/:id` | Update flag | Yes | Admin |
| DELETE | `/api/flags/:id` | Delete flag | Yes | Admin |
| POST | `/api/flags/evaluate/:key` | Evaluate flag | No | - |
| POST | `/api/users` | Create user | Yes | Admin |
| GET | `/api/users/:id` | Get user by ID | Yes | - |

## Feature Flag System 🎯

### Rule Types
- `user_id`: Match specific user IDs
- `email`: Match user emails
- `role`: Match user roles
- `percentage`: Percentage-based rollout
- `custom_attribute`: Custom user attributes

### Condition Operators
- `equals`: Exact match
- `not_equals`: Not equal
- `contains`: String contains
- `not_contains`: String does not contain
- `greater_than`: Numeric comparison
- `less_than`: Numeric comparison
- `in`: Value in array
- `not_in`: Value not in array

### Example Flag Configuration
```json
{
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
}
```

## Database Schema 🗄️

### Core Tables

1. **users**
   - id (UUID, primary key)
   - email (unique)
   - password (hashed with bcrypt)
   - name, role (admin/user)
   - timestamps

2. **feature_flags**
   - id (UUID, primary key)
   - key (unique), name, description
   - enabled, defaultValue
   - createdBy (FK to users)
   - timestamps, expiresAt

3. **flag_rules**
   - id (UUID, primary key)
   - type, value, priority
   - featureFlagId (FK to feature_flags)

4. **flag_conditions**
   - id (UUID, primary key)
   - field, operator, value
   - ruleId (FK to flag_rules)

### Migration Management
The project uses TypeORM migrations for database schema management. See `DATABASE_OPERATIONS.md` for detailed migration workflows.

## Security 🔒

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable CORS settings
- **Input Validation**: Zod schemas for type-safe validation
- **Role-based Access**: Admin and user role system
- **SQL Injection Protection**: TypeORM query builder

## Default Credentials 🔑

For development purposes, the system includes a default admin user:

- **Email**: `admin@example.com`
- **Password**: `password123`

⚠️ **Change these credentials in production!**

## Docker Support 🐳

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# Or start the entire stack (when available)
docker-compose up -d
```

## Effect.js Integration ⚡

This project heavily uses Effect.js for:

- **Type-safe Error Handling**: Composable error types
- **Functional Programming**: Pure functions and immutable data
- **Dependency Injection**: Context-based DI system
- **Pipeline Operations**: Pipe and composition patterns
- **Async Operations**: Effect-based async handling

### Example Effect.js Usage

```typescript
// Use case with Effect.js
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

## Development Guidelines 📋

### Code Organization
- Follow clean architecture principles
- Use Effect.js for all business logic
- Implement repository pattern for data access
- Use DTOs for data transfer and validation
- Keep controllers thin (only handle HTTP concerns)

### Testing Strategy
- Unit tests for use cases and domain logic
- Integration tests for repositories
- E2E tests for API endpoints
- Mock dependencies using Effect.js context

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style and architecture
4. Add tests for new functionality
5. Update documentation as needed
6. Submit a pull request

## License 📄

This project is licensed under the ISC License.

## Related Documentation 📖

- [API Documentation](./API_DOCUMENTATION.md) - Comprehensive API reference
- [Database Operations](./DATABASE_OPERATIONS.md) - Database management guide
- [OpenAPI Specification](./openapi.yaml) - Machine-readable API spec 