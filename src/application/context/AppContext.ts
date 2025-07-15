import { Context, Effect, Layer, pipe } from 'effect';
import { AppDataSource } from '@infrastructure/database/DataSource.config';
import { UserModel } from '@infrastructure/database/models/User.model';
import { FeatureFlagModel } from '@infrastructure/database/models/FeatureFlag.model';
import { UserRepository } from '@domain/repositories/User.repository';
import { FeatureFlagRepository } from '@domain/repositories/FeatureFlag.repository';
import { createUserRepositoryImpl } from '@infrastructure/database/repositories/User.repository.impl';
import { createFeatureFlagRepositoryImpl } from '@infrastructure/database/repositories/FeatureFlag.repository.impl';
import { makeUserService, UserService } from '../services/User.service';
import { makeFeatureFlagService, FeatureFlagService } from '../services/FeatureFlag.service';

// Context tags for dependency injection
export class UserRepositoryContext extends Context.Tag("UserRepository")<UserRepositoryContext, UserRepository>() {}
export class FeatureFlagRepositoryContext extends Context.Tag("FeatureFlagRepository")<FeatureFlagRepositoryContext, FeatureFlagRepository>() {}
export class UserServiceContext extends Context.Tag("UserService")<UserServiceContext, UserService>() {}
export class FeatureFlagServiceContext extends Context.Tag("FeatureFlagService")<FeatureFlagServiceContext, FeatureFlagService>() {}

// Repository layers
export const UserRepositoryLive = Layer.effect(
  UserRepositoryContext,
  Effect.sync(() => {
    const typeormRepository = AppDataSource.getRepository(UserModel);
    return createUserRepositoryImpl(typeormRepository);
  })
);

export const FeatureFlagRepositoryLive = Layer.effect(
  FeatureFlagRepositoryContext,
  Effect.sync(() => {
    const typeormRepository = AppDataSource.getRepository(FeatureFlagModel);
    return createFeatureFlagRepositoryImpl(typeormRepository);
  })
);

// Service layers
export const UserServiceLive = Layer.effect(
  UserServiceContext,
  pipe(
    UserRepositoryContext,
    Effect.map((userRepository) => makeUserService(userRepository))
  )
).pipe(Layer.provide(UserRepositoryLive));

export const FeatureFlagServiceLive = Layer.effect(
  FeatureFlagServiceContext,
  pipe(
    FeatureFlagRepositoryContext,
    Effect.map((featureFlagRepository) => makeFeatureFlagService(featureFlagRepository))
  )
).pipe(Layer.provide(FeatureFlagRepositoryLive));

// Combined application context layer
export const AppContextLive = Layer.mergeAll(
  UserRepositoryLive,
  FeatureFlagRepositoryLive,
  UserServiceLive,
  FeatureFlagServiceLive
);

// Helper functions to run effects with context
export const runWithUserService = <A, E>(effect: Effect.Effect<A, E, UserServiceContext>) =>
  Effect.provide(effect, UserServiceLive);

export const runWithFeatureFlagService = <A, E>(effect: Effect.Effect<A, E, FeatureFlagServiceContext>) =>
  Effect.provide(effect, FeatureFlagServiceLive);

export const runWithAppContext = <A, E>(effect: Effect.Effect<A, E, UserServiceContext | FeatureFlagServiceContext>) =>
  Effect.provide(effect, AppContextLive);

// Context-aware service accessors
export const getUserService = UserServiceContext;
export const getFeatureFlagService = FeatureFlagServiceContext;
export const getUserRepository = UserRepositoryContext;
export const getFeatureFlagRepository = FeatureFlagRepositoryContext; 