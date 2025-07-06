import { Repository } from "typeorm";
import { Effect } from "effect";
import type { FlagRepository } from "./FlagRepository";
import { Flag as FlagEntity } from "../entities/Flag.entity";
import type { Flag as FlagDomain } from "../domain/Flag.domain";

export const makeFlagRepositoryTypeORM = (repository: Repository<FlagEntity>): FlagRepository => ({
  findById: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const flag = await repository.findOne({ where: { id } });
        return flag as FlagDomain | null;
      },
      catch: (e) => new Error(String(e)),
    }),

  create: (flag: Omit<FlagDomain, "id" | "createdAt">) =>
    Effect.tryPromise({
      try: async () => {
        const newFlag = repository.create(flag);
        const savedFlag = await repository.save(newFlag);
        return savedFlag as FlagDomain;
      },
      catch: (e) => new Error(String(e)),
    }),

  findAll: () =>
    Effect.tryPromise({
      try: async () => {
        const flags = await repository.find();
        return flags as FlagDomain[];
      },
      catch: (e) => new Error(String(e)),
    }),

  findByKey: (key: string) =>
    Effect.tryPromise({
      try: async () => {
        const flag = await repository.findOne({ where: { key } });
        return flag as FlagDomain | null;
      },
      catch: (e) => new Error(String(e)),
    }),

  update: (id: string, updates: Partial<Omit<FlagDomain, "id" | "createdAt">>) =>
    Effect.tryPromise({
      try: async () => {
        await repository.update(id, updates);
        const updatedFlag = await repository.findOne({ where: { id } });
        if (!updatedFlag) {
          throw new Error(`Flag with id ${id} not found`);
        }
        return updatedFlag as FlagDomain;
      },
      catch: (e) => new Error(String(e)),
    }),

  delete: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const result = await repository.delete(id);
        return result.affected === 1;
      },
      catch: (e) => new Error(String(e)),
    }),
}); 