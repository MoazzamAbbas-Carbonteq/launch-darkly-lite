import { UserRole } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: UserRole;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
} 