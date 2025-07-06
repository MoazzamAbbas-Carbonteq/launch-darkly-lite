import { UserRole } from '../../types/Api.types';
import { Effect } from 'effect';

// User entity as immutable data structure
export interface UserEntity {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Factory function to create UserEntity
export const createUserEntity = (
  id: string,
  email: string,
  name: string,
  role: UserRole,
  createdAt: Date = new Date(),
  updatedAt: Date = new Date()
): UserEntity => ({
  id,
  email,
  name,
  role,
  createdAt,
  updatedAt,
});

// Business logic functions
export const isAdmin = (user: UserEntity): boolean => {
  return user.role === UserRole.ADMIN;
};

export const canManageFlags = (user: UserEntity): boolean => {
  return user.role === UserRole.ADMIN;
};

export const canViewFlags = (user: UserEntity): boolean => {
  return user.role === UserRole.ADMIN || user.role === UserRole.USER;
};

export const hasPermission = (user: UserEntity, permission: 'READ' | 'WRITE' | 'DELETE'): boolean => {
  switch (permission) {
    case 'READ':
      return canViewFlags(user);
    case 'WRITE':
    case 'DELETE':
      return canManageFlags(user);
    default:
      return false;
  }
};

// Validation functions
export const validateEmail = (email: string): Effect.Effect<string, Error> =>
  Effect.try({
    try: () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }
      return email;
    },
    catch: (error) => error as Error,
  });

export const validateName = (name: string): Effect.Effect<string, Error> =>
  Effect.try({
    try: () => {
      if (!name || name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      return name.trim();
    },
    catch: (error) => error as Error,
  });

export const validateRole = (role: UserRole): Effect.Effect<UserRole, Error> =>
  Effect.try({
    try: () => {
      if (!Object.values(UserRole).includes(role)) {
        throw new Error('Invalid user role');
      }
      return role;
    },
    catch: (error) => error as Error,
  });

// Factory function with validation
export const createUserEntityWithValidation = (
  id: string,
  email: string,
  name: string,
  role: UserRole,
  createdAt: Date = new Date(),
  updatedAt: Date = new Date()
): Effect.Effect<UserEntity, Error> =>
  Effect.all([
    validateEmail(email),
    validateName(name),
    validateRole(role),
  ]).pipe(
    Effect.map(([validEmail, validName, validRole]) =>
      createUserEntity(id, validEmail, validName, validRole, createdAt, updatedAt)
    )
  );

// Update function (returns new entity)
export const updateUserEntity = (
  user: UserEntity,
  updates: {
    email?: string;
    name?: string;
    role?: UserRole;
  }
): Effect.Effect<UserEntity, Error> => {
  const validations = [];

  if (updates.email) {
    validations.push(validateEmail(updates.email));
  }
  if (updates.name) {
    validations.push(validateName(updates.name));
  }
  if (updates.role) {
    validations.push(validateRole(updates.role));
  }

  if (validations.length === 0) {
    return Effect.succeed(createUserEntity(
      user.id,
      updates.email ?? user.email,
      updates.name ?? user.name,
      updates.role ?? user.role,
      user.createdAt,
      new Date()
    ));
  }

  return Effect.all(validations).pipe(
    Effect.map(() =>
      createUserEntity(
        user.id,
        updates.email ?? user.email,
        updates.name ?? user.name,
        updates.role ?? user.role,
        user.createdAt,
        new Date()
      )
    )
  );
};

// Convert to plain object (for API responses)
export const toPlainObject = (user: UserEntity): {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
} => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
}); 