import { Effect, pipe } from 'effect';
import { UserEntity, createUserEntity, createUserEntityWithValidation, validateEmail, validateName } from '../domain/entities/User.entity';
import { UserRepository } from '../domain/repositories/User.repository';
import { createUserRepositoryImpl } from '../infrastructure/repositories/User.repository.impl';
import { validateCreateUserRequest, toResponseDto, CreateUserRequestDto, UserResponseDto } from '../application/dto/User.dto';
import { createUserUseCaseWithRepo, CreateUserRequest } from '../application/use-cases/user/CreateUser.use-case';
import { AppDataSource } from '../database/DataSource.config';
import { UserModel } from '../models/User.model';
import { Repository } from 'typeorm';

// ===== FUNCTIONAL REPOSITORY CREATION =====

// Pure functional repository factory - no new keyword
export const makeUserRepository = (typeormRepository: Repository<UserModel>): UserRepository => ({
  findById: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const user = await typeormRepository.findOne({ where: { id } });
        return user;
      },
      catch: (e) => new Error(`Failed to find user by id: ${String(e)}`),
    }).pipe(
      Effect.flatMap((user) => 
        user ? createUserEntityWithValidation(
          user.id,
          user.email,
          user.name,
          user.role,
          user.createdAt,
          user.updatedAt
        ).pipe(Effect.map(entity => entity)) : Effect.succeed(null)
      )
    ),

  findByEmail: (email: string) =>
    Effect.tryPromise({
      try: async () => {
        const user = await typeormRepository.findOne({ where: { email } });
        return user;
      },
      catch: (e) => new Error(`Failed to find user by email: ${String(e)}`),
    }).pipe(
      Effect.flatMap((user) => 
        user ? createUserEntityWithValidation(
          user.id,
          user.email,
          user.name,
          user.role,
          user.createdAt,
          user.updatedAt
        ).pipe(Effect.map(entity => entity)) : Effect.succeed(null)
      )
    ),

  create: (userData) =>
    Effect.tryPromise({
      try: async () => {
        const newUser = typeormRepository.create(userData);
        const savedUser = await typeormRepository.save(newUser);
        return savedUser;
      },
      catch: (e) => new Error(`Failed to create user: ${String(e)}`),
    }).pipe(
      Effect.flatMap((savedUser) => 
        createUserEntityWithValidation(
          savedUser.id,
          savedUser.email,
          savedUser.name,
          savedUser.role,
          savedUser.createdAt,
          savedUser.updatedAt
        )
      )
    ),

  update: (id: string, updates) =>
    Effect.tryPromise({
      try: async () => {
        await typeormRepository.update(id, updates);
        const updatedUser = await typeormRepository.findOne({ where: { id } });
        if (!updatedUser) {
          throw new Error(`User with id ${id} not found`);
        }
        return updatedUser;
      },
      catch: (e) => new Error(`Failed to update user: ${String(e)}`),
    }).pipe(
      Effect.flatMap((updatedUser) => 
        createUserEntityWithValidation(
          updatedUser.id,
          updatedUser.email,
          updatedUser.name,
          updatedUser.role,
          updatedUser.createdAt,
          updatedUser.updatedAt
        )
      )
    ),

  delete: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        const result = await typeormRepository.delete(id);
        return result.affected === 1;
      },
      catch: (e) => new Error(`Failed to delete user: ${String(e)}`),
    })
});

// ===== FUNCTIONAL APPROACH (EXPLICIT DEPENDENCY) =====

// Pure function - no classes, no new keyword
export const createUserFunctional = (
  requestDto: CreateUserRequestDto,
  userRepository: UserRepository
): Effect.Effect<UserResponseDto, Error> =>
  pipe(
    // Validate DTO
    validateCreateUserRequest(requestDto),
    // Transform to use case request
    Effect.map((validatedDto) => ({
      email: validatedDto.email,
      password: validatedDto.password,
      name: validatedDto.name,
      role: validatedDto.role
    })),
    // Execute use case
    Effect.flatMap((useCaseRequest) => 
      createUserUseCaseWithRepo(useCaseRequest, userRepository)
    ),
    // Transform to response DTO
    Effect.map((response) => toResponseDto(response.user))
  );

// ===== TESTING EXAMPLES =====

// Easy to test - no mocking needed, just pass different implementations
export const testCreateUser = async () => {
  // Mock repository implementation using functional approach
  const mockRepository: UserRepository = {
    findById: () => Effect.succeed(null),
    findByEmail: () => Effect.succeed(null), // No existing user
    create: (userData) => Effect.succeed(
      // Using the functional factory instead of constructor
      createUserEntity(
        'mock-id',
        userData.email,
        userData.name,
        userData.role,
        new Date(),
        new Date()
      )
    ),
    update: () => Effect.fail(new Error('Not implemented')),
    delete: () => Effect.fail(new Error('Not implemented'))
  };

  const testDto: CreateUserRequestDto = {
    email: 'test@example.com',
    password: 'testpass123',
    name: 'Test User'
  };

  const result = await Effect.runPromise(
    createUserFunctional(testDto, mockRepository)
  );
  
  console.log('Test result:', result);
  return result;
};

// ===== USAGE EXAMPLES =====

// Example 1: Using explicit dependency injection
export const exampleExplicitDI = async () => {
  const typeormRepo = AppDataSource.getRepository(UserModel);
  const userRepository = makeUserRepository(typeormRepo);
  
  const dto: CreateUserRequestDto = {
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  };

  return Effect.runPromise(
    createUserFunctional(dto, userRepository)
  );
};

// Pure function for user validation
export const validateUserData = (
  email: string,
  password: string,
  name: string
): Effect.Effect<{ email: string; password: string; name: string }, Error> =>
  pipe(
    Effect.all([
      validateEmail(email),
      validateName(name),
      Effect.succeed(password) // Password validation could be added here
    ]),
    Effect.map(([validEmail, validName, validPassword]) => ({
      email: validEmail,
      password: validPassword,
      name: validName
    }))
  );

// Example 1: Pure functional usage
export const exampleUsage1 = async () => {
  const typeormRepo = AppDataSource.getRepository(UserModel);
  const userRepository = makeUserRepository(typeormRepo);

  const dto: CreateUserRequestDto = {
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  };

  const result = await Effect.runPromise(
    createUserFunctional(dto, userRepository)
  );

  console.log('User created:', result);
  return result;
};

// ===== COMPARISON =====

/*
❌ BEFORE (Using new keyword):
const userRepository = new UserRepositoryImpl(typeormRepository);

✅ AFTER (Functional approach):
const userRepository = makeUserRepository(typeormRepository);

❌ BEFORE (Hidden dependencies):
const createUserRepository = () => new UserRepositoryImpl(AppDataSource.getRepository(UserModel));

✅ AFTER (Pure functional approach):
const makeUserRepository = (typeormRepository) => ({
  findById: (id) => Effect.tryPromise({ ... }),
  findByEmail: (email) => Effect.tryPromise({ ... }),
  // No 'new' keyword anywhere!
});

BENEFITS:
- No 'new' keyword usage
- Dependencies are explicit and type-safe
- Easy to test with mock implementations
- Proper separation of concerns
- Effect composition works seamlessly
*/ 