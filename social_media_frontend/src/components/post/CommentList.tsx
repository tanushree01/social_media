"use client";

import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

interface User {
  id: number;
  username: string;
  name: string;
  profilePicture?: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: User;
}

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 text-sm my-2">No comments yet</p>;
  }

  return (
    <div className="space-y-4 mt-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <Link href={`/profile/${comment.user.id}`}>
            <img
              src={
                comment.user.profilePicture
                  ? `${comment.user.profilePicture}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      comment.user.name
                    )}&background=random`
              }
              alt={comment.user.name}
              className="h-8 w-8 rounded-full mt-1"
            />
          </Link>
          <div className="flex-1">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Link
                  href={`/profile/${comment.user.id}`}
                  className="font-semibold text-sm text-gray-900 dark:text-white hover:underline"
                >
                  {comment.user.name}
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(new Date(comment.createdAt))}
                </span>
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-sm mt-1">{comment.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 