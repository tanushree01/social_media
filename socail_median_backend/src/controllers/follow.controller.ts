import { Request, Response } from 'express';
import Follow from '../models/follow.model';
import User from '../models/user.model';

export const followUser = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const followingId = req.params.userId;

    if (!followerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (followerId === followingId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const existingFollow = await Follow.findOne({ followerId, followingId });
    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    await Follow.create({ followerId, followingId });

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    res.status(500).json({ message: 'Error following user', error });
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const followingId = req.params.userId;

    if (!followerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const follow = await Follow.findOne({ followerId, followingId });
    if (!follow) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    await follow.deleteOne();

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user', error });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const followers = await Follow.find({ followingId: userId })
      .populate('followerId', 'id username name profilePicture');

    res.json(followers.map(f => f.followerId));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching followers', error });
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const following = await Follow.find({ followerId: userId })
      .populate('followingId', 'id username name profilePicture');

    res.json(following.map(f => f.followingId));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching following', error });
  }
};
