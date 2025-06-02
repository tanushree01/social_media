import { Request, Response } from 'express';
import Like from '../models/like.model';
import Post from '../models/post.model';
import User from '../models/user.model';
import mongoose from 'mongoose';

export const toggleLike = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const postId = req.params.postId;
    const userId = req.user?.id;

    if (!userId) {
      await session.abortTransaction();
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await Post.findById(postId).session(session);
    if (!post) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = await Like.findOne({ postId, userId }).session(session);

    if (existingLike) {
      await existingLike.deleteOne({ session });
      post.likeCount = (post.likeCount || 1) - 1;
      await post.save({ session });

      await session.commitTransaction();

      return res.json({
        message: 'Post unliked successfully',
        liked: false,
        likeCount: post.likeCount,
        postId,
        userId
      });
    } else {
      await Like.create([{ postId, userId }], { session });
      post.likeCount = (post.likeCount || 0) + 1;
      await post.save({ session });

      await session.commitTransaction();

      return res.json({
        message: 'Post liked successfully',
        liked: true,
        likeCount: post.likeCount,
        postId,
        userId
      });
    }
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ message: 'Error toggling like', error });
  } finally {
    session.endSession();
  }
};

export const getPostLikes = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likes = await Like.find({ postId })
      .populate('userId', 'id username name profilePicture');

    res.json({
      likes: likes.map(like => like.userId),
      likeCount: post.likeCount || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching likes', error });
  }
};
