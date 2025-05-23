import { Request, Response } from 'express';
import { Comment } from '../models/comment.model';
import { User } from '../models/user.model';
import { Post } from '../models/post.model';
import { sequelize } from '../config/database';
import { Transaction } from 'sequelize';

export const createComment = async (req: Request, res: Response) => {
  let transaction: Transaction | null = null;
  
  try {
    const { content } = req.body;
    const postId = parseInt(req.params.postId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Start transaction
    transaction = await sequelize.transaction();

    // Find the post
    const post = await Post.findByPk(postId, { transaction });
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      content,
      postId,
      userId
    }, { transaction });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'name', 'profilePicture']
      }],
      transaction
    });

    // Increment the commentCount directly in the post
    await post.increment('commentCount', { transaction });
    await post.reload({ transaction });
    
    await transaction.commit();

    res.status(201).json({
      message: 'Comment created successfully',
      comment: commentWithUser,
      commentCount: post.commentCount,
      postId
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: 'Error creating comment', error });
  }
};

export const getPostComments = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comments = await Comment.findAll({
      where: { postId },
      include: [{
        model: User,
        attributes: ['id', 'username', 'name', 'profilePicture']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      comments,
      commentCount: post.commentCount,
      postId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.id, 10);
    const userId = req.user?.id;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this comment' });
    }

    const postId = comment.postId;
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await comment.update({ content });

    const updatedComment = await Comment.findByPk(commentId, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'name', 'profilePicture']
      }]
    });

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment,
      commentCount: post.commentCount,
      postId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  let transaction: Transaction | null = null;
  
  try {
    const commentId = parseInt(req.params.id, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Start transaction
    transaction = await sequelize.transaction();

    const comment = await Comment.findByPk(commentId, { transaction });
    if (!comment) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    const postId = comment.postId;
    const post = await Post.findByPk(postId, { transaction });
    if (!post) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Post not found' });
    }

    await comment.destroy({ transaction });

    // Decrement the commentCount directly in the post
    await post.decrement('commentCount', { transaction });
    await post.reload({ transaction });
    
    await transaction.commit();

    res.json({ 
      message: 'Comment deleted successfully',
      commentCount: post.commentCount,
      postId
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: 'Error deleting comment', error });
  }
}; 