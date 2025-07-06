import { Effect } from "effect";
import { User } from "../types";

export interface UserRepository {
  findById(id: string): Effect.Effect<User | null, Error>;
  findByEmail(email: string): Effect.Effect<User | null, Error>;
  create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Effect.Effect<User, Error>;
  update(id: string, updates: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Effect.Effect<User, Error>;
  delete(id: string): Effect.Effect<boolean, Error>;
} 