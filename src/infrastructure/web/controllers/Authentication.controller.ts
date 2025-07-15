import { Request, Response } from 'express';
import { Effect, pipe } from 'effect';
import { generateToken } from '../middleware/Authentication.middleware';
import type { AuthResponse } from '../types/Api.types';
import { AppDataSource } from '@infrastructure/database/DataSource.config';
import { UserModel } from '@infrastructure/database/models/User.model';
import { createUserRepositoryImpl } from '@infrastructure/database/repositories/User.repository.impl';
import { loginUserUseCase, LoginRequest } from '@application/use-cases/auth/LoginUser.use-case';
import { registerUserUseCase, RegisterRequest } from '@application/use-cases/auth/RegisterUser.use-case';

// Initialize repository
const getUserRepository = () => {
  const typeormRepository = AppDataSource.getRepository(UserModel);
  return createUserRepositoryImpl(typeormRepository);
};

// Basic validation function for login
const validateLoginRequest = (body: any): LoginRequest => {
  if (!body.email || typeof body.email !== 'string') {
    throw new Error('Email is required and must be a string');
  }
  if (!body.password || typeof body.password !== 'string') {
    throw new Error('Password is required and must be a string');
  }
  return { email: body.email, password: body.password };
};

// Basic validation function for register
const validateRegisterRequest = (body: any): RegisterRequest => {
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
  const userRepository = getUserRepository();
  
  const program = pipe(
    // Validate request body
    Effect.try({
      try: () => validateLoginRequest(req.body),
      catch: () => new Error('Invalid request body'),
    }),
    // Execute login use case
    Effect.flatMap((loginRequest) => 
      loginUserUseCase(loginRequest, userRepository)
    ),
    // Generate token and return response
    Effect.map(({ user }) => {
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      
      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
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
  const userRepository = getUserRepository();
  
  const program = pipe(
    // Validate request body
    Effect.try({
      try: () => validateRegisterRequest(req.body),
      catch: () => new Error('Invalid request body'),
    }),
    // Execute register use case
    Effect.flatMap((registerRequest) => 
      registerUserUseCase(registerRequest, userRepository)
    ),
    // Generate token and return response
    Effect.map(({ user }) => {
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      
      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
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