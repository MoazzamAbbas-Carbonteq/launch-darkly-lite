import { Effect, pipe } from 'effect';
import { z } from 'zod';
import { UserEntity, validateEmail, validateName, validateRole } from '../../domain/entities/User.entity';
import { UserRole } from '../../types/Api.types';

// Zod Schemas for additional validation
export const CreateUserRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.nativeEnum(UserRole).optional()
});

export const UpdateUserRequestSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.nativeEnum(UserRole).optional()
});

// Request DTOs
export interface CreateUserRequestDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface UpdateUserRequestDto {
  email?: string;
  name?: string;
  role?: UserRole;
}

// Response DTOs
export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// DTO Validation Functions
export const validateCreateUserRequest = (dto: CreateUserRequestDto): Effect.Effect<CreateUserRequestDto, Error> =>
  pipe(
    // First validate with Zod
    Effect.try({
      try: () => CreateUserRequestSchema.parse(dto),
      catch: (error) => new Error(`Validation failed: ${error}`)
    }),
    // Then validate with domain entity validation
    Effect.flatMap((validatedDto) =>
      Effect.all([
        validateEmail(validatedDto.email),
        validateName(validatedDto.name),
        validatedDto.role ? validateRole(validatedDto.role) : Effect.succeed(validatedDto.role)
      ])
    ),
    Effect.map(([validEmail, validName, validRole]) => ({
      ...dto,
      email: validEmail,
      name: validName,
      role: validRole
    }))
  );

export const validateUpdateUserRequest = (dto: UpdateUserRequestDto): Effect.Effect<UpdateUserRequestDto, Error> =>
  pipe(
    // First validate with Zod
    Effect.try({
      try: () => UpdateUserRequestSchema.parse(dto),
      catch: (error) => new Error(`Validation failed: ${error}`)
    }),
    // Then validate with domain entity validation
    Effect.flatMap((validatedDto) => {
      const validations = [];
      
      if (validatedDto.email) {
        validations.push(validateEmail(validatedDto.email));
      }
      if (validatedDto.name) {
        validations.push(validateName(validatedDto.name));
      }
      if (validatedDto.role) {
        validations.push(validateRole(validatedDto.role));
      }

      if (validations.length === 0) {
        return Effect.succeed(validatedDto);
      }

      return pipe(
        Effect.all(validations),
        Effect.map(() => validatedDto)
      );
    })
  );

// DTO Transformation Functions
export const toResponseDto = (entity: UserEntity): UserResponseDto => ({
  id: entity.id,
  email: entity.email,
  name: entity.name,
  role: entity.role,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
});

export const toResponseDtoArray = (entities: UserEntity[]): UserResponseDto[] =>
  entities.map(entity => toResponseDto(entity)); 