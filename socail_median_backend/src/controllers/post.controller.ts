import { Request, Response } from 'express';
import PostModel from '../models/post.model';
import UserModel from '../models/user.model';
import CommentModel from '../models/comment.model';
import LikeModel from '../models/like.model';
import FollowModel from '../models/follow.model';

// Create Post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const userId = req.user?.id;
    const imageUrl = req.file?.filename ? 'uploads/' + req.file.filename : '';

    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    const post = await PostModel.create({
      content,
      userId,
      imageUrl,
      likeCount: 0,
      commentCount: 0
    });

    const user = await UserModel.findById(userId).select('id username name profilePicture');

    res.status(201).json({ message: 'Post created successfully', post, user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error });
  }
};

// Get Posts (from mutual followers + own)
export const getPosts = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;

    if (!currentUserId) return res.status(401).json({ message: 'Authentication required' });

    const following = await FollowModel.find({ followerId: currentUserId }).select('followingId');
    const followers = await FollowModel.find({ followingId: currentUserId }).select('followerId');

    const followingIds = following.map(f => f.followingId.toString());
    const followerIds = followers.map(f => f.followerId.toString());

    const mutualFollowIds = followingIds.filter(id => followerIds.includes(id));
    mutualFollowIds.push(currentUserId);

    const posts = await PostModel.find({ userId: { $in: mutualFollowIds } })
      .populate('userId', 'id username name profilePicture')
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'id username name profilePicture' }
      })
      .populate('likes', 'userId')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
};

// Get My Posts
export const getMyPost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const posts = await PostModel.find({ userId })
      .populate('userId', 'id username name profilePicture')
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'id username name profilePicture' }
      })
      .populate('likes', 'userId')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
};

// Get Single Post
export const getPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;

    const post = await PostModel.findById(postId)
      .populate('userId', 'id username name profilePicture')
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'id username name profilePicture' }
      })
      .populate('likes', 'userId');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error });
  }
};

// Update Post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id;
    const { content } = req.body;

    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });

    post.content = content;
    await post.save();

    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error });
  }
};

// Delete Post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'Authentication required' });

    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error });
  }
};
