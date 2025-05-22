"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addComment } from "@/redux/slices/postsSlice";

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
  user: User;
}

interface CreateCommentFormProps {
  postId: number;
  onCommentAdded: (comment: Comment) => void;
}

export function CreateCommentForm({ postId, onCommentAdded }: CreateCommentFormProps) {
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector(state => state.auth);
  const { toast } = useToast();

  useEffect(() => {
    const getCommentList = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(`/api/comments/post/${postId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }
  
        const data = await response.json();
        setComments(data.comments); // assuming response has { comments: [...] }
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load comments",
          variant: "destructive",
        });
      }
    };
  
    getCommentList();
  }, [postId, token, toast]);
  

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;
    if (!user || !token) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const resultAction = await dispatch(addComment({
        postId,
        content,
        token,
        user
      })).unwrap();
      
      // The comment is already added to the post in the Redux store
      // but we still need to inform the parent component
      onCommentAdded(resultAction.comment);
      setContent("");
    } catch (error) {
      toast({
        title: "Error",
        description: typeof error === 'string' ? error : "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarUrl = user?.profilePicture
    ? `/${user.profilePicture}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-3 mb-4">
      <img src={avatarUrl} alt={user?.name} className="h-8 w-8 rounded-full mt-1" />
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 min-h-[60px] text-sm"
        />
        <div className="flex justify-end mt-2">
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>
    </form>
  );
} 