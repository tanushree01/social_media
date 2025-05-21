"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { register, clearError } from "@/redux/slices/authSlice";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Clear errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // Show error toast if registration fails
    if (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error,
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(register({ username, email, password, name }));
      
      if (register.fulfilled.match(resultAction)) {
        toast({
          title: "Success",
          description: "Account created successfully. You can now log in.",
        });
        router.push("/login");
      }
    } catch (error) {
      // Error is already handled in the useEffect above
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Join our social media platform
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
                placeholder="johndoe"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>

          <div className="text-center text-sm mt-4">
            <p>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 