import { Router } from 'express';
import { login, register, logout, getProfile } from '../controllers/Authentication.controller';
import { authenticateJwt } from '../middleware/Authentication.middleware';

const router = Router();

// Authentication routes
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

// Protected routes
router.get('/profile', authenticateJwt, getProfile);

export default router; 