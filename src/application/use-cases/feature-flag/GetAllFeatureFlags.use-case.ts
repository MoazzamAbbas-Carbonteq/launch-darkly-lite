import { Effect, pipe } from 'effect';
import { FeatureFlagRepository } from '@domain/repositories/FeatureFlag.repository';
import { FeatureFlagResponseDto, toFeatureFlagResponseDto } from '../../dto/FeatureFlag.dto';

// Use case implementation with pipe/map approach
export const getAllFeatureFlagsUseCase = (
  featureFlagRepository: FeatureFlagRepository
): Effect.Effect<FeatureFlagResponseDto[], Error> =>
  pipe(
    // Get all feature flags
    featureFlagRepository.findAll(),
    // Transform to response DTOs
    Effect.map((flags) => flags.map(flag => toFeatureFlagResponseDto(flag)))
  ); 