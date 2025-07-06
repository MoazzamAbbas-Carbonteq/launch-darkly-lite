import { Router } from 'express';
import { makeUserRoutes } from '../controllers/User.controller';
import { authenticateJwt, requireRole } from '../middleware/Authentication.middleware';
import { UserRole } from '../types/Api.types';

const router = Router();

// Create user controllers with dependency injection (no 'new' keyword!)
const userControllers = makeUserRoutes();

// User management routes (protected)
// Create new user (admin only)
router.post('/', authenticateJwt, requireRole(UserRole.ADMIN), userControllers.createUser);

// Get user by ID (authenticated users can access)
router.get('/:id', authenticateJwt, userControllers.getUser);

// Export the router
export default router; 