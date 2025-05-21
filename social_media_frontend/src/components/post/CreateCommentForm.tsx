"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FormEvent, useState } from "react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/comments/post/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const data = await response.json();
      
      // Create a comment object to add to the UI
      const newComment: Comment = {
        id: data.comment.id,
        content,
        createdAt: new Date().toISOString(),
        user: {
          id: user!.id,
          username: user!.username,
          name: user!.name,
          profilePicture: user!.profilePicture,
        },
      };

      onCommentAdded(newComment);
      setContent("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
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