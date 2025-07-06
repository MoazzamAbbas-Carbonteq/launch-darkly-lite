# Launch Darkly Lite 🚀

A lightweight, production-ready feature flag server built with **TypeScript**, **Express**, **Effect.js**, **TypeORM**, and **Passport**. This server provides a simple yet powerful API for managing feature flags with advanced targeting rules and user authentication.

## Features ✨

- 🎯 **Advanced Feature Flags** with targeting rules
- 🔐 **JWT Authentication** with Passport.js  
- 🛡️ **Role-based Access Control** (Admin/User)
- 🗄️ **PostgreSQL Database** with TypeORM
- ⚡ **Effect.js** for functional programming and error handling
- 🔒 **Security-first** with Helmet, CORS, and bcrypt
- 📝 **Request Logging** with Morgan
- 🏗️ **TypeScript** for type safety
- 🔄 **Database Migrations** with TypeORM CLI
- 🌱 **Automatic Database Seeding**

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
# Create database
createdb launch_darkly_lite

# Run migrations (if needed)
npm run typeorm migration:run
```

5. **Start the development server**
```bash
npm run dev
```

The server will start on `http://localhost:3000` with automatic database setup and seeding.

## Database Setup 🗄️

The application uses **TypeORM** with **PostgreSQL**. The database schema includes:

- `users` - User accounts with roles
- `flags` - Simple feature flags  
- `feature_flags` - Advanced feature flags with rules
- `flag_rules` - Targeting rules for feature flags
- `flag_conditions` - Conditions for targeting rules

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/launch_darkly_lite` |

### TypeORM CLI Commands

```bash
# Generate migration
npm run typeorm migration:generate -- -n MigrationName

# Run migrations  
npm run typeorm migration:run

# Revert migration
npm run typeorm migration:revert

# Show migrations
npm run typeorm migration:show
```

## API Documentation 📚

### Authentication Endpoints

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### GET `/api/auth/profile` (Protected)
Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Feature Flag Endpoints

#### GET `/api/flags` (Protected)
Get all feature flags.

#### GET `/api/flags/:key` (Protected)
Get a specific feature flag by key.

#### POST `/api/flags` (Admin Only)
Create a new feature flag.

**Request Body:**
```json
{
  "key": "new-feature",
  "name": "New Feature",
  "description": "A new feature for testing",
  "enabled": true,
  "defaultValue": false,
  "rules": [
    {
      "type": "user_id",
      "conditions": [
        {
          "field": "userId",
          "operator": "equals",
          "value": "1"
        }
      ],
      "value": true,
      "priority": 1
    }
  ]
}
```

#### PUT `/api/flags/:id` (Admin Only)
Update an existing feature flag.

#### DELETE `/api/flags/:id` (Admin Only)
Delete a feature flag.

#### POST `/api/flags/evaluate/:key` (Public)
Evaluate a feature flag for a user.

**Request Body:**
```json
{
  "userId": "1",
  "userEmail": "user@example.com",
  "userRole": "user",
  "attributes": {
    "plan": "premium",
    "region": "us-east-1"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "flagKey": "new-feature",
    "enabled": true
  }
}
```

## Feature Flag Rules 🎯

The system supports various rule types and conditions:

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

### Example Rules

```json
{
  "rules": [
    {
      "type": "role",
      "conditions": [
        {
          "field": "role",
          "operator": "equals",
          "value": "admin"
        }
      ],
      "value": true,
      "priority": 1
    },
    {
      "type": "percentage",
      "conditions": [
        {
          "field": "userId",
          "operator": "in",
          "value": ["1", "2", "3", "4", "5"]
        }
      ],
      "value": true,
      "priority": 2
    }
  ]
}
```

## Configuration ⚙️

The application uses environment variables for configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration | `24h` |
| `DATABASE_URL` | Database connection | `mongodb://localhost:27017/launch-darkly-lite` |
| `DEFAULT_FLAG_TTL` | Default flag TTL in seconds | `3600` |
| `MAX_FLAGS_PER_USER` | Maximum flags per user | `100` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `info` |

## Development 🛠️

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run clean        # Clean build directory
```

### Project Structure

```
src/
├── config/          # Configuration management
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Data models (future)
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Application entry point
```

## Security 🔒

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable CORS settings
- **Input Validation**: Effect.js Schema validation
- **Role-based Access**: Admin and user role system

## Default Credentials 🔑

For development purposes, the system includes a default admin user:

- **Email**: `admin@example.com`
- **Password**: `password123`

⚠️ **Important**: Change these credentials in production!

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License 📄

This project is licensed under the ISC License.

## Acknowledgments 🙏

- Built with [Effect.js](https://effect.website/) for functional programming
- Authentication powered by [Passport.js](http://www.passportjs.org/)
- Security enhanced with [Helmet.js](https://helmetjs.github.io/) 