"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/model/authStore";
import { loginSchema, type LoginFormData } from "@/features/auth/model/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ROUTE_PATHS } from "@/shared/config/appConfig";
import { ROLE_DEFAULT_REDIRECTS } from "@/shared/config/appConfig";
import { Loader2Icon } from "lucide-react";

function getErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred";
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
    if (axiosError.response?.status === 423) {
      return "Your account has been locked due to too many failed login attempts. Please contact an administrator.";
    }
    if (axiosError.response?.status === 401) {
      return "Invalid email or password";
    }
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  if (error instanceof Error) {
    if (error.message === "Network Error") {
      return "Unable to connect to the server. Please try again later.";
    }
    return error.message;
  }
  return "An unexpected error occurred";
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const isLoading = useAuthStore((s) => s.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        const redirectPath = ROLE_DEFAULT_REDIRECTS[currentUser.role] || ROUTE_PATHS.LOGIN;
        router.push(redirectPath);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Enter your credentials to access Smart Clinic</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              autoComplete="email"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2Icon className="animate-spin" />}
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href={ROUTE_PATHS.REGISTER} className="text-primary underline underline-offset-4 hover:text-primary/80">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
