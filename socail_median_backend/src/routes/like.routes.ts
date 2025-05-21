import express from 'express';
import {
  toggleLike,
  getPostLikes
} from '../controllers/like.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Like routes (all protected)
router.post('/post/:postId', authenticate, toggleLike);
router.get('/post/:postId', authenticate, getPostLikes);

export default router; 