# Database Operations Guide

This guide explains how to work with database migrations and seeds in the LaunchDarkly Lite project.

## Overview

The project uses **TypeORM** for database operations with PostgreSQL. The database setup includes:

- **Migrations**: Schema changes and database structure updates
- **Seeds**: Initial data population for development and testing
- **Models**: TypeORM entities representing database tables

## Database Structure

### Models Location
- `src/models/` - TypeORM entity models
- `src/database/DataSource.config.ts` - Database configuration

### Migrations Location
- `src/database/migrations/` - Database migration files
- Current migration: `1234567890123-CreateInitialTables.ts`

### Seeds Location
- `src/database/seeds/` - Database seed files
- Main seed file: `initial-data.ts`

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
npm run migration:generate -- src/database/migrations/NewMigrationName

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

## Migration Workflow

### 1. Making Schema Changes

1. **Modify your models** in `src/models/`
2. **Generate migration**:
   ```bash
   npm run migration:generate -- src/database/migrations/UpdateUserTable
   ```
3. **Review the generated migration** file
4. **Run the migration**:
   ```bash
   npm run migration:run
   ```

### 2. Creating New Migrations

```bash
# Generate a new migration based on model changes
npm run migration:generate -- src/database/migrations/AddNewFeature

# The migration will be created with a timestamp prefix
# Example: 1234567890124-AddNewFeature.ts
```

### 3. Migration Best Practices

- **Always review** generated migrations before running
- **Test migrations** in development first
- **Create rollback strategies** for production migrations
- **Keep migrations atomic** - one logical change per migration
- **Never edit** existing migrations that have been run in production

## Seeds Workflow

### 1. Current Seeds

The `initial-data.ts` seed creates:
- **Admin user** with email: `admin@example.com`, password: `password123`
- **Sample feature flag** called `new-feature`
- **Flag rules and conditions** for the sample flag

### 2. Running Seeds

```bash
# Run seeds independently (useful for testing)
npm run seed:run

# Seeds run automatically when starting the app
npm run dev
```

### 3. Creating New Seeds

1. **Add new seed functions** to `src/database/seeds/initial-data.ts`
2. **Or create new seed files** in `src/database/seeds/`
3. **Import and call** new seeds in `run-seeds.ts`

Example new seed:
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
    },
    // ... more flags
  ];

  for (const flagData of flags) {
    const existingFlag = await featureFlagRepository.findOne({ 
      where: { key: flagData.key } 
    });
    
    if (!existingFlag) {
      const flag = featureFlagRepository.create(flagData);
      await featureFlagRepository.save(flag);
      console.log(`✅ Created flag: ${flag.key}`);
    }
  }
}
```

## Environment Configuration

### Development
- `synchronize: true` - Automatically syncs schema changes
- `logging: true` - Shows SQL queries in console
- Uses TypeScript migration files

### Production
- `synchronize: false` - Requires explicit migrations
- `logging: false` - Minimal logging
- Uses compiled JavaScript migration files

## Database Schema

### Current Tables

1. **users**
   - id (UUID, primary key)
   - email (unique)
   - password (hashed)
   - name
   - role (admin/user)
   - timestamps

2. **feature_flags**
   - id (UUID, primary key)
   - key (unique)
   - name, description
   - enabled, defaultValue
   - createdBy (FK to users)
   - timestamps, expiresAt

3. **flag_rules**
   - id (UUID, primary key)
   - type (user_id, email, role, percentage, custom_attribute)
   - value (boolean)
   - priority
   - featureFlagId (FK to feature_flags)

4. **flag_conditions**
   - id (UUID, primary key)
   - field, operator, value
   - ruleId (FK to flag_rules)

5. **flags** (legacy table)
   - id, name, key, description
   - projectId, archived
   - createdAt

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

## Troubleshooting

### Common Issues

1. **Migration fails**: Check the generated SQL and model definitions
2. **Seeds fail**: Ensure database is initialized and models are correct
3. **TypeORM errors**: Verify DataSource configuration and database connection

### Debug Mode
Set `logging: true` in DataSource config to see all SQL queries.

### Fresh Start
```bash
# Complete reset for development
npm run schema:drop
npm run migration:run
npm run seed:run
```

## Integration with Application

- **Automatic setup**: Database initialization and seeding happen on app startup
- **Effect.js integration**: Database operations use Effect.js for error handling
- **Repository pattern**: Clean separation between models and business logic

The database operations are fully integrated with the functional architecture and Effect.js patterns used throughout the application. 