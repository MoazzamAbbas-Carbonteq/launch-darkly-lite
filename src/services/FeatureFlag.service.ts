import { Effect, pipe } from 'effect';
import type { 
  FeatureFlag, 
  FlagRule, 
  FlagCondition, 
  EvaluateFlagRequest 
} from '../types';
import { 
  RuleType, 
  ConditionOperator,
  UserRole
} from '../types';

// Mock feature flags database (in a real app, this would be a database)
const mockFlags: FeatureFlag[] = [
  {
    id: '1',
    key: 'new-feature',
    name: 'New Feature',
    description: 'A new feature for testing',
    enabled: true,
    defaultValue: false,
    rules: [
      {
        id: 'rule1',
        type: RuleType.USER_ID,
        conditions: [
          {
            field: 'userId',
            operator: ConditionOperator.EQUALS,
            value: '1'
          }
        ],
        value: true,
        priority: 1
      },
      {
        id: 'rule2',
        type: RuleType.ROLE,
        conditions: [
          {
            field: 'role',
            operator: ConditionOperator.EQUALS,
            value: UserRole.ADMIN
          }
        ],
        value: true,
        priority: 2
      }
    ],
    createdBy: '1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
];

// Helper function to find flag by key
const findFlagByKey = (key: string): FeatureFlag | undefined => {
  return mockFlags.find(flag => flag.key === key);
};

// Helper function to evaluate a condition
const evaluateCondition = (
  condition: FlagCondition,
  context: {
    userId?: string;
    userEmail?: string;
    userRole?: UserRole;
    attributes?: Record<string, any>;
  }
): boolean => {
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

// Helper function to evaluate a rule
const evaluateRule = (
  rule: FlagRule,
  context: {
    userId?: string;
    userEmail?: string;
    userRole?: UserRole;
    attributes?: Record<string, any>;
  }
): boolean => {
  // All conditions in a rule must be true for the rule to match
  return rule.conditions.every(condition => evaluateCondition(condition, context));
};

// Main function to evaluate a feature flag
export const evaluateFlag = (
  request: EvaluateFlagRequest
): Effect.Effect<boolean, Error> => {
  return pipe(
    // Validate request
    Effect.try({
      try: () => {
        if (!request.flagKey) {
          throw new Error('Flag key is required');
        }
        return request;
      },
      catch: (error) => error as Error,
    }),
    // Find the flag
    Effect.flatMap(({ flagKey, userId, userEmail, userRole, attributes }) =>
      Effect.try({
        try: () => {
          const flag = findFlagByKey(flagKey);
          if (!flag) {
            throw new Error(`Feature flag '${flagKey}' not found`);
          }
          return { flag, userId, userEmail, userRole, attributes };
        },
        catch: (error) => error as Error,
      })
    ),
    // Evaluate the flag
    Effect.map(({ flag, userId, userEmail, userRole, attributes }) => {
      // If flag is disabled, return default value
      if (!flag.enabled) {
        return flag.defaultValue;
      }

      // Check if flag has expired
      if (flag.expiresAt && new Date() > flag.expiresAt) {
        return flag.defaultValue;
      }

      const context = { userId, userEmail, userRole, attributes };

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
    })
  );
};

// Service function to get all flags
export const getAllFlags = (): Effect.Effect<FeatureFlag[], Error> => {
  return Effect.try({
    try: () => mockFlags,
    catch: () => new Error('Failed to retrieve feature flags'),
  });
};

// Service function to get flag by key
export const getFlagByKey = (key: string): Effect.Effect<FeatureFlag, Error> => {
  return pipe(
    Effect.try({
      try: () => {
        const flag = findFlagByKey(key);
        if (!flag) {
          throw new Error(`Feature flag '${key}' not found`);
        }
        return flag;
      },
      catch: (error) => error as Error,
    })
  );
};

// Service function to create a new flag
export const createFlag = (flagData: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>): Effect.Effect<FeatureFlag, Error> => {
  return Effect.try({
    try: () => {
      // Check if flag with same key already exists
      const existingFlag = findFlagByKey(flagData.key);
      if (existingFlag) {
        throw new Error(`Feature flag with key '${flagData.key}' already exists`);
      }

      const newFlag: FeatureFlag = {
        ...flagData,
        id: (mockFlags.length + 1).toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFlags.push(newFlag);
      return newFlag;
    },
    catch: (error) => error as Error,
  });
};

// Service function to update a flag
export const updateFlag = (id: string, updates: Partial<FeatureFlag>): Effect.Effect<FeatureFlag, Error> => {
  return Effect.try({
    try: () => {
      const flagIndex = mockFlags.findIndex(flag => flag.id === id);
      if (flagIndex === -1) {
        throw new Error(`Feature flag with id '${id}' not found`);
      }

      const updatedFlag: FeatureFlag = {
        ...mockFlags[flagIndex],
        ...updates,
        id, // Ensure ID doesn't change
        updatedAt: new Date(),
      };

      mockFlags[flagIndex] = updatedFlag;
      return updatedFlag;
    },
    catch: (error) => error as Error,
  });
};

// Service function to delete a flag
export const deleteFlag = (id: string): Effect.Effect<void, Error> => {
  return Effect.try({
    try: () => {
      const flagIndex = mockFlags.findIndex(flag => flag.id === id);
      if (flagIndex === -1) {
        throw new Error(`Feature flag with id '${id}' not found`);
      }

      mockFlags.splice(flagIndex, 1);
    },
    catch: (error) => error as Error,
  });
}; 