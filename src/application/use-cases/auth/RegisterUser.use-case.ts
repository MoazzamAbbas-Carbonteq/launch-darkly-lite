import { Effect, pipe } from 'effect';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@domain/repositories/User.repository';
import { UserEntity } from '@domain/entities/User.entity';
import { UserRole } from '@infrastructure/web/types/Api.types';
import { config } from '@infrastructure/web/config/Server.config';

// Request and Response types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  user: UserEntity;
}

// Validation function
const validateRegisterRequest = (request: RegisterRequest): Effect.Effect<RegisterRequest, Error> =>
  Effect.try({
    try: () => {
      if (!request.email || typeof request.email !== 'string') {
        throw new Error('Email is required and must be a string');
      }
      if (!request.password || typeof request.password !== 'string') {
        throw new Error('Password is required and must be a string');
      }
      if (!request.name || typeof request.name !== 'string') {
        throw new Error('Name is required and must be a string');
      }
      if (request.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      return request;
    },
    catch: (error) => error as Error,
  });

// Use case implementation with explicit dependency injection
export const registerUserUseCase = (
  request: RegisterRequest,
  userRepository: UserRepository
): Effect.Effect<RegisterResponse, Error> =>
  pipe(
    // Validate input
    validateRegisterRequest(request),
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
        try: () => bcrypt.hash(validatedRequest.password, config.bcryptRounds),
        catch: () => new Error('Password hashing failed'),
      }).pipe(
        Effect.map(hashedPassword => ({
          ...validatedRequest,
          password: hashedPassword as string,
        }))
      )
    ),
    // Create user
    Effect.flatMap((requestWithHashedPassword) =>
      userRepository.create({
        email: requestWithHashedPassword.email,
        password: requestWithHashedPassword.password,
        name: requestWithHashedPassword.name,
        role: UserRole.USER,
      })
    ),
    // Return response
    Effect.map((user) => ({
      user,
    }))
  ); 