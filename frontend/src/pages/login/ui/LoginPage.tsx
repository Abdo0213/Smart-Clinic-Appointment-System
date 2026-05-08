"use client";

import { LoginForm } from "@/features/auth/ui/LoginForm";
import { StethoscopeIcon } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <StethoscopeIcon className="size-8 text-primary" />
          <h1 className="text-2xl font-bold">Smart Clinic</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
