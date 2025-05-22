"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchFollowers, followUser, unfollowUser } from "@/redux/slices/usersSlice";
import Link from "next/link";

export default function FollowersPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { followers, following, isLoading, error } = useAppSelector((state) => state.users);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  // Calculate which followers are also being followed by the user
  const followingIds = following.map(user => user.id);
  const followersWithFollowingStatus = followers.map(user => ({
    ...user,
    isFollowing: followingIds.includes(user.id)
  }));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && token) {
      dispatch(fetchFollowers(token));
    }
  }, [dispatch, token, isMounted]);

  const handleFollow = (userId: number) => {
    if (token) {
      dispatch(followUser({ userId, token }))
        .unwrap()
        .then(() => {
          toast({
            title: "Success",
            description: "User followed successfully",
          });
        })
        .catch((err) => {
          toast({
            title: "Error",
            description: err || "Failed to follow user",
            variant: "destructive",
          });
        });
    }
  };

  const handleUnfollow = (userId: number) => {
    if (token) {
      dispatch(unfollowUser({ userId, token }))
        .unwrap()
        .then(() => {
          toast({
            title: "Success",
            description: "User unfollowed successfully",
          });
        })
        .catch((err) => {
          toast({
            title: "Error",
            description: err || "Failed to unfollow user",
            variant: "destructive",
          });
        });
    }
  };

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <Button 
          className="mt-4" 
          onClick={() => token && dispatch(fetchFollowers(token))}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Your Followers</CardTitle>
        </CardHeader>
        <CardContent>
          {followers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                You don't have any followers yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followersWithFollowingStatus.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage 
                        src={user.profilePicture ? `/${user.profilePicture}` : 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                        alt={user.name} 
                      />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/profile/${user.id}`} className="font-medium hover:underline">
                        {user.name}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                  {user.isFollowing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(user.id)}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Following
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleFollow(user.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow Back
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 