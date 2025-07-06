import { Effect } from "effect";
import { FeatureFlagEntity } from "../entities/FeatureFlag.entity";
import { FlagRule } from "../../types/Api.types";

export interface CreateFeatureFlagData {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  defaultValue: boolean;
  rules: FlagRule[];
  createdBy: string;
  expiresAt?: Date;
}

export interface UpdateFeatureFlagData {
  key?: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  defaultValue?: boolean;
  rules?: FlagRule[];
  expiresAt?: Date;
}

export interface FeatureFlagRepository {
  findById(id: string): Effect.Effect<FeatureFlagEntity | null, Error>;
  findByKey(key: string): Effect.Effect<FeatureFlagEntity | null, Error>;
  findAll(): Effect.Effect<FeatureFlagEntity[], Error>;
  create(flagData: CreateFeatureFlagData): Effect.Effect<FeatureFlagEntity, Error>;
  update(id: string, updates: UpdateFeatureFlagData): Effect.Effect<FeatureFlagEntity, Error>;
  delete(id: string): Effect.Effect<boolean, Error>;
} 