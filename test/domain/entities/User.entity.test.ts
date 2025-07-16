import { Effect } from 'effect';
import {
  UserEntity,
  createUserEntity,
  createUserEntityWithValidation,
  updateUserEntity,
  isAdmin,
  canManageFlags,
  canViewFlags,
  hasPermission,
  validateEmail,
  validateName,
  validateRole,
  toPlainObject,
} from '@domain/entities/User.entity';
import { UserRole } from '@infrastructure/web/types/Api.types';

describe('User Entity', () => {
  const testUserId = '123e4567-e89b-12d3-a456-426614174000';
  const testEmail = 'test@example.com';
  const testName = 'Test User';
  const testDate = new Date('2023-01-01T00:00:00Z');

  describe('createUserEntity', () => {
    it('should create a user entity with all properties', () => {
      const user = createUserEntity(
        testUserId,
        testEmail,
        testName,
        UserRole.USER,
        testDate,
        testDate
      );

      expect(user).toEqual({
        id: testUserId,
        email: testEmail,
        name: testName,
        role: UserRole.USER,
        createdAt: testDate,
        updatedAt: testDate,
      });
    });

    it('should create a user entity with default dates', () => {
      const user = createUserEntity(testUserId, testEmail, testName, UserRole.USER);

      expect(user.id).toBe(testUserId);
      expect(user.email).toBe(testEmail);
      expect(user.name).toBe(testName);
      expect(user.role).toBe(UserRole.USER);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Permission checks', () => {
    const adminUser = createUserEntity(testUserId, testEmail, testName, UserRole.ADMIN);
    const regularUser = createUserEntity(testUserId, testEmail, testName, UserRole.USER);

    describe('isAdmin', () => {
      it('should return true for admin users', () => {
        expect(isAdmin(adminUser)).toBe(true);
      });

      it('should return false for regular users', () => {
        expect(isAdmin(regularUser)).toBe(false);
      });
    });

    describe('canManageFlags', () => {
      it('should return true for admin users', () => {
        expect(canManageFlags(adminUser)).toBe(true);
      });

      it('should return false for regular users', () => {
        expect(canManageFlags(regularUser)).toBe(false);
      });
    });

    describe('canViewFlags', () => {
      it('should return true for admin users', () => {
        expect(canViewFlags(adminUser)).toBe(true);
      });

      it('should return true for regular users', () => {
        expect(canViewFlags(regularUser)).toBe(true);
      });
    });

    describe('hasPermission', () => {
      it('should grant READ permission to all users', () => {
        expect(hasPermission(adminUser, 'READ')).toBe(true);
        expect(hasPermission(regularUser, 'READ')).toBe(true);
      });

      it('should grant WRITE permission only to admin users', () => {
        expect(hasPermission(adminUser, 'WRITE')).toBe(true);
        expect(hasPermission(regularUser, 'WRITE')).toBe(false);
      });

      it('should grant DELETE permission only to admin users', () => {
        expect(hasPermission(adminUser, 'DELETE')).toBe(true);
        expect(hasPermission(regularUser, 'DELETE')).toBe(false);
      });
    });
  });

  describe('Validation functions', () => {
    describe('validateEmail', () => {
      it('should validate correct email addresses', async () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'admin@test-domain.org',
        ];

        for (const email of validEmails) {
          const result = await Effect.runPromise(validateEmail(email));
          expect(result).toBe(email);
        }
      });

      it('should reject invalid email addresses', async () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'test@',
          'test.example.com',
          '',
        ];

        for (const email of invalidEmails) {
          await expect(Effect.runPromise(validateEmail(email))).rejects.toThrow('Invalid email format');
        }
      });
    });

    describe('validateName', () => {
      it('should validate correct names', async () => {
        const validNames = ['John Doe', 'Alice', 'Bob Smith Jr.'];

        for (const name of validNames) {
          const result = await Effect.runPromise(validateName(name));
          expect(result).toBe(name);
        }
      });

      it('should trim whitespace from names', async () => {
        const result = await Effect.runPromise(validateName('  John Doe  '));
        expect(result).toBe('John Doe');
      });

      it('should reject invalid names', async () => {
        const invalidNames = ['', ' ', 'A'];

        for (const name of invalidNames) {
          await expect(Effect.runPromise(validateName(name))).rejects.toThrow(
            'Name must be at least 2 characters long'
          );
        }
      });
    });

    describe('validateRole', () => {
      it('should validate correct roles', async () => {
        const validRoles = [UserRole.ADMIN, UserRole.USER];

        for (const role of validRoles) {
          const result = await Effect.runPromise(validateRole(role));
          expect(result).toBe(role);
        }
      });

      it('should reject invalid roles', async () => {
        const invalidRoles = ['invalid-role' as UserRole, '' as UserRole];

        for (const role of invalidRoles) {
          await expect(Effect.runPromise(validateRole(role))).rejects.toThrow('Invalid user role');
        }
      });
    });
  });

  describe('createUserEntityWithValidation', () => {
    it('should create a valid user entity with validation', async () => {
      const user = await Effect.runPromise(
        createUserEntityWithValidation(testUserId, testEmail, testName, UserRole.USER)
      );

      expect(user.id).toBe(testUserId);
      expect(user.email).toBe(testEmail);
      expect(user.name).toBe(testName);
      expect(user.role).toBe(UserRole.USER);
    });

    it('should reject invalid data during validation', async () => {
      await expect(
        Effect.runPromise(
          createUserEntityWithValidation(testUserId, 'invalid-email', testName, UserRole.USER)
        )
      ).rejects.toThrow('Invalid email format');
    });
  });

  describe('updateUserEntity', () => {
    const originalUser = createUserEntity(testUserId, testEmail, testName, UserRole.USER, testDate, testDate);

    it('should update user with valid data', async () => {
      const updates = {
        email: 'newemail@example.com',
        name: 'New Name',
        role: UserRole.ADMIN,
      };

      const updatedUser = await Effect.runPromise(updateUserEntity(originalUser, updates));

      expect(updatedUser.id).toBe(originalUser.id);
      expect(updatedUser.email).toBe(updates.email);
      expect(updatedUser.name).toBe(updates.name);
      expect(updatedUser.role).toBe(updates.role);
      expect(updatedUser.createdAt).toBe(originalUser.createdAt);
      expect(updatedUser.updatedAt).not.toBe(originalUser.updatedAt);
    });

    it('should update user with partial data', async () => {
      const updates = { name: 'Updated Name' };

      const updatedUser = await Effect.runPromise(updateUserEntity(originalUser, updates));

      expect(updatedUser.email).toBe(originalUser.email);
      expect(updatedUser.name).toBe(updates.name);
      expect(updatedUser.role).toBe(originalUser.role);
    });

    it('should handle empty updates', async () => {
      const updatedUser = await Effect.runPromise(updateUserEntity(originalUser, {}));

      expect(updatedUser.email).toBe(originalUser.email);
      expect(updatedUser.name).toBe(originalUser.name);
      expect(updatedUser.role).toBe(originalUser.role);
      expect(updatedUser.updatedAt).not.toBe(originalUser.updatedAt);
    });

    it('should reject invalid updates', async () => {
      const invalidUpdates = { email: 'invalid-email' };

      await expect(
        Effect.runPromise(updateUserEntity(originalUser, invalidUpdates))
      ).rejects.toThrow('Invalid email format');
    });
  });

  describe('toPlainObject', () => {
    it('should convert entity to plain object', () => {
      const user = createUserEntity(testUserId, testEmail, testName, UserRole.ADMIN, testDate, testDate);
      const plainObject = toPlainObject(user);

      expect(plainObject).toEqual({
        id: testUserId,
        email: testEmail,
        name: testName,
        role: UserRole.ADMIN,
        createdAt: testDate,
        updatedAt: testDate,
      });

      // Ensure it's a plain object, not the original entity
      expect(plainObject).not.toBe(user);
    });
  });
}); 