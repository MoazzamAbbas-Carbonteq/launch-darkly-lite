import { Effect, pipe } from 'effect';
import { runWithUserService, getUserService as getUserServiceFromContext } from '../application/context/AppContext';
import { CreateUserRequestDto } from '../application/dto/User.dto';

// Pure service functions that use the application layer through context
export const createUser = (requestDto: CreateUserRequestDto) =>
  runWithUserService(
    pipe(
      getUserServiceFromContext,
      Effect.flatMap((service) => service.createUser(requestDto))
    )
  );

export const getUser = (userId: string) =>
  runWithUserService(
    pipe(
      getUserServiceFromContext,
      Effect.flatMap((service) => service.getUser(userId))
    )
  );

export const updateUser = (userId: string, updateData: Partial<CreateUserRequestDto>) =>
  runWithUserService(
    pipe(
      getUserServiceFromContext,
      Effect.flatMap((service) => service.updateUser(userId, updateData))
    )
  );

export const deleteUser = (userId: string) =>
  runWithUserService(
    pipe(
      getUserServiceFromContext,
      Effect.flatMap((service) => service.deleteUser(userId))
    )
  );

export const getUserByEmail = (email: string) =>
  runWithUserService(
    pipe(
      getUserServiceFromContext,
      Effect.flatMap((service) => service.getUserByEmail(email))
    )
  );

// Legacy function names for backward compatibility
export const createUserService = createUser;
export const getUserService = getUser;
export const updateUserService = updateUser;
export const deleteUserService = deleteUser;
export const getUserByEmailService = getUserByEmail; 