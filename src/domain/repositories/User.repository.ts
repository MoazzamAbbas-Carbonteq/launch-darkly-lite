import { Effect } from "effect";
import { UserEntity } from "../entities/User.entity";
import { UserRole } from "../../types/Api.types";

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: UserRole;
}

export interface UserRepository {
  findById(id: string): Effect.Effect<UserEntity | null, Error>;
  findByEmail(email: string): Effect.Effect<UserEntity | null, Error>;
  create(userData: CreateUserData): Effect.Effect<UserEntity, Error>;
  update(id: string, updates: UpdateUserData): Effect.Effect<UserEntity, Error>;
  delete(id: string): Effect.Effect<boolean, Error>;
} 