import { Effect, pipe } from 'effect';
import { FeatureFlagRepository } from '../../../domain/repositories/FeatureFlag.repository';
import { CreateFeatureFlagRequestDto, FeatureFlagResponseDto, toFeatureFlagResponseDto, validateCreateFeatureFlagRequest } from '../../dto/FeatureFlag.dto';

// Use case implementation with pipe/map approach
export const createFeatureFlagUseCase = (
  dto: CreateFeatureFlagRequestDto,
  featureFlagRepository: FeatureFlagRepository
): Effect.Effect<FeatureFlagResponseDto, Error> =>
  pipe(
    // Validate input DTO
    validateCreateFeatureFlagRequest(dto),
    // Create feature flag
    Effect.flatMap((validatedDto) => featureFlagRepository.create(validatedDto)),
    // Transform to response DTO
    Effect.map((flag) => toFeatureFlagResponseDto(flag))
  ); 