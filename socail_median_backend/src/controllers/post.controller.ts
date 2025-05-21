import { Request, Response } from 'express';
import { Post } from '../models/post.model';
import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';
import { Like } from '../models/like.model';

// Post Controllers
export const createPost = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const userId = req.user?.id;
    const imageUrl = 'uploads/'+ req.file?.filename; // Assuming you're using multer for file upload

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await Post.create({
      content,
      userId,
      imageUrl
    });

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'name', 'profilePicture']
        },
        {
          model: Comment,
          include: [{
            model: User,
            attributes: ['id', 'username', 'name', 'profilePicture']
          }]
        },
        {
          model: Like,
          attributes: ['userId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
};

export const getPost = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'name', 'profilePicture']
        },
        {
          model: Comment,
          include: [{
            model: User,
            attributes: ['id', 'username', 'name', 'profilePicture']
          }]
        },
        {
          model: Like,
          attributes: ['userId']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = req.user?.id;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this post' });
    }

    await post.update({ content });

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }

    await post.destroy();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error });
  }
}; 