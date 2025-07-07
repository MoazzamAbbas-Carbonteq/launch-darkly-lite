import { Effect, pipe } from 'effect';
import { UserRepository } from '../../../domain/repositories/User.repository';
import { UserEntity } from '../../../domain/entities/User.entity';

// Use case implementation with pipe/map approach
export const getUserUseCaseWithRepo = (
  userId: string,
  userRepository: UserRepository
): Effect.Effect<UserEntity | null, Error> =>
  pipe(
    // Validate input
    Effect.succeed(userId),
    Effect.flatMap((id) => 
      !id ? Effect.fail(new Error('User ID is required')) : Effect.succeed(id)
    ),
    // Find user by ID
    Effect.flatMap((id) => userRepository.findById(id))
  ); 