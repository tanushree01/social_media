"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Save, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUserPosts, Post } from "@/redux/slices/postsSlice";
import { updateProfile, updateProfilePicture } from "@/redux/slices/authSlice";
import { fetchFollowers, fetchFollowing } from "@/redux/slices/usersSlice";
import { PostCard } from "@/components/post/PostCard";
import Link from "next/link";
import { deletePost } from "@/redux/slices/postsSlice";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, token, isLoading: authLoading } = useAppSelector(state => state.auth);
  const { userPosts, isLoading: postsLoading } = useAppSelector(state => state.posts);
  const { followers, following } = useAppSelector(state => state.users);
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user && isMounted) {
      setName(user.name || "");
      setBio(user.bio || "");
      
      if (user.profilePicture) {
        setProfileImagePreview(`/${user.profilePicture}`);
      }
    }
  }, [user, isMounted]);

  useEffect(() => {
    if (token && isMounted) {
      dispatch(fetchUserPosts(token));
      dispatch(fetchFollowers(token));
      dispatch(fetchFollowing(token));
    }
  }, [dispatch, token, isMounted]);

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
    if (!user?.id || !token) return;
    
    setIsUpdating(true);
    try {
      // Update basic profile info
      await dispatch(updateProfile({
        userId: user.id,
        profileData: { name, bio },
        token
      })).unwrap();
      
      // Update profile picture if changed
      if (profileImage) {
        await dispatch(updateProfilePicture({
          userId: user.id,
          imageFile: profileImage,
          token
        })).unwrap();
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
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

  const handleDeletePost = (postId: number) => {
    if (token) {
      dispatch(deletePost({ postId, token }))
        .unwrap()
        .then(() => {
          toast({
            title: "Success",
            description: "Post deleted successfully",
          });
        })
        .catch((err) => {
          toast({
            title: "Error",
            description: err || "Failed to delete post",
            variant: "destructive",
          });
        });
    }
  };

  const avatarUrl = profileImagePreview || 
    (user?.profilePicture 
      ? `/${user.profilePicture}` 
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random&size=200`);

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6">
        {/* Cover image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        {/* Profile info */}
        <div className="relative px-6 pb-6 pt-20">
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
          <div className="ml-36">
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
                    
                    {/* Follower and Following counts */}
                    <div className="flex mt-4 space-x-4">
                      <Link href="/followers" className="flex items-center hover:text-blue-600 transition-colors">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="font-medium">{followers.length}</span>
                        <span className="ml-1 text-gray-500 dark:text-gray-400">Followers</span>
                      </Link>
                      <Link href="/following" className="flex items-center hover:text-blue-600 transition-colors">
                        <UserCheck className="h-4 w-4 mr-1" />
                        <span className="font-medium">{following.length}</span>
                        <span className="ml-1 text-gray-500 dark:text-gray-400">Following</span>
                      </Link>
                    </div>
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
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4">My Posts</h2>
          
          {postsLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                You haven&apos;t created any posts yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post: Post) => (
                <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 