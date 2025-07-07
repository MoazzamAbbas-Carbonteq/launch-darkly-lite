import { Effect, pipe } from 'effect';
import { z } from 'zod';
import { UserEntity, validateEmail, validateName, validateRole } from '../../domain/entities/User.entity';
import { UserRole } from '../../types/Api.types';

// Request DTOs with Zod validation
export const CreateUserRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
});

export const UpdateUserRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export type CreateUserRequestDto = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequestDto = z.infer<typeof UpdateUserRequestSchema>;

// Response DTOs
export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// DTO Validation Functions with Effect and Zod
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
export const toUserResponseDto = (entity: UserEntity): UserResponseDto => ({
  id: entity.id,
  email: entity.email,
  name: entity.name,
  role: entity.role,
  createdAt: entity.createdAt,
  updatedAt: entity.updatedAt,
});

export const toResponseDto = (entity: UserEntity): UserResponseDto => toUserResponseDto(entity);

export const toResponseDtoArray = (entities: UserEntity[]): UserResponseDto[] =>
  entities.map(entity => toUserResponseDto(entity)); 