import { Effect, pipe } from 'effect';
import { UserRepository } from '../../domain/repositories/User.repository';
import { validateCreateUserRequest, toResponseDto, CreateUserRequestDto, UserResponseDto } from '../dto/User.dto';
import { createUserUseCaseWithRepo, CreateUserRequest } from '../use-cases/user/CreateUser.use-case';

// Type for service
export type UserService = ReturnType<typeof makeUserService>;

// Functional service factory
export const makeUserService = (userRepository: UserRepository) => ({
  createUser: (requestDto: CreateUserRequestDto): Effect.Effect<UserResponseDto, Error> =>
    pipe(
      // Validate DTO
      validateCreateUserRequest(requestDto),
      // Transform to use case request
      Effect.map((validatedDto) => ({
        email: validatedDto.email,
        password: validatedDto.password,
        name: validatedDto.name,
        role: validatedDto.role
      })),
      // Execute use case
      Effect.flatMap((useCaseRequest) => 
        createUserUseCaseWithRepo(useCaseRequest, userRepository)
      ),
      // Transform to response DTO
      Effect.map((response) => toResponseDto(response.user))
    )
});

// Alternative functional service (without factory)
export const createUserService = (requestDto: CreateUserRequestDto, userRepository: UserRepository): Effect.Effect<UserResponseDto, Error> =>
  pipe(
    // Validate DTO
    validateCreateUserRequest(requestDto),
    // Transform to use case request
    Effect.map((validatedDto) => ({
      email: validatedDto.email,
      password: validatedDto.password,
      name: validatedDto.name,
      role: validatedDto.role
    })),
    // Execute use case
    Effect.flatMap((useCaseRequest) => 
      createUserUseCaseWithRepo(useCaseRequest, userRepository)
    ),
    // Transform to response DTO
    Effect.map((response) => toResponseDto(response.user))
  ); 