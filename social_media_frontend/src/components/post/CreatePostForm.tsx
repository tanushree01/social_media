"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FormEvent, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

interface CreatePostFormProps {
  onPostCreated: () => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !image) {
      toast({
        title: "Error",
        description: "Please add some content or an image to your post",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(`/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      setContent("");
      setImage(null);
      setPreview(null);
      onPostCreated();
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not create your post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 min-h-[100px]"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>

        {preview && (
          <div className="mb-4 relative">
            <img 
              src={preview} 
              alt="Upload preview" 
              className="max-h-96 max-w-full rounded-lg mx-auto"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
              onClick={() => {
                setImage(null);
                setPreview(null);
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 cursor-pointer text-blue-500 hover:text-blue-600">
            <ImagePlus className="h-5 w-5" />
            <span>Add Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          <Button
            type="submit"
            disabled={isLoading || (!content.trim() && !image)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 