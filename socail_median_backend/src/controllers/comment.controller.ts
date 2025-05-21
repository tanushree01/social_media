import { Request, Response } from 'express';
import { Comment } from '../models/comment.model';
import { User } from '../models/user.model';

export const createComment = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const postId = parseInt(req.params.postId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const comment = await Comment.create({
      content,
      postId,
      userId
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'name', 'profilePicture']
      }]
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment: commentWithUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment', error });
  }
};

export const getPostComments = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    
    const comments = await Comment.findAll({
      where: { postId },
      include: [{
        model: User,
        attributes: ['id', 'username', 'name', 'profilePicture']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(comments);
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

    await comment.update({ content });

    const updatedComment = await Comment.findByPk(commentId, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'name', 'profilePicture']
      }]
    });

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = parseInt(req.params.id, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    await comment.destroy();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error });
  }
}; 