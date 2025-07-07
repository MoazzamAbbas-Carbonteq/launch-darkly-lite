import { Effect, pipe } from 'effect';
import bcryptjs from 'bcryptjs';
import { UserRepository } from '../../../domain/repositories/User.repository';
import { UserRole } from '../../../types/Api.types';
import { config } from '../../../config/Server.config';

// Request and Response types
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface CreateUserResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Use case implementation with explicit dependency injection
export const createUserUseCaseWithRepo = (
  request: CreateUserRequest,
  userRepository: UserRepository
): Effect.Effect<CreateUserResponse, Error> =>
  pipe(
    // Validate input
    Effect.try({
      try: () => {
        if (!request.email || !request.password || !request.name) {
          throw new Error('Email, password, and name are required');
        }
        return request;
      },
      catch: (error) => error as Error,
    }),
    // Check if user already exists
    Effect.flatMap((validatedRequest) =>
      pipe(
        userRepository.findByEmail(validatedRequest.email),
        Effect.flatMap((existingUser) => {
          if (existingUser) {
            return Effect.fail(new Error('User with this email already exists'));
          }
          return Effect.succeed(validatedRequest);
        })
      )
    ),
    // Hash password
    Effect.flatMap((validatedRequest) =>
      Effect.tryPromise({
        try: async () => {
          const hashedPassword = await bcryptjs.hash(validatedRequest.password, config.bcryptRounds);
          return { ...validatedRequest, password: hashedPassword };
        },
        catch: () => new Error('Password hashing failed'),
      })
    ),
    // Create user entity
    Effect.flatMap((requestWithHashedPassword) =>
      userRepository.create({
        email: requestWithHashedPassword.email,
        password: requestWithHashedPassword.password,
        name: requestWithHashedPassword.name,
        role: requestWithHashedPassword.role || UserRole.USER,
      })
    ),
    // Return response
    Effect.map((createdUser) => ({
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      },
    }))
  ); 