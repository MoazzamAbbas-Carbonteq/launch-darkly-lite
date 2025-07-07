import { Effect, pipe } from 'effect';
import { UserRepository } from '../../../domain/repositories/User.repository';

// Use case implementation with pipe/map approach
export const deleteUserUseCaseWithRepo = (
  userId: string,
  userRepository: UserRepository
): Effect.Effect<boolean, Error> =>
  pipe(
    // Validate input
    Effect.succeed(userId),
    Effect.flatMap((id) => 
      !id ? Effect.fail(new Error('User ID is required')) : Effect.succeed(id)
    ),
    // Check if user exists
    Effect.flatMap((id) =>
      pipe(
        userRepository.findById(id),
        Effect.flatMap((existingUser) =>
          !existingUser 
            ? Effect.fail(new Error('User not found'))
            : Effect.succeed(id)
        )
      )
    ),
    // Delete user
    Effect.flatMap((id) => userRepository.delete(id))
  ); 