"use client";

import { useEffect, useState, FormEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserMinus, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUsers, followUser, unfollowUser, User } from "@/redux/slices/usersSlice";
import Link from "next/link";

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { token, user: currentUser } = useAppSelector((state) => state.auth);
  const { allUsers, isLoading, error } = useAppSelector((state) => state.users);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && token) {
      dispatch(fetchUsers(token));
    }
  }, [dispatch, token, isMounted]);

  useEffect(() => {
    // Filter out the current user from the list
    const usersWithoutCurrent = currentUser
      ? allUsers.filter((user: User) => user._id !== currentUser._id)
      : allUsers;

    if (searchQuery.trim() === "") {
      setFilteredUsers(usersWithoutCurrent);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        usersWithoutCurrent.filter(
          (user: User) =>
            user.name?.toLowerCase().includes(query) ||
            user.username?.toLowerCase().includes(query)
        )
      );
    }
  }, [allUsers, searchQuery, currentUser]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // Filter is already handled in the useEffect above
  };

  const handleFollow = (userId: number) => {
    if (!token) return;
    
    dispatch(followUser({ userId, token }))
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "You are now following this user",
        });
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err || "Failed to follow user",
          variant: "destructive",
        });
      });
  };

  const handleUnfollow = (userId: number) => {
    if (!token) return;
    
    dispatch(unfollowUser({ userId, token }))
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "You have unfollowed this user",
        });
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err || "Failed to unfollow user",
          variant: "destructive",
        });
      });
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
        <Button className="mt-4" onClick={() => token && dispatch(fetchUsers(token))}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Find People</h1>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Search by name or username"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user: User) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          user.profilePicture
                            ? `/${user.profilePicture}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name || "User"
                              )}&background=random`
                        }
                        alt={user.name || "User"}
                      />
                      <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/profile/${user._id}`} className="font-medium hover:underline">
                        {user.name}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  {user.isFollowing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnfollow(user._id)}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Unfollow
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleFollow(user._id)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 