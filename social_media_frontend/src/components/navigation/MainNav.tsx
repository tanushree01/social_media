"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Home, User, Users, LogOut, Menu, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/authSlice";

export function MainNav() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    // Set avatar URL only on client-side
    if (user?.profilePicture) {
      setAvatarUrl(`/${user.profilePicture}`);
    } else if (user?.name) {
      setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`);
    } else {
      setAvatarUrl(`https://ui-avatars.com/api/?name=User&background=random`);
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/feed" className="text-xl font-bold">
                SocialApp
              </Link>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link href="/feed" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link href="/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <Link href="/discover" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Find Friends</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="ml-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
            <div className="ml-3">
              <Link href="/profile">
                {avatarUrl && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={avatarUrl}
                    alt={user?.name || "User"}
                  />
                )}
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 border-t">
            <Link
              href="/feed"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link
              href="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
            <Link
              href="/discover"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <Users className="h-5 w-5" />
              <span>Find Friends</span>
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 