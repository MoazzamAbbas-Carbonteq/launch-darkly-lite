import { Effect, pipe } from 'effect';
import { FeatureFlagRepository } from '@domain/repositories/FeatureFlag.repository';
import { UpdateFeatureFlagRequestDto, FeatureFlagResponseDto, toFeatureFlagResponseDto, validateUpdateFeatureFlagRequest } from '../../dto/FeatureFlag.dto';

// Use case implementation with pipe/map approach
export const updateFeatureFlagUseCase = (
  id: string,
  dto: UpdateFeatureFlagRequestDto,
  featureFlagRepository: FeatureFlagRepository
): Effect.Effect<FeatureFlagResponseDto, Error> =>
  pipe(
    // Validate input
    Effect.succeed({ id, dto }),
    Effect.flatMap(({ id, dto }) => 
      !id ? Effect.fail(new Error('Feature flag ID is required')) : Effect.succeed({ id, dto })
    ),
    // Validate DTO
    Effect.flatMap(({ id, dto }) =>
      pipe(
        validateUpdateFeatureFlagRequest(dto),
        Effect.map((validatedDto) => ({ id, validatedDto }))
      )
    ),
    // Check if feature flag exists
    Effect.flatMap(({ id, validatedDto }) =>
      pipe(
        featureFlagRepository.findById(id),
        Effect.flatMap((existingFlag) =>
          !existingFlag 
            ? Effect.fail(new Error('Feature flag not found'))
            : Effect.succeed({ id, validatedDto })
        )
      )
    ),
    // Update feature flag
    Effect.flatMap(({ id, validatedDto }) => featureFlagRepository.update(id, validatedDto)),
    // Transform to response DTO
    Effect.map((flag) => toFeatureFlagResponseDto(flag))
  ); 