import { Request, Response } from 'express';
import { Effect, pipe } from 'effect';
import { generateToken } from '../middleware/Authentication.middleware';
import type { User, AuthResponse } from '../types/Api.types';
import { UserRole } from '../types/Api.types';
const bcrypt = require('bcryptjs');
import { config } from '../config/Server.config';

// Mock user database (in a real app, this would be a database)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJELpKi', // password123
    name: 'Admin User',
    role: UserRole.ADMIN,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Helper function to find user by email
const findUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email === email);
};

// Helper function to create user
const createUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
  const newUser: User = {
    ...userData,
    id: (mockUsers.length + 1).toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockUsers.push(newUser);
  return newUser;
};

// Basic validation function
const validateLoginRequest = (body: any): { email: string; password: string } => {
  if (!body.email || typeof body.email !== 'string') {
    throw new Error('Email is required and must be a string');
  }
  if (!body.password || typeof body.password !== 'string') {
    throw new Error('Password is required and must be a string');
  }
  return { email: body.email, password: body.password };
};

const validateRegisterRequest = (body: any): { email: string; password: string; name: string } => {
  if (!body.email || typeof body.email !== 'string') {
    throw new Error('Email is required and must be a string');
  }
  if (!body.password || typeof body.password !== 'string') {
    throw new Error('Password is required and must be a string');
  }
  if (!body.name || typeof body.name !== 'string') {
    throw new Error('Name is required and must be a string');
  }
  return { email: body.email, password: body.password, name: body.name };
};

// Login endpoint
export const login = async (req: Request, res: Response): Promise<void> => {
  const program = pipe(
    // Validate request body
    Effect.try({
      try: () => validateLoginRequest(req.body),
      catch: () => new Error('Invalid request body'),
    }),
    // Find user and validate password
    Effect.flatMap(({ email, password }) =>
      Effect.try({
        try: () => {
          const user = findUserByEmail(email);
          if (!user) {
            throw new Error('Invalid email or password');
          }
          return { user, password };
        },
        catch: (error) => error as Error,
      })
    ),
    Effect.flatMap(({ user, password }) =>
      Effect.tryPromise({
        try: () => bcrypt.compare(password, user.password),
        catch: () => new Error('Password comparison failed'),
      }).pipe(
        Effect.flatMap(isValid =>
          isValid
            ? Effect.succeed(user)
            : Effect.fail(new Error('Invalid email or password'))
        )
      )
    ),
    // Generate token and return response
    Effect.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      const token = generateToken(userWithoutPassword);
      
      const response: AuthResponse = {
        user: userWithoutPassword,
        token,
      };
      
      return response;
    }),
    Effect.map(response => {
      res.status(200).json({
        success: true,
        data: response,
        message: 'Login successful',
      });
    }),
    Effect.catchAll(error => {
      res.status(401).json({
        success: false,
        error: error.message || 'Authentication failed',
      });
      return Effect.succeed(void 0);
    })
  );

  Effect.runPromise(program);
};

// Register endpoint
export const register = async (req: Request, res: Response): Promise<void> => {
  const program = pipe(
    // Validate request body
    Effect.try({
      try: () => validateRegisterRequest(req.body),
      catch: () => new Error('Invalid request body'),
    }),
    // Check if user already exists
    Effect.flatMap(({ email, password, name }) =>
      Effect.try({
        try: () => {
          const existingUser = findUserByEmail(email);
          if (existingUser) {
            throw new Error('User with this email already exists');
          }
          return { email, password, name };
        },
        catch: (error) => error as Error,
      })
    ),
    // Hash password and create user
    Effect.flatMap(({ email, password, name }) =>
      Effect.tryPromise({
        try: () => bcrypt.hash(password, config.bcryptRounds),
        catch: () => new Error('Password hashing failed'),
      }).pipe(
        Effect.map(hashedPassword => ({ email, password: hashedPassword as string, name }))
      )
    ),
    Effect.map(({ email, password, name }) => {
      const newUser = createUser({
        email,
        password,
        name,
        role: UserRole.USER,
      });
      
      return newUser;
    }),
    // Generate token and return response
    Effect.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      const token = generateToken(userWithoutPassword);
      
      const response: AuthResponse = {
        user: userWithoutPassword,
        token,
      };
      
      return response;
    }),
    Effect.map(response => {
      res.status(201).json({
        success: true,
        data: response,
        message: 'User registered successfully',
      });
    }),
    Effect.catchAll(error => {
      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed',
      });
      return Effect.succeed(void 0);
    })
  );

  Effect.runPromise(program);
};

// Logout endpoint (client-side token invalidation)
export const logout = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

// Get current user profile
export const getProfile = (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'User not authenticated',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: req.user,
  });
}; 