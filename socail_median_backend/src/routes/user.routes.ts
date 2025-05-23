import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  updateProfilePicture,
  searchUsers
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Profile routes (protected)
router.get('/profile/:id', authenticate, getProfile);
router.put('/profile/:id', authenticate, updateProfile);
router.put('/profile/:id/picture', authenticate, upload.single('profilePicture'), updateProfilePicture);

// Search users route (protected)
router.get('/search', authenticate, searchUsers);

export default router;
