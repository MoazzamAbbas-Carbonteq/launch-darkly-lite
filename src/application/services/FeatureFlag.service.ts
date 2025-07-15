import { Effect, pipe } from 'effect';
import { FeatureFlagRepository } from '@domain/repositories/FeatureFlag.repository';
import { FeatureFlagResponseDto, CreateFeatureFlagRequestDto, UpdateFeatureFlagRequestDto, EvaluationRequestDto, EvaluationResponseDto, toFeatureFlagResponseDto } from '../dto/FeatureFlag.dto';
import { createFeatureFlagUseCase } from '../use-cases/feature-flag/CreateFeatureFlag.use-case';
import { updateFeatureFlagUseCase } from '../use-cases/feature-flag/UpdateFeatureFlag.use-case';
import { deleteFeatureFlagUseCase } from '../use-cases/feature-flag/DeleteFeatureFlag.use-case';
import { getFeatureFlagUseCase } from '../use-cases/feature-flag/GetFeatureFlag.use-case';
import { getAllFeatureFlagsUseCase } from '../use-cases/feature-flag/GetAllFeatureFlags.use-case';
import { evaluateFeatureFlagUseCase } from '../use-cases/feature-flag/EvaluateFeatureFlag.use-case';

// Service interface
export interface FeatureFlagService {
  createFeatureFlag: (dto: CreateFeatureFlagRequestDto) => Effect.Effect<FeatureFlagResponseDto, Error>;
  updateFeatureFlag: (id: string, dto: UpdateFeatureFlagRequestDto) => Effect.Effect<FeatureFlagResponseDto, Error>;
  deleteFeatureFlag: (id: string) => Effect.Effect<boolean, Error>;
  getFeatureFlag: (id: string) => Effect.Effect<FeatureFlagResponseDto | null, Error>;
  getFeatureFlagByKey: (key: string) => Effect.Effect<FeatureFlagResponseDto | null, Error>;
  getAllFeatureFlags: () => Effect.Effect<FeatureFlagResponseDto[], Error>;
  evaluateFeatureFlag: (key: string, dto: EvaluationRequestDto) => Effect.Effect<EvaluationResponseDto, Error>;
}

// Functional service factory - RECOMMENDED APPROACH
export const makeFeatureFlagService = (featureFlagRepository: FeatureFlagRepository): FeatureFlagService => ({
  createFeatureFlag: (dto: CreateFeatureFlagRequestDto) =>
    createFeatureFlagUseCase(dto, featureFlagRepository),

  updateFeatureFlag: (id: string, dto: UpdateFeatureFlagRequestDto) =>
    updateFeatureFlagUseCase(id, dto, featureFlagRepository),

  deleteFeatureFlag: (id: string) =>
    deleteFeatureFlagUseCase(id, featureFlagRepository),

  getFeatureFlag: (id: string) =>
    getFeatureFlagUseCase(id, featureFlagRepository),

  getFeatureFlagByKey: (key: string) =>
    pipe(
      featureFlagRepository.findByKey(key),
      Effect.map(flag => flag ? toFeatureFlagResponseDto(flag) : null)
    ),

  getAllFeatureFlags: () =>
    getAllFeatureFlagsUseCase(featureFlagRepository),

  evaluateFeatureFlag: (key: string, dto: EvaluationRequestDto) =>
    evaluateFeatureFlagUseCase(key, dto, featureFlagRepository)
}); 