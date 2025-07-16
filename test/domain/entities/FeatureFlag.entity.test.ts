import { Effect } from 'effect';
import {
  FeatureFlagEntity,
  createFeatureFlagEntity,
  createFeatureFlagEntityWithValidation,
  updateFeatureFlagEntity,
  isEnabled,
  isExpired,
  canEvaluate,
  evaluate,
  validateKey,
  validateName,
  validateRules,
  toPlainObject,
  EvaluationContext,
} from '@domain/entities/FeatureFlag.entity';
import { UserRole, RuleType, ConditionOperator, FlagRule, FlagCondition } from '@infrastructure/web/types/Api.types';

describe('FeatureFlag Entity', () => {
  const testFlagId = '123e4567-e89b-12d3-a456-426614174000';
  const testKey = 'test-feature';
  const testName = 'Test Feature';
  const testDescription = 'A test feature flag';
  const testCreatedBy = 'user-123';
  const testDate = new Date('2023-01-01T00:00:00Z');
  const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
  const pastDate = new Date('2022-01-01T00:00:00Z');

  const createTestRule = (): FlagRule => ({
    id: 'rule-1',
    type: RuleType.USER_ID,
    conditions: [{
      field: 'userId',
      operator: ConditionOperator.EQUALS,
      value: 'user-123'
    }],
    value: true,
    priority: 1
  });

  describe('createFeatureFlagEntity', () => {
    it('should create a feature flag entity with all properties', () => {
      const rules = [createTestRule()];
      const flag = createFeatureFlagEntity(
        testFlagId,
        testKey,
        testName,
        testDescription,
        true,
        false,
        rules,
        testCreatedBy,
        testDate,
        testDate,
        futureDate
      );

      expect(flag).toEqual({
        id: testFlagId,
        key: testKey,
        name: testName,
        description: testDescription,
        enabled: true,
        defaultValue: false,
        rules,
        createdBy: testCreatedBy,
        createdAt: testDate,
        updatedAt: testDate,
        expiresAt: futureDate,
      });
    });

    it('should create a feature flag entity with default dates', () => {
      const rules = [createTestRule()];
      const flag = createFeatureFlagEntity(
        testFlagId,
        testKey,
        testName,
        testDescription,
        true,
        false,
        rules,
        testCreatedBy
      );

      expect(flag.id).toBe(testFlagId);
      expect(flag.key).toBe(testKey);
      expect(flag.name).toBe(testName);
      expect(flag.description).toBe(testDescription);
      expect(flag.enabled).toBe(true);
      expect(flag.defaultValue).toBe(false);
      expect(flag.rules).toEqual(rules);
      expect(flag.createdBy).toBe(testCreatedBy);
      expect(flag.createdAt).toBeInstanceOf(Date);
      expect(flag.updatedAt).toBeInstanceOf(Date);
      expect(flag.expiresAt).toBeUndefined();
    });
  });

  describe('Business logic functions', () => {
    describe('isEnabled', () => {
      it('should return true for enabled flags', () => {
        const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, [], testCreatedBy);
        expect(isEnabled(flag)).toBe(true);
      });

      it('should return false for disabled flags', () => {
        const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, false, false, [], testCreatedBy);
        expect(isEnabled(flag)).toBe(false);
      });
    });

    describe('isExpired', () => {
      it('should return false for flags without expiration', () => {
        const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, [], testCreatedBy);
        expect(isExpired(flag)).toBe(false);
      });

      it('should return false for flags with future expiration', () => {
        const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, [], testCreatedBy, testDate, testDate, futureDate);
        expect(isExpired(flag)).toBe(false);
      });

      it('should return true for expired flags', () => {
        const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, [], testCreatedBy, testDate, testDate, pastDate);
        expect(isExpired(flag)).toBe(true);
      });
    });

    describe('canEvaluate', () => {
      it('should return true for enabled, non-expired flags', () => {
        const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, [], testCreatedBy, testDate, testDate, futureDate);
        expect(canEvaluate(flag)).toBe(true);
      });

      it('should return false for disabled flags', () => {
        const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, false, false, [], testCreatedBy);
        expect(canEvaluate(flag)).toBe(false);
      });

      it('should return false for expired flags', () => {
        const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, [], testCreatedBy, testDate, testDate, pastDate);
        expect(canEvaluate(flag)).toBe(false);
      });
    });
  });

  describe('Flag evaluation', () => {
    const context: EvaluationContext = {
      userId: 'user-123',
      userEmail: 'test@example.com',
      userRole: UserRole.USER,
      attributes: { department: 'engineering' }
    };

    it('should return default value for disabled flags', () => {
      const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, false, true, [], testCreatedBy);
      const result = evaluate(flag, context);
      expect(result).toBe(true); // default value
    });

    it('should return default value for expired flags', () => {
      const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, true, [], testCreatedBy, testDate, testDate, pastDate);
      const result = evaluate(flag, context);
      expect(result).toBe(true); // default value
    });

    it('should return default value when no rules match', () => {
      const rules: FlagRule[] = [{
        id: 'rule-1',
        type: RuleType.USER_ID,
        conditions: [{
          field: 'userId',
          operator: ConditionOperator.EQUALS,
          value: 'different-user'
        }],
        value: true,
        priority: 1
      }];

      const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, rules, testCreatedBy);
      const result = evaluate(flag, context);
      expect(result).toBe(false); // default value
    });

    it('should return rule value when rule matches', () => {
      const rules: FlagRule[] = [{
        id: 'rule-1',
        type: RuleType.USER_ID,
        conditions: [{
          field: 'userId',
          operator: ConditionOperator.EQUALS,
          value: 'user-123'
        }],
        value: true,
        priority: 1
      }];

      const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, rules, testCreatedBy);
      const result = evaluate(flag, context);
      expect(result).toBe(true); // rule value
    });

    it('should prioritize higher priority rules', () => {
      const rules: FlagRule[] = [
        {
          id: 'rule-1',
          type: RuleType.USER_ID,
          conditions: [{
            field: 'userId',
            operator: ConditionOperator.EQUALS,
            value: 'user-123'
          }],
          value: false,
          priority: 1
        },
        {
          id: 'rule-2',
          type: RuleType.EMAIL,
          conditions: [{
            field: 'userEmail',
            operator: ConditionOperator.EQUALS,
            value: 'test@example.com'
          }],
          value: true,
          priority: 2
        }
      ];

      const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, rules, testCreatedBy);
      const result = evaluate(flag, context);
      expect(result).toBe(true); // higher priority rule value
    });

    describe('Condition operators', () => {
      it('should handle EQUALS operator correctly', () => {
        const rules: FlagRule[] = [{
          id: 'rule-1',
          type: RuleType.USER_ID,
          conditions: [{
            field: 'userId',
            operator: ConditionOperator.EQUALS,
            value: 'user-123'
          }],
          value: true,
          priority: 1
        }];

        const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, rules, testCreatedBy);
        expect(evaluate(flag, context)).toBe(true);
      });

      it('should handle NOT_EQUALS operator correctly', () => {
        const rules: FlagRule[] = [{
          id: 'rule-1',
          type: RuleType.USER_ID,
          conditions: [{
            field: 'userId',
            operator: ConditionOperator.NOT_EQUALS,
            value: 'different-user'
          }],
          value: true,
          priority: 1
        }];

        const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, rules, testCreatedBy);
        expect(evaluate(flag, context)).toBe(true);
      });

      it('should handle CONTAINS operator correctly', () => {
        const rules: FlagRule[] = [{
          id: 'rule-1',
          type: RuleType.EMAIL,
          conditions: [{
            field: 'userEmail',
            operator: ConditionOperator.CONTAINS,
            value: '@example.com'
          }],
          value: true,
          priority: 1
        }];

        const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, rules, testCreatedBy);
        expect(evaluate(flag, context)).toBe(true);
      });

      it('should handle IN operator correctly', () => {
        const rules: FlagRule[] = [{
          id: 'rule-1',
          type: RuleType.ROLE,
          conditions: [{
            field: 'role',
            operator: ConditionOperator.IN,
            value: [UserRole.USER, UserRole.ADMIN]
          }],
          value: true,
          priority: 1
        }];

        const flag = createFeatureFlagEntity(testFlagId, testKey, testName, testDescription, true, false, rules, testCreatedBy);
        expect(evaluate(flag, context)).toBe(true);
      });
    });
  });

  describe('Validation functions', () => {
    describe('validateKey', () => {
      it('should validate correct keys', async () => {
        const validKeys = ['test-flag', 'feature_123', 'NEW-FEATURE'];

        for (const key of validKeys) {
          const result = await Effect.runPromise(validateKey(key));
          expect(result).toBe(key);
        }
      });

      it('should reject invalid keys', async () => {
        const invalidKeys = ['', '  ', 'flag with spaces', 'flag@invalid'];

        for (const key of invalidKeys) {
          await expect(Effect.runPromise(validateKey(key))).rejects.toThrow();
        }
      });
    });

    describe('validateName', () => {
      it('should validate correct names', async () => {
        const validNames = ['Test Feature', 'A', 'Feature Flag with Description'];

        for (const name of validNames) {
          const result = await Effect.runPromise(validateName(name));
          expect(result).toBe(name.trim());
        }
      });

      it('should reject invalid names', async () => {
        const invalidNames = ['', '  ', 'A'.repeat(101)];

        for (const name of invalidNames) {
          await expect(Effect.runPromise(validateName(name))).rejects.toThrow();
        }
      });
    });

    describe('validateRules', () => {
      it('should validate correct rules', async () => {
        const validRules = [createTestRule()];
        const result = await Effect.runPromise(validateRules(validRules));
        expect(result).toEqual(validRules);
      });

      it('should reject invalid rules', async () => {
        const invalidRules = [
          [{ invalid: 'rule' }] as any,
          [{ id: 'rule-1', type: RuleType.USER_ID, value: true, priority: 1 }] as any, // missing conditions
        ];

        for (const rules of invalidRules) {
          await expect(Effect.runPromise(validateRules(rules))).rejects.toThrow();
        }
      });
    });
  });

  describe('createFeatureFlagEntityWithValidation', () => {
    it('should create a valid feature flag entity with validation', async () => {
      const rules = [createTestRule()];
      const flag = await Effect.runPromise(
        createFeatureFlagEntityWithValidation(
          testFlagId,
          testKey,
          testName,
          testDescription,
          true,
          false,
          rules,
          testCreatedBy
        )
      );

      expect(flag.id).toBe(testFlagId);
      expect(flag.key).toBe(testKey);
      expect(flag.name).toBe(testName);
      expect(flag.description).toBe(testDescription);
      expect(flag.enabled).toBe(true);
      expect(flag.defaultValue).toBe(false);
      expect(flag.rules).toEqual(rules);
      expect(flag.createdBy).toBe(testCreatedBy);
    });

    it('should reject invalid data during validation', async () => {
      await expect(
        Effect.runPromise(
          createFeatureFlagEntityWithValidation(
            testFlagId,
            'invalid key!',
            testName,
            testDescription,
            true,
            false,
            [],
            testCreatedBy
          )
        )
      ).rejects.toThrow();
    });
  });

  describe('updateFeatureFlagEntity', () => {
    const originalFlag = createFeatureFlagEntity(
      testFlagId,
      testKey,
      testName,
      testDescription,
      true,
      false,
      [],
      testCreatedBy,
      testDate,
      testDate
    );

    it('should update flag with valid data', async () => {
      const updates = {
        key: 'updated-key',
        name: 'Updated Name',
        description: 'Updated description',
        enabled: false,
        defaultValue: true,
        expiresAt: futureDate,
      };

      const updatedFlag = await Effect.runPromise(updateFeatureFlagEntity(originalFlag, updates));

      expect(updatedFlag.id).toBe(originalFlag.id);
      expect(updatedFlag.key).toBe(updates.key);
      expect(updatedFlag.name).toBe(updates.name);
      expect(updatedFlag.description).toBe(updates.description);
      expect(updatedFlag.enabled).toBe(updates.enabled);
      expect(updatedFlag.defaultValue).toBe(updates.defaultValue);
      expect(updatedFlag.expiresAt).toBe(updates.expiresAt);
      expect(updatedFlag.createdAt).toBe(originalFlag.createdAt);
      expect(updatedFlag.updatedAt).not.toBe(originalFlag.updatedAt);
    });

    it('should update flag with partial data', async () => {
      const updates = { name: 'Updated Name' };

      const updatedFlag = await Effect.runPromise(updateFeatureFlagEntity(originalFlag, updates));

      expect(updatedFlag.key).toBe(originalFlag.key);
      expect(updatedFlag.name).toBe(updates.name);
      expect(updatedFlag.description).toBe(originalFlag.description);
    });

    it('should handle empty updates', async () => {
      const updatedFlag = await Effect.runPromise(updateFeatureFlagEntity(originalFlag, {}));

      expect(updatedFlag.key).toBe(originalFlag.key);
      expect(updatedFlag.name).toBe(originalFlag.name);
      expect(updatedFlag.description).toBe(originalFlag.description);
      expect(updatedFlag.updatedAt).not.toBe(originalFlag.updatedAt);
    });

    it('should reject invalid updates', async () => {
      const invalidUpdates = { key: 'invalid key!' };

      await expect(
        Effect.runPromise(updateFeatureFlagEntity(originalFlag, invalidUpdates))
      ).rejects.toThrow();
    });
  });

  describe('toPlainObject', () => {
    it('should convert entity to plain object', () => {
      const rules = [createTestRule()];
      const flag = createFeatureFlagEntity(
        testFlagId,
        testKey,
        testName,
        testDescription,
        true,
        false,
        rules,
        testCreatedBy,
        testDate,
        testDate,
        futureDate
      );
      const plainObject = toPlainObject(flag);

      expect(plainObject).toEqual({
        id: testFlagId,
        key: testKey,
        name: testName,
        description: testDescription,
        enabled: true,
        defaultValue: false,
        rules,
        createdBy: testCreatedBy,
        createdAt: testDate,
        updatedAt: testDate,
        expiresAt: futureDate,
      });

      // Ensure it's a plain object, not the original entity
      expect(plainObject).not.toBe(flag);
    });
  });
}); 