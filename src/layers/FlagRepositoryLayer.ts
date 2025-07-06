import { Layer, Context } from "effect";
import { AppDataSource } from "../database/DataSource.config";
import { makeFlagRepositoryTypeORM } from "../repositories/Flag.repository.impl";
import type { FlagRepository } from "../repositories/Flag.repository";
import { Flag } from "../entities/Flag.entity";

// Create a service tag for FlagRepository
export const FlagRepositoryTag = Context.GenericTag<FlagRepository>("FlagRepository");

// Create the layer
export const makeFlagRepositoryLayer = () =>
  Layer.succeed(
    FlagRepositoryTag,
    makeFlagRepositoryTypeORM(AppDataSource.getRepository(Flag))
  ); 