"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, UserPlus, UserMinus } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  name: string;
  profilePicture?: string;
  isFollowing?: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { token, user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      // Get all users
      const allUsers = await response.json();
      
      // Get user's following list
      const followingResponse = await fetch(
        `/api/follows/following/${currentUser?.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!followingResponse.ok) {
        throw new Error("Failed to fetch following list");
      }

      const followingData = await followingResponse.json();
      const followingIds = followingData.map((follow: any) => follow.Following.id);

      // Mark users that the current user is following
      const usersWithFollowingStatus = allUsers.map((user: User) => ({
        ...user,
        isFollowing: followingIds.includes(user.id),
      }));

      // Filter out the current user
      const filteredUsers = usersWithFollowingStatus.filter(
        (user: User) => user.id !== currentUser?.id
      );

      setUsers(filteredUsers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // Filter users based on search query (client-side filtering for simplicity)
    // In a real app, you might want to do server-side filtering
  };

  const handleFollow = async (userId: number) => {
    try {
      const response = await fetch(
        `/api/follows/user/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to follow user");
      }

      // Update UI state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isFollowing: true } : user
        )
      );

      toast({
        title: "Success",
        description: "You are now following this user",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      const response = await fetch(
        `/api/follows/user/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unfollow user");
      }

      // Update UI state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isFollowing: false } : user
        )
      );

      toast({
        title: "Success",
        description: "You have unfollowed this user",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = searchQuery
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Find People</h1>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <Input
            placeholder="Search by name or username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mr-2"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </form>

      {/* Users list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery
              ? "No users found matching your search"
              : "No users found"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div className="flex items-center">
                <Link href={`/profile/${user.id}`}>
                  <img
                    src={
                      user.profilePicture
                        ? `/${user.profilePicture}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.name
                          )}&background=random`
                    }
                    alt={user.name}
                    className="h-12 w-12 rounded-full mr-4"
                  />
                </Link>
                <div>
                  <Link
                    href={`/profile/${user.id}`}
                    className="font-semibold text-gray-900 dark:text-white hover:underline"
                  >
                    {user.name}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    @{user.username}
                  </p>
                </div>
              </div>
              {user.isFollowing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnfollow(user.id)}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Unfollow
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleFollow(user.id)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 