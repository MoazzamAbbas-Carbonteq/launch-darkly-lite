import { Effect, pipe } from 'effect';
import { z } from 'zod';
import { FeatureFlagEntity } from '../../domain/entities/FeatureFlag.entity';
import { FlagRule } from '../../types/Api.types';

// Zod schemas for validation
export const CreateFeatureFlagRequestSchema = z.object({
  key: z.string().min(1, 'Key is required').max(100, 'Key must be less than 100 characters'),
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  enabled: z.boolean().default(false),
  defaultValue: z.boolean().default(false),
  rules: z.array(z.any()).default([]),
  createdBy: z.string().min(1, 'Created by is required'),
  expiresAt: z.date().optional()
});

export const UpdateFeatureFlagRequestSchema = z.object({
  key: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
  defaultValue: z.boolean().optional(),
  rules: z.array(z.any()).optional(),
  expiresAt: z.date().optional()
});

export const EvaluationRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  context: z.record(z.any()).optional()
});

// DTO Types from Zod schemas
export type CreateFeatureFlagRequestDto = z.infer<typeof CreateFeatureFlagRequestSchema>;
export type UpdateFeatureFlagRequestDto = z.infer<typeof UpdateFeatureFlagRequestSchema>;
export type EvaluationRequestDto = z.infer<typeof EvaluationRequestSchema>;

// Response DTOs
export interface FeatureFlagResponseDto {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  defaultValue: boolean;
  rules: FlagRule[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface EvaluationResponseDto {
  flagKey: string;
  value: any;
  reason: string;
  timestamp: Date;
}

// DTO Validation Functions with Effect and Zod
export const validateCreateFeatureFlagRequest = (dto: CreateFeatureFlagRequestDto): Effect.Effect<CreateFeatureFlagRequestDto, Error> =>
  pipe(
    Effect.try({
      try: () => CreateFeatureFlagRequestSchema.parse(dto),
      catch: (error) => new Error(`Validation failed: ${error}`)
    }),
    Effect.flatMap((validatedDto) => {
      // Additional business logic validation
      if (validatedDto.key && !/^[a-zA-Z0-9_-]+$/.test(validatedDto.key)) {
        return Effect.fail(new Error('Key can only contain alphanumeric characters, hyphens, and underscores'));
      }
      return Effect.succeed(validatedDto);
    })
  );

export const validateUpdateFeatureFlagRequest = (dto: UpdateFeatureFlagRequestDto): Effect.Effect<UpdateFeatureFlagRequestDto, Error> =>
  pipe(
    Effect.try({
      try: () => UpdateFeatureFlagRequestSchema.parse(dto),
      catch: (error) => new Error(`Validation failed: ${error}`)
    })
  );

export const validateEvaluationRequest = (dto: EvaluationRequestDto): Effect.Effect<EvaluationRequestDto, Error> =>
  pipe(
    Effect.try({
      try: () => EvaluationRequestSchema.parse(dto),
      catch: (error) => new Error(`Validation failed: ${error}`)
    })
  );

// DTO Transformation Functions
export const toFeatureFlagResponseDto = (entity: FeatureFlagEntity): FeatureFlagResponseDto => ({
  id: entity.id,
  key: entity.key,
  name: entity.name,
  description: entity.description,
  enabled: entity.enabled,
  defaultValue: entity.defaultValue,
  rules: entity.rules,
  createdBy: entity.createdBy,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
  expiresAt: entity.expiresAt
});

export const toFeatureFlagResponseDtoArray = (entities: FeatureFlagEntity[]): FeatureFlagResponseDto[] =>
  entities.map(entity => toFeatureFlagResponseDto(entity));

export const toEvaluationResponseDto = (
  flagKey: string,
  value: any,
  reason: string
): EvaluationResponseDto => ({
  flagKey,
  value,
  reason,
  timestamp: new Date(),
}); 