import { Effect, pipe } from 'effect';
import { FeatureFlagRepository } from '../../../domain/repositories/FeatureFlag.repository';
import { FeatureFlagResponseDto, toFeatureFlagResponseDto } from '../../dto/FeatureFlag.dto';

// Use case implementation with pipe/map approach
export const getFeatureFlagUseCase = (
  id: string,
  featureFlagRepository: FeatureFlagRepository
): Effect.Effect<FeatureFlagResponseDto | null, Error> =>
  pipe(
    // Validate input
    Effect.succeed(id),
    Effect.flatMap((flagId) => 
      !flagId ? Effect.fail(new Error('Feature flag ID is required')) : Effect.succeed(flagId)
    ),
    // Find feature flag by ID
    Effect.flatMap((flagId) => featureFlagRepository.findById(flagId)),
    // Transform to DTO
    Effect.map((flag) => flag ? toFeatureFlagResponseDto(flag) : null)
  ); 