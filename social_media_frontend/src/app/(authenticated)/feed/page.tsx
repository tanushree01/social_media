"use client";

import { CreatePostForm } from "@/components/post/CreatePostForm";
import { PostCard } from "@/components/post/PostCard";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchFeedPosts, type Post } from "@/redux/slices/postsSlice";

export default function FeedPage() {
  const dispatch = useAppDispatch();
  const { feedPosts, isLoading, error } = useAppSelector(state => state.posts);
  const { token } = useAppSelector(state => state.auth);
  const { toast } = useToast();

  // Fetch posts on component mount
  useEffect(() => {
    if (token) {
      dispatch(fetchFeedPosts(token))
        .unwrap()
        .catch(error => {
          toast({
            title: "Error",
            description: typeof error === 'string' ? error : "Failed to load posts",
            variant: "destructive",
          });
        });
    }
  }, [dispatch, token, toast]);

  // Show error toast if Redux state has an error
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handlePostCreated = () => {
    // Posts are automatically updated in Redux store when created
    // No need to manually fetch again
  };

  const handlePostDeleted = (postId: number) => {
    // Post deletion is handled by the deletePost action
    // Redux will update the state automatically
  };


  console.log(feedPosts)
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Home Feed</h1>
      
      <CreatePostForm onPostCreated={handlePostCreated} />
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : feedPosts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Create a post or follow some users to see their posts here
          </p>
        </div>
      ) : (
        <div>
          {feedPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onDelete={handlePostDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
} 