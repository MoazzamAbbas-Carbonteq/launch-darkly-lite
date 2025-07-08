import { Effect, pipe } from 'effect';
import { runWithFeatureFlagService, getFeatureFlagService as getFeatureFlagServiceFromContext } from '@application/context/AppContext';
import { CreateFeatureFlagRequestDto, UpdateFeatureFlagRequestDto, EvaluationRequestDto } from '@application/dto/FeatureFlag.dto';

// Pure service functions that use the application layer through context
export const createFlag = (requestDto: CreateFeatureFlagRequestDto) =>
  runWithFeatureFlagService(
    pipe(
      getFeatureFlagServiceFromContext,
      Effect.flatMap((service) => service.createFeatureFlag(requestDto))
    )
  );

export const updateFlag = (id: string, requestDto: UpdateFeatureFlagRequestDto) =>
  runWithFeatureFlagService(
    pipe(
      getFeatureFlagServiceFromContext,
      Effect.flatMap((service) => service.updateFeatureFlag(id, requestDto))
    )
  );

export const deleteFlag = (id: string) =>
  runWithFeatureFlagService(
    pipe(
      getFeatureFlagServiceFromContext,
      Effect.flatMap((service) => service.deleteFeatureFlag(id))
    )
  );

export const getFeatureFlagById = (id: string) =>
  runWithFeatureFlagService(
    pipe(
      getFeatureFlagServiceFromContext,
      Effect.flatMap((service) => service.getFeatureFlag(id))
    )
  );

export const getFlagByKey = (key: string) =>
  runWithFeatureFlagService(
    pipe(
      getFeatureFlagServiceFromContext,
      Effect.flatMap((service) => service.getFeatureFlagByKey(key))
    )
  );

export const getAllFlags = () =>
  runWithFeatureFlagService(
    pipe(
      getFeatureFlagServiceFromContext,
      Effect.flatMap((service) => service.getAllFeatureFlags())
    )
  );

export const evaluateFlag = (key: string, evaluationDto: EvaluationRequestDto) =>
  runWithFeatureFlagService(
    pipe(
      getFeatureFlagServiceFromContext,
      Effect.flatMap((service) => service.evaluateFeatureFlag(key, evaluationDto))
    )
  );

// Legacy function names for backward compatibility
export const createFeatureFlagService = createFlag;
export const updateFeatureFlagService = updateFlag;
export const deleteFeatureFlagService = deleteFlag;
export const getFeatureFlagByIdService = getFeatureFlagById;
export const getFeatureFlagByKeyService = getFlagByKey;
export const getAllFeatureFlagsService = getAllFlags;
export const evaluateFeatureFlagService = evaluateFlag; 