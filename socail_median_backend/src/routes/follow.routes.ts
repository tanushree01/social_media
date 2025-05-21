import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} from '../controllers/follow.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Follow routes (all protected)
router.post('/user/:userId', authenticate, followUser);
router.delete('/user/:userId', authenticate, unfollowUser);
router.get('/followers/:userId', authenticate, getFollowers);
router.get('/following/:userId', authenticate, getFollowing);

export default router; 