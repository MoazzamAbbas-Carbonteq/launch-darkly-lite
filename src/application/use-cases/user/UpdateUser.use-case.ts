import { Effect, pipe } from 'effect';
import { UserRepository } from '../../../domain/repositories/User.repository';
import { UserEntity } from '../../../domain/entities/User.entity';
import { CreateUserRequestDto } from '../../dto/User.dto';

// Use case implementation with pipe/map approach
export const updateUserUseCaseWithRepo = (
  userId: string,
  updateData: Partial<CreateUserRequestDto>,
  userRepository: UserRepository
): Effect.Effect<UserEntity, Error> =>
  pipe(
    // Validate input
    Effect.succeed({ userId, updateData }),
    Effect.flatMap(({ userId, updateData }) => 
      !userId ? Effect.fail(new Error('User ID is required')) : Effect.succeed({ userId, updateData })
    ),
    // Check if user exists
    Effect.flatMap(({ userId, updateData }) =>
      pipe(
        userRepository.findById(userId),
        Effect.flatMap((existingUser) =>
          !existingUser 
            ? Effect.fail(new Error('User not found'))
            : Effect.succeed({ userId, updateData })
        )
      )
    ),
    // Update user
    Effect.flatMap(({ userId, updateData }) => userRepository.update(userId, updateData))
  ); 