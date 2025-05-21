import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { id: number; email: string };

    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 