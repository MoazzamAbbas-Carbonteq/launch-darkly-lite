import { Effect } from 'effect';
import { makeFeatureFlagService, FeatureFlagService } from '@application/services/FeatureFlag.service';
import { FeatureFlagRepository, CreateFeatureFlagData, UpdateFeatureFlagData } from '@domain/repositories/FeatureFlag.repository';
import { FeatureFlagEntity, createFeatureFlagEntity } from '@domain/entities/FeatureFlag.entity';
import { CreateFeatureFlagRequestDto, UpdateFeatureFlagRequestDto, EvaluationRequestDto } from '@application/dto/FeatureFlag.dto';
import { RuleType, ConditionOperator, UserRole } from '@infrastructure/web/types/Api.types';
import { createMockFeatureFlagRepository, createMockEffect } from '../../helpers/mocks/repository.mocks';

// Mock FeatureFlagRepository
const createMockFeatureFlagRepository = (): FeatureFlagRepository => ({
  findById: jest.fn(),
  findByKey: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('FeatureFlag Service', () => {
  let mockRepository: FeatureFlagRepository;
  let service: FeatureFlagService;

  const testFlagId = '123e4567-e89b-12d3-a456-426614174000';
  const testKey = 'test-feature';
  const testName = 'Test Feature';
  const testDescription = 'A test feature flag';
  const testCreatedBy = 'user-123';
  const testDate = new Date('2023-01-01T00:00:00Z');

  beforeEach(() => {
    mockRepository = createMockFeatureFlagRepository();
    service = makeFeatureFlagService(mockRepository);
    jest.clearAllMocks();
  });

  const createTestFlag = (): FeatureFlagEntity => 
    createFeatureFlagEntity(
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

  describe('createFeatureFlag', () => {
    it('should create a feature flag successfully', async () => {
      const createDto: CreateFeatureFlagRequestDto = {
        key: testKey,
        name: testName,
        description: testDescription,
        enabled: true,
        defaultValue: false,
        rules: [],
        createdBy: testCreatedBy,
      };

      const expectedFlag = createTestFlag();

      (mockRepository.create as jest.Mock).mockReturnValue(
        Effect.succeed(expectedFlag)
      );

      const result = await Effect.runPromise(service.createFeatureFlag(createDto));

      expect(result.id).toBe(testFlagId);
      expect(result.key).toBe(testKey);
      expect(result.name).toBe(testName);
      expect(result.description).toBe(testDescription);
      expect(result.enabled).toBe(true);
      expect(result.defaultValue).toBe(false);

      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors during creation', async () => {
      const createDto: CreateFeatureFlagRequestDto = {
        key: testKey,
        name: testName,
        description: testDescription,
        enabled: true,
        defaultValue: false,
        rules: [],
        createdBy: testCreatedBy,
      };

      (mockRepository.create as jest.Mock).mockReturnValue(
        Effect.fail(new Error('Database error'))
      );

      await expect(
        Effect.runPromise(service.createFeatureFlag(createDto))
      ).rejects.toThrow('Database error');
    });
  });

  describe('updateFeatureFlag', () => {
    it('should update a feature flag successfully', async () => {
      const updateDto: UpdateFeatureFlagRequestDto = {
        name: 'Updated Name',
        description: 'Updated description',
        enabled: false,
      };

      const updatedFlag = createFeatureFlagEntity(
        testFlagId,
        testKey,
        'Updated Name',
        'Updated description',
        false,
        false,
        [],
        testCreatedBy,
        testDate,
        new Date()
      );

      (mockRepository.update as jest.Mock).mockReturnValue(
        Effect.succeed(updatedFlag)
      );

      const result = await Effect.runPromise(service.updateFeatureFlag(testFlagId, updateDto));

      expect(result.id).toBe(testFlagId);
      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('Updated description');
      expect(result.enabled).toBe(false);

      expect(mockRepository.update).toHaveBeenCalledWith(testFlagId, updateDto);
    });

    it('should handle repository errors during update', async () => {
      const updateDto: UpdateFeatureFlagRequestDto = {
        name: 'Updated Name',
      };

      (mockRepository.update as jest.Mock).mockReturnValue(
        Effect.fail(new Error('Flag not found'))
      );

      await expect(
        Effect.runPromise(service.updateFeatureFlag(testFlagId, updateDto))
      ).rejects.toThrow('Flag not found');
    });
  });

  describe('deleteFeatureFlag', () => {
    it('should delete a feature flag successfully', async () => {
      (mockRepository.delete as jest.Mock).mockReturnValue(
        Effect.succeed(true)
      );

      const result = await Effect.runPromise(service.deleteFeatureFlag(testFlagId));

      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(testFlagId);
    });

    it('should handle repository errors during deletion', async () => {
      (mockRepository.delete as jest.Mock).mockReturnValue(
        Effect.fail(new Error('Deletion failed'))
      );

      await expect(
        Effect.runPromise(service.deleteFeatureFlag(testFlagId))
      ).rejects.toThrow('Deletion failed');
    });
  });

  describe('getFeatureFlag', () => {
    it('should get a feature flag by ID successfully', async () => {
      const expectedFlag = createTestFlag();

      (mockRepository.findById as jest.Mock).mockReturnValue(
        Effect.succeed(expectedFlag)
      );

      const result = await Effect.runPromise(service.getFeatureFlag(testFlagId));

      expect(result).not.toBeNull();
      expect(result!.id).toBe(testFlagId);
      expect(result!.key).toBe(testKey);
      expect(result!.name).toBe(testName);

      expect(mockRepository.findById).toHaveBeenCalledWith(testFlagId);
    });

    it('should return null when flag is not found', async () => {
      (mockRepository.findById as jest.Mock).mockReturnValue(
        Effect.succeed(null)
      );

      const result = await Effect.runPromise(service.getFeatureFlag(testFlagId));

      expect(result).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith(testFlagId);
    });

    it('should handle repository errors during retrieval', async () => {
      (mockRepository.findById as jest.Mock).mockReturnValue(
        Effect.fail(new Error('Database connection error'))
      );

      await expect(
        Effect.runPromise(service.getFeatureFlag(testFlagId))
      ).rejects.toThrow('Database connection error');
    });
  });

  describe('getFeatureFlagByKey', () => {
    it('should get a feature flag by key successfully', async () => {
      const expectedFlag = createTestFlag();

      (mockRepository.findByKey as jest.Mock).mockReturnValue(
        Effect.succeed(expectedFlag)
      );

      const result = await Effect.runPromise(service.getFeatureFlagByKey(testKey));

      expect(result).not.toBeNull();
      expect(result!.key).toBe(testKey);
      expect(result!.name).toBe(testName);

      expect(mockRepository.findByKey).toHaveBeenCalledWith(testKey);
    });

    it('should return null when flag key is not found', async () => {
      (mockRepository.findByKey as jest.Mock).mockReturnValue(
        Effect.succeed(null)
      );

      const result = await Effect.runPromise(service.getFeatureFlagByKey('nonexistent-key'));

      expect(result).toBeNull();
      expect(mockRepository.findByKey).toHaveBeenCalledWith('nonexistent-key');
    });
  });

  describe('getAllFeatureFlags', () => {
    it('should get all feature flags successfully', async () => {
      const flag1 = createTestFlag();
      const flag2 = createFeatureFlagEntity(
        'flag-2',
        'second-flag',
        'Second Flag',
        'Another test flag',
        false,
        true,
        [],
        testCreatedBy,
        testDate,
        testDate
      );

      (mockRepository.findAll as jest.Mock).mockReturnValue(
        Effect.succeed([flag1, flag2])
      );

      const result = await Effect.runPromise(service.getAllFeatureFlags());

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe(testKey);
      expect(result[1].key).toBe('second-flag');

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no flags exist', async () => {
      (mockRepository.findAll as jest.Mock).mockReturnValue(
        Effect.succeed([])
      );

      const result = await Effect.runPromise(service.getAllFeatureFlags());

      expect(result).toHaveLength(0);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors during retrieval', async () => {
      (mockRepository.findAll as jest.Mock).mockReturnValue(
        Effect.fail(new Error('Database error'))
      );

      await expect(
        Effect.runPromise(service.getAllFeatureFlags())
      ).rejects.toThrow('Database error');
    });
  });

  describe('evaluateFeatureFlag', () => {
    it('should evaluate a feature flag successfully', async () => {
      const evaluationDto: EvaluationRequestDto = {
        userId: 'user-123',
        context: {
          department: 'engineering',
        },
      };

      const flagWithRules = createFeatureFlagEntity(
        testFlagId,
        testKey,
        testName,
        testDescription,
        true,
        false,
        [{
          id: 'rule-1',
          type: RuleType.USER_ID,
          conditions: [{
            field: 'userId',
            operator: ConditionOperator.EQUALS,
            value: 'user-123',
          }],
          value: true,
          priority: 1,
        }],
        testCreatedBy,
        testDate,
        testDate
      );

      (mockRepository.findByKey as jest.Mock).mockReturnValue(
        Effect.succeed(flagWithRules)
      );

      const result = await Effect.runPromise(service.evaluateFeatureFlag(testKey, evaluationDto));

      expect(result.flagKey).toBe(testKey);
      expect(result.value).toBe(true);
      expect(result.reason).toBe('rule_match');

      expect(mockRepository.findByKey).toHaveBeenCalledWith(testKey);
    });

    it('should return default value when no rules match', async () => {
      const evaluationDto: EvaluationRequestDto = {
        userId: 'different-user',
        context: {},
      };

      const flagWithRules = createFeatureFlagEntity(
        testFlagId,
        testKey,
        testName,
        testDescription,
        true,
        false,
        [{
          id: 'rule-1',
          type: RuleType.USER_ID,
          conditions: [{
            field: 'userId',
            operator: ConditionOperator.EQUALS,
            value: 'user-123',
          }],
          value: true,
          priority: 1,
        }],
        testCreatedBy,
        testDate,
        testDate
      );

      (mockRepository.findByKey as jest.Mock).mockReturnValue(
        Effect.succeed(flagWithRules)
      );

      const result = await Effect.runPromise(service.evaluateFeatureFlag(testKey, evaluationDto));

      expect(result.flagKey).toBe(testKey);
      expect(result.value).toBe(false); // default value
      expect(result.reason).toBe('default');
    });

    it('should handle flag not found during evaluation', async () => {
      const evaluationDto: EvaluationRequestDto = {
        userId: 'user-123',
        context: {},
      };

      (mockRepository.findByKey as jest.Mock).mockReturnValue(
        Effect.succeed(null)
      );

      await expect(
        Effect.runPromise(service.evaluateFeatureFlag('nonexistent-key', evaluationDto))
      ).rejects.toThrow('Feature flag not found');
    });
  });
}); 