import { Request, Response } from 'express';
import { Like } from '../models/like.model';
import { User } from '../models/user.model';
import { Post } from '../models/post.model';
import { sequelize } from '../config/database';
import { Transaction } from 'sequelize';

export const toggleLike = async (req: Request, res: Response) => {
  let transaction: Transaction | null = null;
  
  try {
    const postId = parseInt(req.params.postId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Start transaction to ensure atomic operations
    transaction = await sequelize.transaction();

    // Find the post
    const post = await Post.findByPk(postId, { transaction });
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if like already exists
    const existingLike = await Like.findOne({
      where: {
        postId,
        userId
      },
      transaction
    });

    if (existingLike) {
      // Unlike the post
      await existingLike.destroy({ transaction });
      
      // Decrement the likeCount directly in the post
      await post.decrement('likeCount', { transaction });
      await post.reload({ transaction });
      
      await transaction.commit();
      
      res.json({ 
        message: 'Post unliked successfully',
        liked: false,
        likeCount: post.likeCount,
        postId,
        userId 
      });
    } else {
      // Like the post
      await Like.create({
        postId,
        userId
      }, { transaction });
      
      // Increment the likeCount directly in the post
      await post.increment('likeCount', { transaction });
      await post.reload({ transaction });
      
      await transaction.commit();
      
      res.json({ 
        message: 'Post liked successfully',
        liked: true,
        likeCount: post.likeCount,
        postId,
        userId
      });
    }
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: 'Error toggling like', error });
  }
};

export const getPostLikes = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const likes = await Like.findAll({
      where: { postId },
      include: [{
        model: User,
        attributes: ['id', 'username', 'name', 'profilePicture']
      }]
    });

    res.json({
      likes,
      likeCount: post.likeCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching likes', error });
  }
}; 