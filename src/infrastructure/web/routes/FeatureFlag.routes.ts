import { Router } from 'express';

import { authenticateJwt, requireRole } from '../middleware/Authentication.middleware';
import { UserRole } from '../types/Api.types';
import { createNewFlag, deleteExistingFlag, evaluateFeatureFlag, getFlag, getFlags, updateExistingFlag } from '../controllers/FeatureFlag.controller';

const router = Router();

// Public route for flag evaluation
router.post('/evaluate/:key', evaluateFeatureFlag);

// Protected routes - require authentication
// Get all flags
router.get('/', authenticateJwt, getFlags);

// Get flag by key
router.get('/:key', authenticateJwt, getFlag);

// Create new flag (admin only)
router.post('/', authenticateJwt, requireRole(UserRole.ADMIN), createNewFlag);

// Update flag (admin only)
router.put('/:id', authenticateJwt, requireRole(UserRole.ADMIN), updateExistingFlag);

// Delete flag (admin only)
router.delete('/:id', authenticateJwt, requireRole(UserRole.ADMIN), deleteExistingFlag);

export default router; 