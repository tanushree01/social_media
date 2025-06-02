import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Comment from '../models/comment.model';
import User from '../models/user.model';
import Post from '../models/post.model';

export const createComment = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      content,
      postId,
      userId,
    });

    await comment.save();

    post.commentCount += 1;
    await post.save();

    const commentWithUser = await Comment.findById(comment._id)
      .populate('userId', 'id username name profilePicture');

    res.status(201).json({
      message: 'Comment created successfully',
      comment: commentWithUser,
      commentCount: post.commentCount,
      postId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment', error });
  }
};


export const getPostComments = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await Comment.find({ postId })
      .populate('userId', 'id username name profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      comments,
      commentCount: post.commentCount,
      postId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;
    const userId = req.user?.id;
    const { content } = req.body;

    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this comment' });
    }

    comment.content = content;
    await comment.save();

    const post = await Post.findById(comment.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const updatedComment = await Comment.findById(commentId)
      .populate('userId', 'id username name profilePicture');

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment,
      commentCount: post.commentCount,
      postId: post._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  try {
    const commentId = req.params.id;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    session.startTransaction();

    const comment = await Comment.findById(commentId).session(session);
    if (!comment) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== userId) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    const post = await Post.findById(comment.postId).session(session);
    if (!post) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Post not found' });
    }

    await comment.deleteOne({ session });

    post.commentCount = Math.max(post.commentCount - 1, 0);
    await post.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Comment deleted successfully',
      commentCount: post.commentCount,
      postId: post._id,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Error deleting comment', error });
  }
};
