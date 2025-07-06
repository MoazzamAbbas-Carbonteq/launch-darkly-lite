import { Request, Response } from 'express';
import { Effect } from 'effect';
import { CreateUserRequestDto } from '../application/dto/User.dto';
import { createUserFunctional, makeUserRepository } from '../examples/functional-approach';
import { UserRepository } from '../domain/repositories/User.repository';
import { AppDataSource } from '../database/DataSource.config';
import { UserModel } from '../models/User.model';
import { toPlainObject } from '../domain/entities/User.entity';

// ===== FUNCTIONAL CONTROLLERS WITH DEPENDENCY INJECTION =====

// Pure functional controller - dependency injected as parameter
export const createUserController = (userRepository: UserRepository) => 
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract DTO from request body
      const createUserDto: CreateUserRequestDto = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        role: req.body.role
      };

      // Execute pure function with injected dependency
      const result = await Effect.runPromise(
        createUserFunctional(createUserDto, userRepository)
      );

      res.status(201).json({
        success: true,
        data: result,
        message: 'User created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create user'
      });
    }
  };

// Multiple controller functions with dependency injection
export const getUserController = (userRepository: UserRepository) =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;
      
      const user = await Effect.runPromise(
        userRepository.findById(userId)
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: toPlainObject(user),
        message: 'User retrieved successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve user'
      });
    }
  };

// ===== CONTROLLER FACTORY WITH DEPENDENCY INJECTION =====

// Factory function that creates controllers with injected dependencies
export const makeUserControllers = (userRepository: UserRepository) => ({
  createUser: createUserController(userRepository),
  getUser: getUserController(userRepository),
  // Add more controllers as needed
});

// ===== ROUTE SETUP WITH DEPENDENCY INJECTION =====

// Route factory that injects dependencies once - NO MORE 'new' KEYWORD!
export const makeUserRoutes = () => {
  // Create repository once at application startup using functional approach
  const typeormRepository = AppDataSource.getRepository(UserModel);
  const userRepository = makeUserRepository(typeormRepository);
  
  // Return controllers with injected dependencies
  return makeUserControllers(userRepository);
};

// ===== ALTERNATIVE: HIGHER-ORDER FUNCTION APPROACH =====

// Higher-order function that takes dependencies and returns route handlers
export const withUserRepository = <T extends any[], R>(
  fn: (userRepository: UserRepository, ...args: T) => R
) => {
  const typeormRepository = AppDataSource.getRepository(UserModel);
  const userRepository = makeUserRepository(typeormRepository);
  return (...args: T): R => fn(userRepository, ...args);
};

// Usage with higher-order function
export const createUserControllerHOF = withUserRepository(
  (userRepository: UserRepository, req: Request, res: Response) =>
    createUserController(userRepository)(req, res)
); 