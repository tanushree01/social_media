"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { Search, UserPlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { searchUsers, clearUserSearch } from "@/redux/slices/userSearchSlice";
import Link from "next/link";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { followUser, unfollowUser } from "@/redux/slices/usersSlice";

interface UserSearchProps {
  onClose?: () => void;
  placeholder?: string;
}

export function UserSearch({ onClose, placeholder = "Search for friends..." }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFollowing, setIsFollowing] = useState<Record<number, boolean>>({});
  
  const dispatch = useAppDispatch();
  const { token, user: currentUser } = useAppSelector((state) => state.auth);
  const { users, isLoading } = useAppSelector((state) => state.userSearch);
  const { toast } = useToast();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Debounce search query
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    // Search users when debounced query changes
    if (debouncedQuery && debouncedQuery.length >= 2 && token) {
      dispatch(searchUsers({ query: debouncedQuery, token }));
    } else {
      dispatch(clearUserSearch());
    }
  }, [debouncedQuery, token, dispatch]);

  useEffect(() => {
    // Close search results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        dispatch(clearUserSearch());
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dispatch]);

  const handleFollow = async (userId: number) => {
    if (!token || !currentUser) return;

    try {
      await dispatch(followUser({ userId, token })).unwrap();
      setIsFollowing({ ...isFollowing, [userId]: true });
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
    if (!token || !currentUser) return;

    try {
      await dispatch(unfollowUser({ userId, token })).unwrap();
      setIsFollowing({ ...isFollowing, [userId]: false });
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

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          className="pl-8 pr-4 py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading && (
          <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {users.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-80 overflow-y-auto border dark:border-gray-700">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Link href={`/profile/${user._id}`} className="flex-1 flex items-center">
                <img
                  src={user.profilePicture ? `/${user.profilePicture}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                  alt={user.username}
                  className="h-8 w-8 rounded-full mr-2 object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    @{user.username}
                  </p>
                </div>
              </Link>

              {currentUser && currentUser._id !== user._id && (
                isFollowing[user._id] ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => handleUnfollow(user._id)}
                  >
                    Unfollow
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="ml-2"
                    onClick={() => handleFollow(user._id)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Follow
                  </Button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 