// User related types
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

// Feature flag related types
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  defaultValue: boolean;
  rules: FlagRule[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface FlagRule {
  id: string;
  type: RuleType;
  conditions: FlagCondition[];
  value: boolean;
  priority: number;
}

export enum RuleType {
  USER_ID = 'user_id',
  EMAIL = 'email',
  ROLE = 'role',
  PERCENTAGE = 'percentage',
  CUSTOM_ATTRIBUTE = 'custom_attribute'
}

export interface FlagCondition {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IN = 'in',
  NOT_IN = 'not_in'
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

// Feature flag request types
export interface CreateFlagRequest {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  defaultValue: boolean;
  rules?: Omit<FlagRule, 'id'>[];
  expiresAt?: Date;
}

export interface UpdateFlagRequest extends Partial<CreateFlagRequest> {
  id: string;
}

export interface EvaluateFlagRequest {
  flagKey: string;
  userId?: string;
  userEmail?: string;
  userRole?: UserRole;
  attributes?: Record<string, any>;
} 