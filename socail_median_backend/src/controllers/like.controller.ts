import { Request, Response } from 'express';
import { Like } from '../models/like.model';
import { User } from '../models/user.model';

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if like already exists
    const existingLike = await Like.findOne({
      where: {
        postId,
        userId
      }
    });

    if (existingLike) {
      // Unlike the post
      await existingLike.destroy();
      res.json({ message: 'Post unliked successfully' });
    } else {
      // Like the post
      await Like.create({
        postId,
        userId
      });
      res.json({ message: 'Post liked successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like', error });
  }
};

export const getPostLikes = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    
    const likes = await Like.findAll({
      where: { postId },
      include: [{
        model: User,
        attributes: ['id', 'username', 'name', 'profilePicture']
      }]
    });

    res.json(likes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching likes', error });
  }
}; 