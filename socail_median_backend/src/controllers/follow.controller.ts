import { Request, Response } from 'express';
import { Follow } from '../models/follow.model';
import { User } from '../models/user.model';

export const followUser = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const followingId = parseInt(req.params.userId, 10);

    if (!followerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: {
        followerId,
        followingId
      }
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    await Follow.create({
      followerId,
      followingId
    });

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    res.status(500).json({ message: 'Error following user', error });
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const followingId = parseInt(req.params.userId, 10);

    if (!followerId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const follow = await Follow.findOne({
      where: {
        followerId,
        followingId
      }
    });

    if (!follow) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    await follow.destroy();

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user', error });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    const followers = await Follow.findAll({
      where: { followingId: userId },
      include: [{
        model: User,
        as: 'Follower',
        attributes: ['id', 'username', 'name', 'profilePicture']
      }]
    });

    res.json(followers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching followers', error });
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    const following = await Follow.findAll({
      where: { followerId: userId },
      include: [{
        model: User,
        as: 'Following',
        attributes: ['id', 'username', 'name', 'profilePicture']
      }]
    });

    res.json(following);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching following', error });
  }
}; 