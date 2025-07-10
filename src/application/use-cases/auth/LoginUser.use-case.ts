import { Effect, pipe } from 'effect';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@domain/repositories/User.repository';
import { UserEntity, createUserEntityWithValidation } from '@domain/entities/User.entity';

// Request and Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserEntity;
}

// Validation function
const validateLoginRequest = (request: LoginRequest): Effect.Effect<LoginRequest, Error> =>
  Effect.try({
    try: () => {
      if (!request.email || typeof request.email !== 'string') {
        throw new Error('Email is required and must be a string');
      }
      if (!request.password || typeof request.password !== 'string') {
        throw new Error('Password is required and must be a string');
      }
      return request;
    },
    catch: (error) => error as Error,
  });

// Use case implementation with explicit dependency injection
export const loginUserUseCase = (
  request: LoginRequest,
  userRepository: UserRepository
): Effect.Effect<LoginResponse, Error> =>
  pipe(
    // Validate input
    validateLoginRequest(request),
    // Find user by email with password
    Effect.flatMap((validatedRequest) =>
      pipe(
        userRepository.findByEmailWithPassword(validatedRequest.email),
        Effect.flatMap((userAuthData) => {
          if (!userAuthData) {
            return Effect.fail(new Error('Invalid email or password'));
          }
          return Effect.succeed({ userAuthData, password: validatedRequest.password });
        })
      )
    ),
    // Verify password
    Effect.flatMap(({ userAuthData, password }) =>
      Effect.tryPromise({
        try: () => bcrypt.compare(password, userAuthData.password),
        catch: () => new Error('Password verification failed'),
      }).pipe(
        Effect.flatMap(isValid => {
          if (!isValid) {
            return Effect.fail(new Error('Invalid email or password'));
          }
          return Effect.succeed(userAuthData);
        })
      )
    ),
    // Convert to domain entity (without password)
    Effect.flatMap((userAuthData) =>
      createUserEntityWithValidation(
        userAuthData.id,
        userAuthData.email,
        userAuthData.name,
        userAuthData.role,
        userAuthData.createdAt,
        userAuthData.updatedAt
      )
    ),
    // Return response
    Effect.map((user) => ({
      user,
    }))
  ); 