import { User } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
      file?: {
        path: string;
        filename: string;
        originalname: string;
        mimetype: string;
        size: number;
      };
    }
  }
} 