import { Request, Response } from 'express';
import { Effect, pipe } from 'effect';
import { CreateUserRequestDto } from '../application/dto/User.dto';
import { toPlainObject } from '../domain/entities/User.entity';
import { runWithUserService, getUserService } from '../application/context/AppContext';

// Helper function to get error message
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};

// ===== FUNCTIONAL CONTROLLERS WITH CONTEXT-BASED DEPENDENCY INJECTION =====

// Pure functional controller using context
export const createUserController = async (req: Request, res: Response): Promise<void> => {
  // Extract DTO from request body
  const createUserDto: CreateUserRequestDto = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    role: req.body.role
  };

  // Execute with context-injected service using Effect error handling
  const program = pipe(
    runWithUserService(
      pipe(
        getUserService,
        Effect.flatMap((userService) => userService.createUser(createUserDto))
      )
    ),
    Effect.map((result) => {
      res.status(201).json({
        success: true,
        data: result,
        message: 'User created successfully'
      });
    }),
    Effect.catchAll((error) => {
      res.status(400).json({
        success: false,
        error: getErrorMessage(error),
        message: 'Failed to create user'
      });
      return Effect.succeed(void 0);
    })
  );

  await Effect.runPromise(program);
};

// Get user controller with context
export const getUserController = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;
  
  const program = pipe(
    runWithUserService(
      pipe(
        getUserService,
        Effect.flatMap((userService) => userService.getUser(userId))
      )
    ),
    Effect.map((user) => {
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
        message: 'User retrieved successfully'
      });
    }),
    Effect.catchAll((error) => {
      res.status(400).json({
        success: false,
        error: getErrorMessage(error),
        message: 'Failed to retrieve user'
      });
      return Effect.succeed(void 0);
    })
  );

  await Effect.runPromise(program);
};

// Update user controller with context
export const updateUserController = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;
  const updateData = req.body;
  
  const program = pipe(
    runWithUserService(
      pipe(
        getUserService,
        Effect.flatMap((userService) => userService.updateUser(userId, updateData))
      )
    ),
    Effect.map((user) => {
      res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    }),
    Effect.catchAll((error) => {
      res.status(400).json({
        success: false,
        error: getErrorMessage(error),
        message: 'Failed to update user'
      });
      return Effect.succeed(void 0);
    })
  );

  await Effect.runPromise(program);
};

// Delete user controller with context
export const deleteUserController = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;
  
  const program = pipe(
    runWithUserService(
      pipe(
        getUserService,
        Effect.flatMap((userService) => userService.deleteUser(userId))
      )
    ),
    Effect.map((success) => {
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    }),
    Effect.catchAll((error) => {
      res.status(400).json({
        success: false,
        error: getErrorMessage(error),
        message: 'Failed to delete user'
      });
      return Effect.succeed(void 0);
    })
  );

  await Effect.runPromise(program);
};

// ===== CONTROLLER FACTORY (LEGACY SUPPORT) =====

// Factory function that creates controllers object
export const makeUserControllers = () => ({
  createUser: createUserController,
  getUser: getUserController,
  updateUser: updateUserController,
  deleteUser: deleteUserController
});

// Route factory for backward compatibility
export const makeUserRoutes = () => makeUserControllers(); 