import { Effect, pipe } from 'effect';
import { UserRepository } from '../../domain/repositories/User.repository';
import { CreateUserRequestDto, UpdateUserRequestDto, UserResponseDto, toUserResponseDto, validateCreateUserRequest, validateUpdateUserRequest } from '../dto/User.dto';
import { getUserUseCaseWithRepo } from '../use-cases/user/GetUser.use-case';
import { updateUserUseCaseWithRepo } from '../use-cases/user/UpdateUser.use-case';
import { deleteUserUseCaseWithRepo } from '../use-cases/user/DeleteUser.use-case';

// Service interface
export interface UserService {
  createUser: (dto: CreateUserRequestDto) => Effect.Effect<UserResponseDto, Error>;
  getUser: (id: string) => Effect.Effect<UserResponseDto | null, Error>;
  updateUser: (id: string, dto: UpdateUserRequestDto) => Effect.Effect<UserResponseDto, Error>;
  deleteUser: (id: string) => Effect.Effect<boolean, Error>;
  getUserByEmail: (email: string) => Effect.Effect<UserResponseDto | null, Error>;
}

// Functional service factory - RECOMMENDED APPROACH
export const makeUserService = (userRepository: UserRepository): UserService => ({
  createUser: (dto: CreateUserRequestDto) =>
    pipe(
      validateCreateUserRequest(dto),
      Effect.flatMap((validatedDto) =>
        userRepository.create({
          email: validatedDto.email,
          password: validatedDto.password,
          name: validatedDto.name,
          role: validatedDto.role,
        })
      ),
      Effect.map((user) => toUserResponseDto(user))
    ),

  getUser: (id: string) =>
    pipe(
      getUserUseCaseWithRepo(id, userRepository),
      Effect.map((user) => user ? toUserResponseDto(user) : null)
    ),

  updateUser: (id: string, dto: UpdateUserRequestDto) =>
    pipe(
      updateUserUseCaseWithRepo(id, dto, userRepository),
      Effect.map((user) => toUserResponseDto(user))
    ),

  deleteUser: (id: string) =>
    deleteUserUseCaseWithRepo(id, userRepository),

  getUserByEmail: (email: string) =>
    pipe(
      userRepository.findByEmail(email),
      Effect.map((user) => user ? toUserResponseDto(user) : null)
    )
}); 