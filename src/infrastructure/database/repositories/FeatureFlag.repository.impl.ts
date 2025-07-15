import { Repository } from "typeorm";
import { Effect, pipe } from "effect";
import { FeatureFlagRepository, CreateFeatureFlagData, UpdateFeatureFlagData } from "@domain/repositories/FeatureFlag.repository";
import { FeatureFlagEntity, createFeatureFlagEntityWithValidation } from "@domain/entities/FeatureFlag.entity";
import { FeatureFlagModel } from "../models/FeatureFlag.model";

// Helper function for domain entity conversion with validation
const toDomainEntityWithValidation = (model: FeatureFlagModel): Effect.Effect<FeatureFlagEntity, Error> =>
  createFeatureFlagEntityWithValidation(
    model.id,
    model.key,
    model.name,
    model.description,
    model.enabled,
    model.defaultValue,
    model.rules,
    model.createdBy,
    model.createdAt,
    model.updatedAt,
    model.expiresAt
  );

// Repository implementation factory function
export const createFeatureFlagRepositoryImpl = (repository: Repository<FeatureFlagModel>): FeatureFlagRepository => ({
  findById: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const flag = await repository.findOne({ where: { id }, relations: ['rules', 'rules.conditions'] });
        return flag;
      },
      catch: (e) => new Error(`Failed to find feature flag by id: ${String(e)}`),
    }).pipe(
      Effect.flatMap((flag) => 
        flag ? toDomainEntityWithValidation(flag).pipe(Effect.map(entity => entity)) : Effect.succeed(null)
      )
    ),

  findByKey: (key: string) =>
    Effect.tryPromise({
      try: async () => {
        const flag = await repository.findOne({ where: { key }, relations: ['rules', 'rules.conditions'] });
        return flag;
      },
      catch: (e) => new Error(`Failed to find feature flag by key: ${String(e)}`),
    }).pipe(
      Effect.flatMap((flag) => 
        flag ? toDomainEntityWithValidation(flag).pipe(Effect.map(entity => entity)) : Effect.succeed(null)
      )
    ),

  findAll: () =>
    Effect.tryPromise({
      try: async () => {
        const flags = await repository.find({ relations: ['rules', 'rules.conditions'] });
        return flags;
      },
      catch: (e) => new Error(`Failed to find all feature flags: ${String(e)}`),
    }).pipe(
      Effect.flatMap((flags: FeatureFlagModel[]) => 
        Effect.all(flags.map((flag: FeatureFlagModel) => toDomainEntityWithValidation(flag)))
      )
    ),

  create: (flagData: CreateFeatureFlagData) =>
    Effect.tryPromise({
      try: async () => {
        const newFlag = repository.create(flagData);
        const savedFlag = await repository.save(newFlag);
        return savedFlag;
      },
      catch: (e) => new Error(`Failed to create feature flag: ${String(e)}`),
    }).pipe(
      Effect.flatMap((savedFlag) => 
        toDomainEntityWithValidation(savedFlag)
      )
    ),

  update: (id: string, updates: UpdateFeatureFlagData) =>
    Effect.tryPromise({
      try: async () => {
        // Handle rules separately if they exist
        const { rules, ...otherUpdates } = updates;
        
        // Update basic fields
        await repository.update(id, otherUpdates);
        
        // If rules are provided, handle them separately
        if (rules !== undefined) {
          // This would need more complex logic to handle rule updates
          // For now, we'll just update the basic fields
        }
        
        const updatedFlag = await repository.findOne({ where: { id }, relations: ['rules', 'rules.conditions'] });
        if (!updatedFlag) {
          throw new Error(`Feature flag with id ${id} not found`);
        }
        return updatedFlag;
      },
      catch: (e) => new Error(`Failed to update feature flag: ${String(e)}`),
    }).pipe(
      Effect.flatMap((updatedFlag) => 
        toDomainEntityWithValidation(updatedFlag)
      )
    ),

  delete: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const result = await repository.delete(id);
        return result.affected === 1;
      },
      catch: (e) => new Error(`Failed to delete feature flag: ${String(e)}`),
    })
}); 