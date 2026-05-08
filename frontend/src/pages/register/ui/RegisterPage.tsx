"use client";

import { RegisterForm } from "@/features/auth/ui/RegisterForm";
import { StethoscopeIcon } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <StethoscopeIcon className="size-8 text-primary" />
          <h1 className="text-2xl font-bold">Smart Clinic</h1>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
