import { Request, Response } from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Authentication Controllers
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      name
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Profile Controllers
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { name, bio } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile
    await user.update({
      name: name || user.name,
      bio: bio || user.bio
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        bio: user.bio
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

export const updateProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const profilePicture = 'uploads/'+ req.file?.filename; // Assuming you're using multer for file upload

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ profilePicture });

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile picture', error });
  }
};
