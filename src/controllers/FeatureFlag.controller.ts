import { Request, Response } from 'express';
import { Effect, pipe } from 'effect';
import type { CreateFlagRequest, UpdateFlagRequest, EvaluateFlagRequest, FeatureFlag as FeatureFlagType } from '../types/Api.types';
import { 
  evaluateFlag, 
  getAllFlags, 
  getFlagByKey, 
  createFlag, 
  updateFlag, 
  deleteFlag 
} from '../services/FeatureFlag.service';

// Basic validation function
const validateCreateFlagRequest = (body: any): CreateFlagRequest => {
  if (!body.key || typeof body.key !== 'string') {
    throw new Error('Flag key is required and must be a string');
  }
  if (!body.name || typeof body.name !== 'string') {
    throw new Error('Flag name is required and must be a string');
  }
  if (typeof body.enabled !== 'boolean') {
    throw new Error('Flag enabled status is required and must be a boolean');
  }
  if (typeof body.defaultValue !== 'boolean') {
    throw new Error('Flag default value is required and must be a boolean');
  }
  return {
    key: body.key,
    name: body.name,
    description: body.description,
    enabled: body.enabled,
    defaultValue: body.defaultValue,
    rules: body.rules || [],
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
  };
};

// Get all feature flags
export const getFlags = async (req: Request, res: Response): Promise<void> => {
  const program = pipe(
    getAllFlags(),
    Effect.map(flags => {
      res.status(200).json({
        success: true,
        data: flags,
      });
    }),
    Effect.catchAll(error => {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve feature flags',
      });
      return Effect.succeed(void 0);
    })
  );

  Effect.runPromise(program);
};

// Get feature flag by key
export const getFlag = async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params;

  const program = pipe(
    getFlagByKey(key),
    Effect.map(flag => {
      res.status(200).json({
        success: true,
        data: flag,
      });
    }),
    Effect.catchAll(error => {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to retrieve feature flag',
        });
      }
      return Effect.succeed(void 0);
    })
  );

  Effect.runPromise(program);
};

// Create new feature flag
export const createNewFlag = async (req: Request, res: Response): Promise<void> => {
  const program = pipe(
    // Validate request body
    Effect.try({
      try: () => validateCreateFlagRequest(req.body),
      catch: () => new Error('Invalid request body'),
    }),
    // Create the flag
    Effect.flatMap(flagData => createFlag({
      ...flagData,
      rules: (flagData.rules || []).map((rule, index) => ({
        ...rule,
        id: `rule_${Date.now()}_${index}`
      })),
      createdBy: (req.user as any)?.id || 'system',
    })),
    Effect.map(flag => {
      res.status(201).json({
        success: true,
        data: flag,
        message: 'Feature flag created successfully',
      });
    }),
    Effect.catchAll(error => {
      if (error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          error: error.message,
        });
      } else if (error.message.includes('Invalid request')) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to create feature flag',
        });
      }
      return Effect.succeed(void 0);
    })
  );

  Effect.runPromise(program);
};

// Update feature flag
export const updateExistingFlag = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const program = pipe(
    // Validate request body (partial validation)
    Effect.try({
      try: () => {
        const body = req.body as any;
        if (body.rules) {
          body.rules = body.rules.map((rule: any, index: number) => ({
            ...rule,
            id: rule.id || `rule_${Date.now()}_${index}`
          }));
        }
        return body as Partial<FeatureFlagType>;
      },
      catch: () => new Error('Invalid request body'),
    }),
    // Update the flag
    Effect.flatMap(updates => updateFlag(id, updates)),
    Effect.map(flag => {
      res.status(200).json({
        success: true,
        data: flag,
        message: 'Feature flag updated successfully',
      });
    }),
    Effect.catchAll(error => {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to update feature flag',
        });
      }
      return Effect.succeed(void 0);
    })
  );

  Effect.runPromise(program);
};

// Delete feature flag
export const deleteExistingFlag = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const program = pipe(
    deleteFlag(id),
    Effect.map(() => {
      res.status(200).json({
        success: true,
        message: 'Feature flag deleted successfully',
      });
    }),
    Effect.catchAll(error => {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to delete feature flag',
        });
      }
      return Effect.succeed(void 0);
    })
  );

  Effect.runPromise(program);
};

// Evaluate feature flag
export const evaluateFeatureFlag = async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params;
  const requestData: EvaluateFlagRequest = {
    flagKey: key,
    userId: req.body.userId,
    userEmail: req.body.userEmail,
    userRole: req.body.userRole,
    attributes: req.body.attributes,
  };

  const program = pipe(
    evaluateFlag(requestData),
    Effect.map(result => {
      res.status(200).json({
        success: true,
        data: {
          flagKey: key,
          enabled: result,
        },
      });
    }),
    Effect.catchAll(error => {
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else if (error.message.includes('Invalid request')) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to evaluate feature flag',
        });
      }
      return Effect.succeed(void 0);
    })
  );

  Effect.runPromise(program);
}; 