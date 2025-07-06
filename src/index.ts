import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { Effect, pipe } from 'effect';
import { config, Config } from './config';
import { AppDataSource } from './database/DataSource.config';
import { seedInitialData } from './database/seeds/initial-data';
import authRoutes from './routes/Authentication.routes';
import featureFlagRoutes from './routes/FeatureFlag.routes';

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Request logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Launch Darkly Lite Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/flags', featureFlagRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: error.stack }),
  });
});

// Utility function to print startup info
const printStartupInfoEffect = (config: Config) => Effect.sync(() => {
  console.log(`🚀 Launch Darkly Lite Server running on port ${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔐 JWT Secret: ${config.jwtSecret.substring(0, 10)}...`);
  console.log(`🌐 CORS Origin: ${config.corsOrigin}`);
  console.log(`📝 Log Level: ${config.logLevel}`);
  console.log(`⏰ Default Flag TTL: ${config.defaultFlagTtl}s`);
  console.log(`👥 Max Flags Per User: ${config.maxFlagsPerUser}`);
  console.log(`🔒 Bcrypt Rounds: ${config.bcryptRounds}`);
  console.log(`🗄️  Database URL: ${config.DB_HOST}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log('  GET  /health                    - Health check');
  console.log('  POST /api/auth/login            - User login');
  console.log('  POST /api/auth/register         - User registration');
  console.log('  POST /api/auth/logout           - User logout');
  console.log('  GET  /api/auth/profile          - Get user profile (protected)');
  console.log('  GET  /api/flags                 - Get all flags (protected)');
  console.log('  GET  /api/flags/:key            - Get flag by key (protected)');
  console.log('  POST /api/flags                 - Create new flag (admin only)');
  console.log('  PUT  /api/flags/:id             - Update flag (admin only)');
  console.log('  DELETE /api/flags/:id           - Delete flag (admin only)');
  console.log('  POST /api/flags/evaluate/:key   - Evaluate flag (public)');
  console.log('');
  console.log('🔑 Default admin credentials:');
  console.log('  Email: admin@example.com');
  console.log('  Password: password123');
  console.log('');
});

// Effect function for startup logs
const startupLog = Effect.try({
  try: () => {
    console.log('🚀 Starting Launch Darkly Lite Server...');
    console.log('📦 Built with TypeScript, Express, Effect.js, TypeORM, and Passport');
  },
  catch: () => new Error('Failed to initialize server'),
});

// Initialize database connection
const initializeDatabase = (): Effect.Effect<void, Error> => {
  return Effect.tryPromise({
    try: async () => {
      console.log('🔗 Connecting to database...');
      await AppDataSource.initialize();
      console.log('✅ Database connected successfully');
      
      // Run initial data seeding
      console.log('🌱 Seeding initial data...');
      await seedInitialData();
      console.log('✅ Initial data seeded successfully');
    },
    catch: (error) => new Error(`Database connection failed: ${String(error)}`),
  });
};

// Start server function using Effect.js
const startServer = (): Effect.Effect<void, Error> => {
  return Effect.try({
    try: () => {
      const server = app.listen(config.port, () => {
        Effect.runSync(printStartupInfoEffect(config));
      });

      // Graceful shutdown
      const shutdown = () => {
        console.log('Shutting down gracefully...');
        server.close(() => {
          AppDataSource.destroy().then(() => {
            console.log('Database connection closed');
            console.log('Process terminated');
            process.exit(0);
          }).catch(err => {
            console.error('Error closing database connection:', err);
            process.exit(1);
          });
        });
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    },
    catch: (error) => error as Error,
  });
};

// Run the server
const program = pipe(
  startupLog,
  Effect.flatMap(() => initializeDatabase()),
  Effect.flatMap(() => startServer()),
  Effect.catchAll((error: unknown) => {
    console.error('❌ Failed to start server:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
    return Effect.succeed(void 0);
  })
);

// Start the application
Effect.runPromise(program).catch((error) => {
  console.error('❌ Unhandled error starting application:', error);
  process.exit(1);
}); 