import { Effect, pipe } from 'effect';
import { FeatureFlagRepository } from '@domain/repositories/FeatureFlag.repository';
import { EvaluationRequestDto, EvaluationResponseDto, toEvaluationResponseDto, validateEvaluationRequest } from '../../dto/FeatureFlag.dto';
import { evaluate } from '@domain/entities/FeatureFlag.entity';

// Use case implementation with pipe/map approach
export const evaluateFeatureFlagUseCase = (
  key: string,
  dto: EvaluationRequestDto,
  featureFlagRepository: FeatureFlagRepository
): Effect.Effect<EvaluationResponseDto, Error> =>
  pipe(
    // Validate input
    Effect.succeed({ key, dto }),
    Effect.flatMap(({ key, dto }) => 
      !key ? Effect.fail(new Error('Feature flag key is required')) : Effect.succeed({ key, dto })
    ),
    // Validate evaluation request
    Effect.flatMap(({ key, dto }) =>
      pipe(
        validateEvaluationRequest(dto),
        Effect.map((validatedDto) => ({ key, validatedDto }))
      )
    ),
    // Find feature flag by key
    Effect.flatMap(({ key, validatedDto }) =>
      pipe(
        featureFlagRepository.findByKey(key),
        Effect.flatMap((flag) =>
          !flag 
            ? Effect.fail(new Error('Feature flag not found'))
            : Effect.succeed({ flag, validatedDto })
        )
      )
    ),
    // Evaluate feature flag
    Effect.flatMap(({ flag, validatedDto }) => {
      const context = {
        userId: validatedDto.userId,
        attributes: validatedDto.context
      };
      const result = evaluate(flag, context);
      const reason = result === flag.defaultValue ? 'default' : 'rule_match';
      
      return Effect.succeed(toEvaluationResponseDto(flag.key, result, reason));
    })
  ); 