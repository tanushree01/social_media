"use client";

import { formatRelativeTime } from "@/lib/utils";
import { Heart, MessageCircle, MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { CommentList } from "./CommentList";
import { CreateCommentForm } from "./CreateCommentForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  name: string;
  profilePicture?: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  User: User;
}

export interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  userId: number;
  User: User;
  comments: Comment[];
  likes: { userId: number }[];
}

interface PostCardProps {
  post: Post;
  onDelete: (postId: number) => void;
}

export function PostCard({ post, onDelete }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const { user: currentUser, token } = useAuth();
  const { toast } = useToast();

  const createdAt = post?.createdAt ? new Date(post.createdAt) : new Date();
  const isOwnPost = currentUser?.id === post?.userId;

  // Use proxy for images
  const profileImageUrl = post?.User?.profilePicture
    ? `${post.User.profilePicture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(post?.User?.username || "User")}&background=random`;

  const postImageUrl = post?.imageUrl
    ? `/${post.imageUrl}`
    : null;

  useEffect(() => {
    if (post.likes?.some((like) => like.userId === currentUser?.id)) {
      setIsLiked(true);
    }
  }, [post.likes, currentUser?.id , profileImageUrl]);

  const handleLikeToggle = async () => {
    try {
      const response = await fetch(`/api/likes/post/${post.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to toggle like");

      setIsLiked(!isLiked);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete post");

      onDelete(post.id);
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

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Link href={`/profile/${post?.User?.id || ""}`}>
            <img
              src={profileImageUrl}
              alt={post?.User?.username || "User"}
              className="h-10 w-10 rounded-full mr-3"
            />
          </Link>
          <div>
            <Link
              href={`/profile/${post?.User?.id || ""}`}
              className="font-semibold text-gray-900 dark:text-white hover:underline"
            >
              {post?.User?.username || "Unknown"}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              @{post?.User?.username || "unknown"} • {formatRelativeTime(createdAt)}
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
            <span>{likesCount}</span>
          </button>

          <button
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-5 w-5" />
            <span>{comments.length}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t dark:border-gray-700">
          <CreateCommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
          <CommentList comments={comments} />
        </div>
      )}
    </div>
  );
}
