import express from 'express';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost
} from '../controllers/post.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Post routes (all protected)
router.post('/', authenticate, upload.single('image'), createPost);
router.get('/', authenticate, getPosts);
router.get('/:id', authenticate, getPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

export default router; 