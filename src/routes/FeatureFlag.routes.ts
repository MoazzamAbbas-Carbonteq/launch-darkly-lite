import { Router } from 'express';
import { 
  getFlags, 
  getFlag, 
  updateExistingFlag, 
  deleteExistingFlag, 
  evaluateFeatureFlag 
} from '../controllers/FeatureFlag.controller';
import { authenticateJwt, requireRole } from '../middleware/Authentication.middleware';
import { UserRole } from '../types';
import { FlagController } from '../controllers/Flag.controller';

const router = Router();

// Instantiate controller using Effect-TS DI
const flagController = new FlagController();

// Public route for flag evaluation
router.post('/evaluate/:key', evaluateFeatureFlag);

// Protected routes - require authentication
// Get all flags
router.get('/', authenticateJwt, getFlags);

// Get flag by key
router.get('/:key', authenticateJwt, getFlag);

// Create new flag (admin only)
router.post('/', authenticateJwt, requireRole(UserRole.ADMIN), flagController.createFlag.bind(flagController));

// Update flag (admin only)
router.put('/:id', authenticateJwt, requireRole(UserRole.ADMIN), updateExistingFlag);

// Delete flag (admin only)
router.delete('/:id', authenticateJwt, requireRole(UserRole.ADMIN), deleteExistingFlag);

export default router; 