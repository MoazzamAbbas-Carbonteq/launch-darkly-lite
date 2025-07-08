import { Effect, pipe } from 'effect';
import { FeatureFlagRepository } from '@domain/repositories/FeatureFlag.repository';

// Use case implementation with pipe/map approach
export const deleteFeatureFlagUseCase = (
  id: string,
  featureFlagRepository: FeatureFlagRepository
): Effect.Effect<boolean, Error> =>
  pipe(
    // Validate input
    Effect.succeed(id),
    Effect.flatMap((flagId) => 
      !flagId ? Effect.fail(new Error('Feature flag ID is required')) : Effect.succeed(flagId)
    ),
    // Check if feature flag exists
    Effect.flatMap((flagId) =>
      pipe(
        featureFlagRepository.findById(flagId),
        Effect.flatMap((existingFlag) =>
          !existingFlag 
            ? Effect.fail(new Error('Feature flag not found'))
            : Effect.succeed(flagId)
        )
      )
    ),
    // Delete feature flag
    Effect.flatMap((flagId) => featureFlagRepository.delete(flagId))
  ); 