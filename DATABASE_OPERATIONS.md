# Database Operations Guide

This guide explains how to work with database migrations, seeds, and the repository pattern in the LaunchDarkly Lite project.

## Overview

The project uses **TypeORM** with **PostgreSQL** in a **Clean Architecture** setup. Database operations are integrated with **Effect.js** for functional programming patterns and type safety.

## Architecture Integration

### Clean Architecture Layers

```
Domain Layer (Business Logic)
├── Entities - Domain objects with business rules
└── Repositories - Abstract interfaces

Infrastructure Layer (Technical Implementation)  
├── Models - TypeORM entities
├── Repository Implementations - Concrete data access
├── Migrations - Schema changes
└── Seeds - Initial data
```

### Effect.js Integration

All database operations use **Effect.js** for:
- **Type-safe error handling**
- **Composable operations**
- **Functional programming patterns**
- **Dependency injection via Context**

## Database Structure

### Models Location
- `src/models/` - TypeORM entity models (infrastructure)
- `src/domain/entities/` - Domain entities (business logic)
- `src/infrastructure/repositories/` - Repository implementations
- `src/database/DataSource.config.ts` - Database configuration

### Migrations Location
- `src/database/migrations/` - Database migration files
- Generated with timestamps for proper ordering

### Seeds Location
- `src/database/seeds/` - Database seed files
- `scripts/run-seeds.js` - Seed execution script

## Available Scripts

### Migration Commands

```bash
# Show migration status
npm run migration:show

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate new migration (after model changes)
npm run migration:generate -- MigrationName

# Sync schema (development only - be careful!)
npm run schema:sync

# Drop entire schema (destructive!)
npm run schema:drop
```

### Seed Commands

```bash
# Run seeds independently
npm run seed:run

# Seeds also run automatically when starting the app in development
npm run dev
```

### Database Management Scripts

```bash
# Clean architecture migration
npm run migrate:clean-architecture

# Documentation generation
npm run docs:serve
npm run docs:validate
```

## Clean Architecture Database Pattern

### 1. Domain Entities

Domain entities contain business logic and validation:

```typescript
// src/domain/entities/FeatureFlag.entity.ts
export interface FeatureFlagEntity {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly enabled: boolean;
  readonly defaultValue: boolean;
  readonly rules: FlagRuleEntity[];
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly expiresAt?: Date;
}

// Factory function with validation
export const createFeatureFlagEntityWithValidation = (
  id: string,
  key: string,
  name: string,
  // ... other parameters
): Effect.Effect<FeatureFlagEntity, Error> => {
  // Validation logic using Effect.js
  return Effect.succeed({
    id,
    key,
    name,
    // ... other properties
  });
};
```

### 2. Repository Interfaces

Repository interfaces define the contract (domain layer):

```typescript
// src/domain/repositories/FeatureFlag.repository.ts
export interface FeatureFlagRepository {
  findById(id: string): Effect.Effect<FeatureFlagEntity | null, Error>;
  findByKey(key: string): Effect.Effect<FeatureFlagEntity | null, Error>;
  findAll(): Effect.Effect<FeatureFlagEntity[], Error>;
  create(flagData: CreateFeatureFlagData): Effect.Effect<FeatureFlagEntity, Error>;
  update(id: string, updates: UpdateFeatureFlagData): Effect.Effect<FeatureFlagEntity, Error>;
  delete(id: string): Effect.Effect<boolean, Error>;
}
```

### 3. TypeORM Models

TypeORM models handle persistence (infrastructure layer):

```typescript
// src/models/FeatureFlag.model.ts
@Entity('feature_flags')
export class FeatureFlagModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: false })
  defaultValue: boolean;

  @OneToMany(() => FlagRuleModel, rule => rule.featureFlag, { cascade: true })
  rules: FlagRuleModel[];

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;
}
```

### 4. Repository Implementations

Repository implementations bridge domain and infrastructure:

```typescript
// src/infrastructure/repositories/FeatureFlag.repository.impl.ts
export const createFeatureFlagRepositoryImpl = (
  repository: Repository<FeatureFlagModel>
): FeatureFlagRepository => ({
  findById: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const flag = await repository.findOne({ 
          where: { id }, 
          relations: ['rules', 'rules.conditions'] 
        });
        return flag;
      },
      catch: (e) => new Error(`Failed to find feature flag by id: ${String(e)}`),
    }).pipe(
      Effect.flatMap((flag) => 
        flag ? toDomainEntityWithValidation(flag) : Effect.succeed(null)
      )
    ),

  create: (flagData: CreateFeatureFlagData) =>
    Effect.tryPromise({
      try: async () => {
        const newFlag = repository.create(flagData);
        const savedFlag = await repository.save(newFlag);
        return savedFlag;
      },
      catch: (e) => new Error(`Failed to create feature flag: ${String(e)}`),
    }).pipe(
      Effect.flatMap((savedFlag) => toDomainEntityWithValidation(savedFlag))
    ),

  // ... other methods
});
```

## Migration Workflow

### 1. Making Schema Changes

1. **Modify TypeORM models** in `src/models/`
2. **Update domain entities** in `src/domain/entities/` if needed
3. **Generate migration**:
   ```bash
   npm run migration:generate -- UpdateFeatureFlagTable
   ```
4. **Review the generated migration** file
5. **Run the migration**:
   ```bash
   npm run migration:run
   ```

### 2. Creating New Migrations

```bash
# Generate a new migration based on model changes
npm run migration:generate -- AddNewFeature

# The migration will be created with a timestamp prefix
# Example: 1234567890124-AddNewFeature.ts
```

### 3. Migration Best Practices

- **Always review** generated migrations before running
- **Test migrations** in development first
- **Create rollback strategies** for production migrations
- **Keep migrations atomic** - one logical change per migration
- **Never edit** existing migrations that have been run in production
- **Update domain entities** when database schema changes

## Seeds Workflow

### 1. Current Seeds

The `initial-data.ts` seed creates:
- **Admin user** with email: `admin@example.com`, password: `password123`
- **Regular user** for testing
- **Sample feature flags** with complex rules
- **Flag rules and conditions** demonstrating various targeting types

### 2. Running Seeds

```bash
# Run seeds independently (useful for testing)
npm run seed:run

# Seeds run automatically when starting the app
npm run dev
```

### 3. Creating New Seeds

1. **Add new seed functions** to `src/database/seeds/initial-data.ts`
2. **Use Effect.js patterns** for error handling
3. **Follow repository pattern** for data access

Example new seed with Effect.js:

```typescript
export async function seedAdditionalFeatureFlags() {
  const featureFlagRepository = AppDataSource.getRepository(FeatureFlagModel);
  
  const flags = [
    {
      key: "dark-mode",
      name: "Dark Mode",
      description: "Enable dark mode UI",
      enabled: true,
      defaultValue: false,
      createdBy: "admin-user-id",
    },
    // ... more flags
  ];

  for (const flagData of flags) {
    try {
      const existingFlag = await featureFlagRepository.findOne({ 
        where: { key: flagData.key } 
      });
      
      if (!existingFlag) {
        const flag = featureFlagRepository.create(flagData);
        await featureFlagRepository.save(flag);
        console.log(`✅ Created flag: ${flag.key}`);
      } else {
        console.log(`⏭️  Flag already exists: ${flagData.key}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create flag ${flagData.key}:`, error);
    }
  }
}
```

## Environment Configuration

### Development
- `synchronize: false` - Uses explicit migrations for consistency
- `logging: true` - Shows SQL queries in console
- `migrations: ["src/database/migrations/*.ts"]` - TypeScript migration files
- Automatic seeding on startup

### Production
- `synchronize: false` - Requires explicit migrations
- `logging: false` - Minimal logging for performance
- `migrations: ["dist/database/migrations/*.js"]` - Compiled JavaScript files
- Manual seeding via scripts

### Database Configuration

```typescript
// src/database/DataSource.config.ts
export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  synchronize: config.nodeEnv === 'development' ? false : false, // Always false now
  logging: config.nodeEnv === 'development',
  entities: [UserModel, FeatureFlagModel, FlagRuleModel, FlagConditionModel],
  migrations: [`src/database/migrations/*.${config.nodeEnv === 'production' ? 'js' : 'ts'}`],
  subscribers: [],
  dropSchema: false,
});
```

## Database Schema

### Current Tables

1. **users**
   - id (UUID, primary key)
   - email (unique, not null)
   - password (hashed with bcrypt)
   - name (not null)
   - role (enum: admin/user)
   - createdAt, updatedAt (timestamps)

2. **feature_flags**
   - id (UUID, primary key)
   - key (unique, not null)
   - name, description
   - enabled (boolean, default true)
   - defaultValue (boolean, default false)
   - createdBy (UUID, FK to users)
   - createdAt, updatedAt, expiresAt (timestamps)

3. **flag_rules**
   - id (UUID, primary key)
   - type (enum: user_id, email, role, percentage, custom_attribute)
   - value (boolean)
   - priority (integer, for ordering)
   - featureFlagId (UUID, FK to feature_flags)

4. **flag_conditions**
   - id (UUID, primary key)
   - field (string, condition field name)
   - operator (enum: equals, not_equals, contains, etc.)
   - value (string, condition value)
   - ruleId (UUID, FK to flag_rules)

### Relationships

```
users 1:N feature_flags (createdBy)
feature_flags 1:N flag_rules
flag_rules 1:N flag_conditions
```

## Common Operations

### Reset Database (Development)
```bash
# Drop all tables and recreate
npm run schema:drop
npm run migration:run
npm run seed:run
```

### Backup Before Migration (Production)
```bash
# Always backup before running migrations in production
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Then run migrations
npm run migration:run
```

### Check Migration Status
```bash
# See which migrations have been applied
npm run migration:show
```

### Docker Database Setup
```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres

# Check database status
docker-compose ps

# View database logs
docker-compose logs postgres
```

## Troubleshooting

### Common Issues

1. **Migration fails**: 
   - Check the generated SQL and model definitions
   - Verify database connection
   - Review foreign key constraints

2. **Seeds fail**: 
   - Ensure database is initialized first
   - Check for unique constraint violations
   - Verify model relationships

3. **TypeORM errors**: 
   - Verify DataSource configuration
   - Check entity decorators
   - Ensure proper imports

4. **Clean Architecture violations**:
   - Domain entities should not depend on infrastructure
   - Repository interfaces belong in domain layer
   - Use Effect.js for all async operations

### Debug Mode
Set `logging: true` in DataSource config to see all SQL queries:

```typescript
// Enable SQL logging
logging: ["query", "error", "schema", "warn", "info", "log"]
```

### Fresh Start (Development)
```bash
# Complete reset for development
npm run schema:drop
npm run migration:run
npm run seed:run

# Or with Docker
docker-compose down -v  # Remove volumes
docker-compose up -d postgres
npm run migration:run
npm run seed:run
```

## Testing Database Operations

### Unit Testing Repositories

```typescript
// Example repository test with Effect.js
describe('FeatureFlagRepository', () => {
  it('should create a feature flag', async () => {
    const mockTypeOrmRepo = createMockRepository();
    const repository = createFeatureFlagRepositoryImpl(mockTypeOrmRepo);
    
    const flagData = {
      key: 'test-flag',
      name: 'Test Flag',
      description: 'A test flag',
      enabled: true,
      defaultValue: false,
      createdBy: 'user-id'
    };

    const result = await Effect.runPromise(
      repository.create(flagData)
    );

    expect(result.key).toBe('test-flag');
    expect(mockTypeOrmRepo.save).toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
// Example integration test
describe('Database Integration', () => {
  beforeEach(async () => {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
  });

  afterEach(async () => {
    await AppDataSource.dropDatabase();
    await AppDataSource.destroy();
  });

  it('should perform end-to-end flag operations', async () => {
    // Test with real database
  });
});
```

## Performance Considerations

### Query Optimization

- Use `relations` parameter carefully to avoid N+1 queries
- Implement proper indexing on frequently queried fields
- Use pagination for large result sets
- Consider query builders for complex queries

### Connection Management

```typescript
// Connection pooling configuration
{
  extra: {
    max: 10,          // Maximum connections
    min: 2,           // Minimum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
}
```

## Integration with Clean Architecture

The database operations are fully integrated with the functional architecture:

- **Effect.js**: All database operations return `Effect` types
- **Repository Pattern**: Clean separation between domain and infrastructure
- **Dependency Injection**: Repositories injected via Effect.js Context
- **Type Safety**: Full TypeScript coverage with domain entities
- **Error Handling**: Composable error handling with Effect.js
- **Pure Functions**: All business logic implemented as pure functions

### Context Integration

```typescript
// Application context with database repositories
export const AppContextLive = Layer.mergeAll(
  UserRepositoryLive,
  FeatureFlagRepositoryLive,
  UserServiceLive,
  FeatureFlagServiceLive
);

// Usage in use cases
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

This approach ensures that database operations are:
- **Testable**: Easy to mock repositories
- **Maintainable**: Clear separation of concerns
- **Type-safe**: Compile-time error checking
- **Functional**: Composable operations with Effect.js
- **Scalable**: Modular architecture for growth 