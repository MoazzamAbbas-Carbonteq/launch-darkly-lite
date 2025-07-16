import { Effect } from 'effect';
import bcrypt from 'bcryptjs';
import { loginUserUseCase, LoginRequest } from '@application/use-cases/auth/LoginUser.use-case';
import { UserRepository, UserAuthData } from '@domain/repositories/User.repository';
import { UserRole } from '@infrastructure/web/types/Api.types';
import { createUserEntity } from '@domain/entities/User.entity';

// Mock UserRepository
const createMockUserRepository = (): UserRepository => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('LoginUser Use Case', () => {
  let mockUserRepository: UserRepository;
  const testUserId = '123e4567-e89b-12d3-a456-426614174000';
  const testEmail = 'test@example.com';
  const testPassword = 'password123';
  const testHashedPassword = '$2a$12$hashedpassword';
  const testDate = new Date('2023-01-01T00:00:00Z');

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    jest.clearAllMocks();
  });

  const createValidLoginRequest = (): LoginRequest => ({
    email: testEmail,
    password: testPassword,
  });

  const createUserAuthData = (): UserAuthData => ({
    id: testUserId,
    email: testEmail,
    password: testHashedPassword,
    name: 'Test User',
    role: UserRole.USER,
    createdAt: testDate,
    updatedAt: testDate,
  });

  describe('Successful login', () => {
    it('should login user with valid credentials', async () => {
      const loginRequest = createValidLoginRequest();
      const userAuthData = createUserAuthData();

      (mockUserRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        Effect.succeed(userAuthData)
      );

      // Mock bcrypt.compare to return true
      const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await Effect.runPromise(
        loginUserUseCase(loginRequest, mockUserRepository)
      );

      expect(result.user.id).toBe(testUserId);
      expect(result.user.email).toBe(testEmail);
      expect(result.user.name).toBe('Test User');
      expect(result.user.role).toBe(UserRole.USER);
      expect(result.user.createdAt).toBe(testDate);
      expect(result.user.updatedAt).toBe(testDate);

      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(testEmail);
      expect(bcryptCompareSpy).toHaveBeenCalledWith(testPassword, testHashedPassword);

      bcryptCompareSpy.mockRestore();
    });
  });

  describe('Login validation', () => {
    it('should reject login with missing email', async () => {
      const invalidRequest = {
        email: '',
        password: testPassword,
      };

      await expect(
        Effect.runPromise(loginUserUseCase(invalidRequest, mockUserRepository))
      ).rejects.toThrow('Email is required and must be a string');
    });

    it('should reject login with missing password', async () => {
      const invalidRequest = {
        email: testEmail,
        password: '',
      };

      await expect(
        Effect.runPromise(loginUserUseCase(invalidRequest, mockUserRepository))
      ).rejects.toThrow('Password is required and must be a string');
    });

    it('should reject login with non-string email', async () => {
      const invalidRequest = {
        email: 123 as any,
        password: testPassword,
      };

      await expect(
        Effect.runPromise(loginUserUseCase(invalidRequest, mockUserRepository))
      ).rejects.toThrow('Email is required and must be a string');
    });

    it('should reject login with non-string password', async () => {
      const invalidRequest = {
        email: testEmail,
        password: 123 as any,
      };

      await expect(
        Effect.runPromise(loginUserUseCase(invalidRequest, mockUserRepository))
      ).rejects.toThrow('Password is required and must be a string');
    });
  });

  describe('Authentication failures', () => {
    it('should reject login with non-existent user', async () => {
      const loginRequest = createValidLoginRequest();

      (mockUserRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        Effect.succeed(null)
      );

      await expect(
        Effect.runPromise(loginUserUseCase(loginRequest, mockUserRepository))
      ).rejects.toThrow('Invalid email or password');

      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(testEmail);
    });

    it('should reject login with incorrect password', async () => {
      const loginRequest = createValidLoginRequest();
      const userAuthData = createUserAuthData();

      (mockUserRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        Effect.succeed(userAuthData)
      );

      // Mock bcrypt.compare to return false
      const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        Effect.runPromise(loginUserUseCase(loginRequest, mockUserRepository))
      ).rejects.toThrow('Invalid email or password');

      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith(testEmail);
      expect(bcryptCompareSpy).toHaveBeenCalledWith(testPassword, testHashedPassword);

      bcryptCompareSpy.mockRestore();
    });

    it('should handle password verification errors', async () => {
      const loginRequest = createValidLoginRequest();
      const userAuthData = createUserAuthData();

      (mockUserRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        Effect.succeed(userAuthData)
      );

      // Mock bcrypt.compare to throw an error
      const originalCompare = bcrypt.compare;
      bcrypt.compare = jest.fn().mockRejectedValue(new Error('Bcrypt error'));

      await expect(
        Effect.runPromise(loginUserUseCase(loginRequest, mockUserRepository))
      ).rejects.toThrow('Password verification failed');

      // Restore original function
      bcrypt.compare = originalCompare;
    });
  });

  describe('Repository errors', () => {
    it('should handle repository findByEmailWithPassword errors', async () => {
      const loginRequest = createValidLoginRequest();

      (mockUserRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        Effect.fail(new Error('Database connection error'))
      );

      await expect(
        Effect.runPromise(loginUserUseCase(loginRequest, mockUserRepository))
      ).rejects.toThrow('Database connection error');
    });
  });

  describe('User entity creation', () => {
    it('should handle invalid user data during entity creation', async () => {
      const loginRequest = createValidLoginRequest();
      const invalidUserAuthData: UserAuthData = {
        ...createUserAuthData(),
        email: 'invalid-email', // Invalid email format
      };

      (mockUserRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        Effect.succeed(invalidUserAuthData)
      );

      const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(
        Effect.runPromise(loginUserUseCase(loginRequest, mockUserRepository))
      ).rejects.toThrow('Invalid email format');

      bcryptCompareSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle null or undefined user auth data', async () => {
      const loginRequest = createValidLoginRequest();

      (mockUserRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        Effect.succeed(undefined)
      );

      await expect(
        Effect.runPromise(loginUserUseCase(loginRequest, mockUserRepository))
      ).rejects.toThrow('Invalid email or password');
    });

    it('should trim and validate email case-insensitively', async () => {
      const loginRequest = {
        email: '  TEST@EXAMPLE.COM  ',
        password: testPassword,
      };
      const userAuthData = {
        ...createUserAuthData(),
        email: 'test@example.com',
      };

      (mockUserRepository.findByEmailWithPassword as jest.Mock).mockResolvedValue(
        Effect.succeed(userAuthData)
      );

      const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await Effect.runPromise(
        loginUserUseCase(loginRequest, mockUserRepository)
      );

      expect(result.user.email).toBe('test@example.com');
      expect(mockUserRepository.findByEmailWithPassword).toHaveBeenCalledWith('  TEST@EXAMPLE.COM  ');

      bcryptCompareSpy.mockRestore();
    });
  });
}); 