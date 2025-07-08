import { Repository } from "typeorm";
import { Effect, pipe } from "effect";
import { UserRepository, CreateUserData, UpdateUserData } from "@domain/repositories/User.repository";
import { UserEntity, createUserEntityWithValidation } from "@domain/entities/User.entity";
import { UserModel } from "../models/User.model";

// Helper function for domain entity conversion with validation
const toDomainEntityWithValidation = (model: UserModel): Effect.Effect<UserEntity, Error> =>
  createUserEntityWithValidation(
    model.id,
    model.email,
    model.name,
    model.role,
    model.createdAt,
    model.updatedAt
  );

// Repository implementation factory function
export const createUserRepositoryImpl = (repository: Repository<UserModel>): UserRepository => ({
  findById: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const user = await repository.findOne({ where: { id } });
        return user;
      },
      catch: (e) => new Error(`Failed to find user by id: ${String(e)}`),
    }).pipe(
      Effect.flatMap((user) => 
        user ? toDomainEntityWithValidation(user).pipe(Effect.map(entity => entity)) : Effect.succeed(null)
      )
    ),

  findByEmail: (email: string) =>
    Effect.tryPromise({
      try: async () => {
        const user = await repository.findOne({ where: { email } });
        return user;
      },
      catch: (e) => new Error(`Failed to find user by email: ${String(e)}`),
    }).pipe(
      Effect.flatMap((user) => 
        user ? toDomainEntityWithValidation(user).pipe(Effect.map(entity => entity)) : Effect.succeed(null)
      )
    ),

  create: (userData: CreateUserData) =>
    Effect.tryPromise({
      try: async () => {
        const newUser = repository.create(userData);
        const savedUser = await repository.save(newUser);
        return savedUser;
      },
      catch: (e) => new Error(`Failed to create user: ${String(e)}`),
    }).pipe(
      Effect.flatMap((savedUser) => 
        toDomainEntityWithValidation(savedUser)
      )
    ),

  update: (id: string, updates: UpdateUserData) =>
    Effect.tryPromise({
      try: async () => {
        await repository.update(id, updates);
        const updatedUser = await repository.findOne({ where: { id } });
        if (!updatedUser) {
          throw new Error(`User with id ${id} not found`);
        }
        return updatedUser;
      },
      catch: (e) => new Error(`Failed to update user: ${String(e)}`),
    }).pipe(
      Effect.flatMap((updatedUser) => 
        toDomainEntityWithValidation(updatedUser)
      )
    ),

  delete: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const result = await repository.delete(id);
        return result.affected === 1;
      },
      catch: (e) => new Error(`Failed to delete user: ${String(e)}`),
    }),
}); 