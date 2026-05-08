"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/model/authStore";
import { registerSchema, type RegisterFormData } from "@/features/auth/model/schemas";
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
    if (axiosError.response?.status === 409) {
      return "A user with this email already exists";
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

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const isLoading = useAuthStore((s) => s.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _confirmPassword, ...registerData } = data;
      await registerUser(registerData);
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
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Register to start using Smart Clinic</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Jane"
                autoComplete="given-name"
                {...register("firstName")}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                autoComplete="family-name"
                {...register("lastName")}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="jane@example.com"
              autoComplete="email"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2Icon className="animate-spin" />}
            Create Account
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={ROUTE_PATHS.LOGIN} className="text-primary underline underline-offset-4 hover:text-primary/80">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
