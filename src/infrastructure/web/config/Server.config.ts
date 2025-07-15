import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration interface
export interface Config {
  // Server Configuration
  port: number;
  nodeEnv: string;
  
  // JWT Configuration
  jwtSecret: string;
  jwtExpiresIn: string;
  
  // Database Configuration
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  
  // Feature Flag Configuration
  defaultFlagTtl: number;
  maxFlagsPerUser: number;
  
  // Security Configuration
  bcryptRounds: number;
  corsOrigin: string;
  
  // Logging Configuration
  logLevel: string;
}

// Parse environment variables
const parseEnv = (): Config => {
  const env = process.env;
  
  return {
    // Server Configuration
    port: env.PORT ? parseInt(env.PORT, 10) : 3000,
    nodeEnv: env.NODE_ENV || 'development',
    
    // JWT Configuration
    jwtSecret: env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    jwtExpiresIn: env.JWT_EXPIRES_IN || '24h',
    
    // Database Configuration
    DB_HOST: env.DB_HOST || 'localhost',
    DB_PORT: env.DB_PORT ? parseInt(env.DB_PORT, 10) : 5432,
    DB_USERNAME: env.DB_USERNAME || 'postgres',
    DB_PASSWORD: env.DB_PASSWORD || 'password',
    DB_NAME: env.DB_NAME || 'launch_darkly_lite',
    
    // Feature Flag Configuration
    defaultFlagTtl: env.DEFAULT_FLAG_TTL ? parseInt(env.DEFAULT_FLAG_TTL, 10) : 3600,
    maxFlagsPerUser: env.MAX_FLAGS_PER_USER ? parseInt(env.MAX_FLAGS_PER_USER, 10) : 100,
    
    // Security Configuration
    bcryptRounds: env.BCRYPT_ROUNDS ? parseInt(env.BCRYPT_ROUNDS, 10) : 12,
    corsOrigin: env.CORS_ORIGIN || 'http://localhost:3000',
    
    // Logging Configuration
    logLevel: env.LOG_LEVEL || 'info'
  };
};

// Export the configuration
export const config = parseEnv(); 