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

// Get followers and following by user ID
router.get('/followers/:userId', authenticate, getFollowers);
router.get('/following/:userId', authenticate, getFollowing);

// Get current user's followers and following
router.get('/followers', authenticate, (req, res) => {
  if (req.user && req.user.id) {
    req.params.userId = req.user.id.toString();
    getFollowers(req, res);
  } else {
    res.status(401).json({ message: 'Authentication required' });
  }
});

router.get('/following', authenticate, (req, res) => {
  if (req.user && req.user.id) {
    req.params.userId = req.user.id.toString();
    getFollowing(req, res);
  } else {
    res.status(401).json({ message: 'Authentication required' });
  }
});

export default router; 