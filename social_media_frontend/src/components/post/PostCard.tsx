"use client";

import { formatRelativeTime } from "@/lib/utils";
import { Heart, MessageCircle, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { CommentList } from "./CommentList";
import { CreateCommentForm } from "./CreateCommentForm";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleLike, deletePost, addComment } from "@/redux/slices/postsSlice";

// Import types from postsSlice to ensure consistency
import type { Post } from "@/redux/slices/postsSlice";

// This Comment interface aligns with the one in CommentList.tsx
interface Comment {
  _id: number;
  content: string;
  createdAt: string;
  userId: {
    _id: number;
    username: string;
    name: string;
    profilePicture?: string;
  };
}

interface PostCardProps {
  post: Post;
  onDelete: (postId: number) => void;
  showCommentsInitially?: boolean;
}

export function PostCard({ post, onDelete, showCommentsInitially = true }: PostCardProps) {
  
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(showCommentsInitially);
  const [showMenu, setShowMenu] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  const dispatch = useAppDispatch();
  const { user: currentUser, token } = useAppSelector(state => state.auth);
  const { toast } = useToast();

  const createdAt = post?.createdAt ? new Date(post.createdAt) : new Date();
  const isOwnPost = currentUser?._id === post?.userId;

  // Handle API response format which uses uppercase "Comments" and "Likes"
  useEffect(() => {
    // Handle Comments array (uppercase or lowercase from API)
    const commentsArray = post.Comments || post.comments || [];
    const formattedComments = commentsArray.map((comment: any) => ({
      id: comment._id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: comment.User || comment.user // Handle both uppercase and lowercase
    }));
    setComments(formattedComments);

    // Check if current user has liked this post
    const likesArray = post.Likes || post.likes || [];
    if (currentUser && likesArray.some((like: any) => like.userId === currentUser._id)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [post, currentUser]);

  // Use proxy for images
  const profileImageUrl = post?.User?.profilePicture
    ? `/${post.User.profilePicture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(post?.User?.username || "User")}&background=random`;

  const postImageUrl = post?.imageUrl
    ? `/${post.imageUrl}`
    : null;

  const handleLikeToggle = async () => {
    if (!currentUser || !token) return;

    try {
      await dispatch(toggleLike({ 
        postId: post._id,
        token,
        userId: currentUser._id
      })).unwrap();

      // Update UI immediately before Redux state updates
      setIsLiked(!isLiked);

    } catch (error) {
        console.error("Like error:", error);

      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await dispatch(deletePost({ 
        postId: post._id,
        token: token!
      })).unwrap();

      onDelete(post._id);
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Link href={`/profile/${post?.User?._id || ""}`}>
            <img
              src={profileImageUrl}
              alt={post?.User?.username || "User"}
              className="h-10 w-10 rounded-full mr-3 object-cover"
            />
          </Link>
          <div>
            <Link
              href={`/profile/${post?.User?._id || ""}`}
              className="font-semibold text-gray-900 dark:text-white hover:underline"
            >
              {post?.userId?.username || "Unknown"}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              @{post?.userId?.username || "unknown"} • {formatRelativeTime(createdAt)}
            </p>
          </div>
        </div>

        {isOwnPost && (
          <div className="relative">
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border dark:border-gray-700">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={handleDeletePost}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
          {post?.content || ""}
        </p>

        {postImageUrl && (
          <img
            src={postImageUrl}
            alt="Post"
            className="mt-4 rounded-lg max-h-96 w-auto mx-auto"
          />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <button
            className={`flex items-center space-x-1 ${
              isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400"
            } hover:text-red-500`}
            onClick={handleLikeToggle}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{post.likeCount || 0}</span>
          </button>

          <button
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500"
            onClick={toggleComments}
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.commentCount || 0}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t dark:border-gray-700">
          <CreateCommentForm postId={post._id} comments={post.Comments} onCommentAdded={handleCommentAdded} />
          <CommentList comments={comments} />
        </div>
      )}
    </div>
  );
}
