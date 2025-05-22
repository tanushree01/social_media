"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserMinus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchFollowing, unfollowUser } from "@/redux/slices/usersSlice";
import Link from "next/link";

export default function FollowingPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const { following, isLoading, error } = useAppSelector((state) => state.users);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && token) {
      dispatch(fetchFollowing(token));
    }
  }, [dispatch, token, isMounted]);

  const handleUnfollow = (userId: number) => {
    if (token) {
      dispatch(unfollowUser({ userId, token }))
        .unwrap()
        .then(() => {
          toast({
            title: "Success",
            description: "User unfollowed successfully",
          });
          // Refresh the following list
          dispatch(fetchFollowing(token));
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
          onClick={() => token && dispatch(fetchFollowing(token))}
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
          <CardTitle className="text-2xl font-bold">People You Follow</CardTitle>
        </CardHeader>
        <CardContent>
          {following.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                You are not following anyone yet.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/users">Find People</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {following.map((user) => (
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnfollow(user.id)}
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Unfollow
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 