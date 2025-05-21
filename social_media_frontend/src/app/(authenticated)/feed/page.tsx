"use client";

import { CreatePostForm } from "@/components/post/CreatePostForm";
import { Post, PostCard } from "@/components/post/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPosts();
    }
  }, [token]);

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handlePostDeleted = (postId: number) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Home Feed</h1>
      
      <CreatePostForm onPostCreated={handlePostCreated} />
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Create a post or follow some users to see their posts here
          </p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
          ))}
        </div>
      )}
    </div>
  );
} 