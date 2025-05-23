"use client";

import { UserSearch } from "@/components/user/UserSearch";
import { PageTitle } from "@/components/ui/page-title";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiscoverPage() {
  return (
    <main className="container max-w-4xl mx-auto px-4 py-6">
      <PageTitle>Find Friends</PageTitle>
      
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Search for friends by username or name and follow them to see their posts in your feed.
        </p>
        
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <UserSearch placeholder="Search for users by name or username" />
        </Suspense>
      </div>
    </main>
  );
} 