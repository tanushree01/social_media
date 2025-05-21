"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Post, PostCard } from "@/components/post/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      
      if (user.profilePicture) {
        setProfileImagePreview(`/${user.profilePicture}`);
      }
    }
  }, [user]);

  useEffect(() => {
    if (token && user) {
      fetchUserPosts();
    }
  }, [token, user]);

  const fetchUserPosts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/me`, {
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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    
    try {
      // Update basic profile info
      const profileResponse = await fetch(`/api/users/profile/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio }),
      });

      if (!profileResponse.ok) {
        throw new Error("Failed to update profile");
      }

      // Update profile picture if changed
      if (profileImage) {
        const formData = new FormData();
        formData.append("profilePicture", profileImage);

        const imageResponse = await fetch(`/api/users/profile/${user?.id}/picture`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!imageResponse.ok) {
          throw new Error("Failed to update profile picture");
        }
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
      
      // Refresh user data in local storage
      const updatedUser = { 
        ...user, 
        name, 
        bio,
        profilePicture: profileImage ? "/path/to/new/image" : user?.profilePicture  // This is a placeholder, will be updated on next login
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePostDeleted = (postId: number) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const avatarUrl = profileImagePreview || 
    (user?.profilePicture 
      ? `/${user.profilePicture}` 
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random&size=200`);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        {/* Cover image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        {/* Profile info */}
        <div className="p-6 relative">
          {/* Profile picture */}
          <div className="absolute -top-16 left-6">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={user?.name}
                className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </label>
              )}
            </div>
          </div>
          
          {/* Profile details */}
          <div className="ml-36 pt-2">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="max-w-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 min-h-[100px]"
                  ></textarea>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user?.name || "");
                      setBio(user?.bio || "");
                      setProfileImage(null);
                      setProfileImagePreview(user?.profilePicture ? `/${user.profilePicture}` : null);
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold">{user?.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">@{user?.username}</p>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    Edit Profile
                  </Button>
                </div>
                {user?.bio && (
                  <p className="mt-4 text-gray-700 dark:text-gray-300">{user.bio}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* User posts */}
      <h2 className="text-xl font-bold mt-8 mb-4">My Posts</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-400">
            You haven&apos;t created any posts yet
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