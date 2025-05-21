import express from 'express';
import {
  createComment,
  getPostComments,
  updateComment,
  deleteComment
} from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Comment routes (all protected)
router.post('/post/:postId', authenticate, createComment);
router.get('/post/:postId', authenticate, getPostComments);
router.put('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);

export default router; 