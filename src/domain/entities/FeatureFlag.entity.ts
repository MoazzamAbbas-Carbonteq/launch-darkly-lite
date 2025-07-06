import { Effect, pipe } from 'effect';
import { 
  RuleType, 
  ConditionOperator, 
  UserRole,
  FlagRule,
  FlagCondition 
} from '../../types/Api.types';

export interface EvaluationContext {
  userId?: string;
  userEmail?: string;
  userRole?: UserRole;
  attributes?: Record<string, any>;
}

// FeatureFlag entity as immutable data structure
export interface FeatureFlagEntity {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly enabled: boolean;
  readonly defaultValue: boolean;
  readonly rules: FlagRule[];
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly expiresAt?: Date;
}

// Factory function to create FeatureFlagEntity
export const createFeatureFlagEntity = (
  id: string,
  key: string,
  name: string,
  description: string,
  enabled: boolean,
  defaultValue: boolean,
  rules: FlagRule[],
  createdBy: string,
  createdAt: Date = new Date(),
  updatedAt: Date = new Date(),
  expiresAt?: Date
): FeatureFlagEntity => ({
  id,
  key,
  name,
  description,
  enabled,
  defaultValue,
  rules,
  createdBy,
  createdAt,
  updatedAt,
  expiresAt,
});

// Business logic functions
export const isEnabled = (flag: FeatureFlagEntity): boolean => {
  return flag.enabled;
};

export const isExpired = (flag: FeatureFlagEntity): boolean => {
  return flag.expiresAt ? new Date() > flag.expiresAt : false;
};

export const canEvaluate = (flag: FeatureFlagEntity): boolean => {
  return isEnabled(flag) && !isExpired(flag);
};

// Condition evaluation function
const evaluateCondition = (condition: FlagCondition, context: EvaluationContext): boolean => {
  const { field, operator, value } = condition;
  let contextValue: any;

  // Get the value from context based on field
  switch (field) {
    case 'userId':
      contextValue = context.userId;
      break;
    case 'userEmail':
      contextValue = context.userEmail;
      break;
    case 'role':
      contextValue = context.userRole;
      break;
    default:
      contextValue = context.attributes?.[field];
      break;
  }

  // Evaluate the condition based on operator
  switch (operator) {
    case ConditionOperator.EQUALS:
      return contextValue === value;
    case ConditionOperator.NOT_EQUALS:
      return contextValue !== value;
    case ConditionOperator.CONTAINS:
      return typeof contextValue === 'string' && 
             typeof value === 'string' && 
             contextValue.includes(value);
    case ConditionOperator.NOT_CONTAINS:
      return typeof contextValue === 'string' && 
             typeof value === 'string' && 
             !contextValue.includes(value);
    case ConditionOperator.GREATER_THAN:
      return typeof contextValue === 'number' && 
             typeof value === 'number' && 
             contextValue > value;
    case ConditionOperator.LESS_THAN:
      return typeof contextValue === 'number' && 
             typeof value === 'number' && 
             contextValue < value;
    case ConditionOperator.IN:
      return Array.isArray(value) && value.includes(contextValue);
    case ConditionOperator.NOT_IN:
      return Array.isArray(value) && !value.includes(contextValue);
    default:
      return false;
  }
};

// Rule evaluation function
const evaluateRule = (rule: FlagRule, context: EvaluationContext): boolean => {
  // All conditions in a rule must be true for the rule to match
  return rule.conditions.every(condition => evaluateCondition(condition, context));
};

// Flag evaluation logic
export const evaluate = (flag: FeatureFlagEntity, context: EvaluationContext): boolean => {
  // If flag is disabled or expired, return default value
  if (!canEvaluate(flag)) {
    return flag.defaultValue;
  }

  // Sort rules by priority (highest priority first)
  const sortedRules = [...flag.rules].sort((a, b) => b.priority - a.priority);

  // Find the first matching rule
  for (const rule of sortedRules) {
    if (evaluateRule(rule, context)) {
      return rule.value;
    }
  }

  // If no rules match, return default value
  return flag.defaultValue;
};

// Validation functions
export const validateKey = (key: string): Effect.Effect<string, Error> =>
  Effect.try({
    try: () => {
      if (!key || key.trim().length === 0) {
        throw new Error('Flag key is required');
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
        throw new Error('Flag key can only contain letters, numbers, underscores, and hyphens');
      }
      return key.trim();
    },
    catch: (error) => error as Error,
  });

export const validateName = (name: string): Effect.Effect<string, Error> =>
  Effect.try({
    try: () => {
      if (!name || name.trim().length === 0) {
        throw new Error('Flag name is required');
      }
      if (name.trim().length > 100) {
        throw new Error('Flag name cannot exceed 100 characters');
      }
      return name.trim();
    },
    catch: (error) => error as Error,
  });

export const validateRules = (rules: FlagRule[]): Effect.Effect<FlagRule[], Error> =>
  Effect.try({
    try: () => {
      if (!Array.isArray(rules)) {
        throw new Error('Rules must be an array');
      }
      
      // Validate each rule has required fields
      for (const rule of rules) {
        if (!rule.id || !rule.type || typeof rule.value !== 'boolean' || typeof rule.priority !== 'number') {
          throw new Error('Each rule must have id, type, value, and priority');
        }
        
        if (!Array.isArray(rule.conditions)) {
          throw new Error('Each rule must have conditions array');
        }
        
        // Validate conditions
        for (const condition of rule.conditions) {
          if (!condition.field || !condition.operator || condition.value === undefined) {
            throw new Error('Each condition must have field, operator, and value');
          }
        }
      }
      
      return rules;
    },
    catch: (error) => error as Error,
  });

// Factory function with validation
export const createFeatureFlagEntityWithValidation = (
  id: string,
  key: string,
  name: string,
  description: string,
  enabled: boolean,
  defaultValue: boolean,
  rules: FlagRule[],
  createdBy: string,
  createdAt: Date = new Date(),
  updatedAt: Date = new Date(),
  expiresAt?: Date
): Effect.Effect<FeatureFlagEntity, Error> =>
  Effect.all([
    validateKey(key),
    validateName(name),
    validateRules(rules),
  ]).pipe(
    Effect.map(([validKey, validName, validRules]) =>
      createFeatureFlagEntity(id, validKey, validName, description, enabled, defaultValue, validRules, createdBy, createdAt, updatedAt, expiresAt)
    )
  );

// Update function (returns new entity)
export const updateFeatureFlagEntity = (
  flag: FeatureFlagEntity,
  updates: {
    key?: string;
    name?: string;
    description?: string;
    enabled?: boolean;
    defaultValue?: boolean;
    rules?: FlagRule[];
    expiresAt?: Date;
  }
): Effect.Effect<FeatureFlagEntity, Error> => {
  const validations = [];

  if (updates.key) {
    validations.push(validateKey(updates.key));
  }
  if (updates.name) {
    validations.push(validateName(updates.name));
  }
  if (updates.rules) {
    validations.push(validateRules(updates.rules));
  }

  if (validations.length === 0) {
    return Effect.succeed(createFeatureFlagEntity(
      flag.id,
      updates.key ?? flag.key,
      updates.name ?? flag.name,
      updates.description ?? flag.description,
      updates.enabled ?? flag.enabled,
      updates.defaultValue ?? flag.defaultValue,
      updates.rules ?? flag.rules,
      flag.createdBy,
      flag.createdAt,
      new Date(),
      updates.expiresAt ?? flag.expiresAt
    ));
  }

  return Effect.all(validations).pipe(
    Effect.map(() =>
      createFeatureFlagEntity(
        flag.id,
        updates.key ?? flag.key,
        updates.name ?? flag.name,
        updates.description ?? flag.description,
        updates.enabled ?? flag.enabled,
        updates.defaultValue ?? flag.defaultValue,
        updates.rules ?? flag.rules,
        flag.createdBy,
        flag.createdAt,
        new Date(),
        updates.expiresAt ?? flag.expiresAt
      )
    )
  );
};

// Convert to plain object (for API responses)
export const toPlainObject = (flag: FeatureFlagEntity): {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  defaultValue: boolean;
  rules: FlagRule[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
} => ({
  id: flag.id,
  key: flag.key,
  name: flag.name,
  description: flag.description,
  enabled: flag.enabled,
  defaultValue: flag.defaultValue,
  rules: flag.rules,
  createdBy: flag.createdBy,
  createdAt: flag.createdAt,
  updatedAt: flag.updatedAt,
  expiresAt: flag.expiresAt,
}); 