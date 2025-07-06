import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Effect } from 'effect';
import { config } from '../config';
import { User, UserRole } from '../types';

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwtSecret,
    },
    async (payload: any, done: any) => {
      try {
        // In a real application, you would fetch the user from the database
        // For now, we'll use the payload directly
        const user: Omit<User, 'password'> = {
          id: payload.id,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          createdAt: new Date(payload.createdAt),
          updatedAt: new Date(payload.updatedAt),
        };
        
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Local Strategy for username/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email: string, password: string, done: any) => {
      try {
        // In a real application, you would fetch the user from the database
        // For demo purposes, we'll create a mock user
        const mockUser: User = {
          id: '1',
          email: 'admin@example.com',
          password: await bcrypt.hash('password123', config.bcryptRounds),
          name: 'Admin User',
          role: UserRole.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (email !== mockUser.email) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, mockUser.password);
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const { password: _, ...userWithoutPassword } = mockUser;
        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    // In a real application, you would fetch the user from the database
    // For demo purposes, we'll return a mock user
    const mockUser: Omit<User, 'password'> = {
      id,
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    done(null, mockUser);
  } catch (error) {
    done(error);
  }
});

// Middleware to authenticate JWT tokens
export const authenticateJwt = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid or missing token',
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware to authenticate local strategy
export const authenticateLocal = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        error: info?.message || 'Authentication failed',
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware to check if user has required role
export const requireRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized - User not authenticated',
      });
      return;
    }

    const user = req.user as { role: UserRole };
    if (user.role !== requiredRole && user.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        error: 'Forbidden - Insufficient permissions',
      });
      return;
    }

    next();
  };
};

// Helper function to generate JWT token
export const generateToken = (user: Omit<User, 'password'>): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );
};

// Helper function to verify JWT token
export const verifyToken = (token: string): Effect.Effect<any, jwt.JsonWebTokenError> => {
  return Effect.try({
    try: () => jwt.verify(token, config.jwtSecret),
    catch: (error) => error as jwt.JsonWebTokenError,
  });
}; 