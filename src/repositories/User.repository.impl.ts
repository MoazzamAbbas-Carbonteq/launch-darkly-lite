import { Repository } from "typeorm";
import { Effect } from "effect";
import type { UserRepository } from "./UserRepository";
import { User as UserEntity } from "../entities/User.entity";
import type { User as UserType } from "../types";

export const makeUserRepositoryTypeORM = (repository: Repository<UserEntity>): UserRepository => ({
  findById: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const user = await repository.findOne({ where: { id } });
        return user as UserType | null;
      },
      catch: (e) => new Error(String(e)),
    }),

  findByEmail: (email: string) =>
    Effect.tryPromise({
      try: async () => {
        const user = await repository.findOne({ where: { email } });
        return user as UserType | null;
      },
      catch: (e) => new Error(String(e)),
    }),

  create: (user: Omit<UserType, "id" | "createdAt" | "updatedAt">) =>
    Effect.tryPromise({
      try: async () => {
        const newUser = repository.create(user);
        const savedUser = await repository.save(newUser);
        return savedUser as UserType;
      },
      catch: (e) => new Error(String(e)),
    }),

  update: (id: string, updates: Partial<Omit<UserType, "id" | "createdAt" | "updatedAt">>) =>
    Effect.tryPromise({
      try: async () => {
        await repository.update(id, updates);
        const updatedUser = await repository.findOne({ where: { id } });
        if (!updatedUser) {
          throw new Error(`User with id ${id} not found`);
        }
        return updatedUser as UserType;
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