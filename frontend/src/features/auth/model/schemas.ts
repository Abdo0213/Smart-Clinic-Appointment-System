import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email must not exceed 254 characters"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name must not exceed 100 characters"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(100, "Last name must not exceed 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .max(254, "Email must not exceed 254 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/\S/, "Password must contain at least one non-space character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const createUserBaseSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must not exceed 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must not exceed 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email must not exceed 254 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/\S/, "Password must contain at least one non-space character"),
  role: z.enum(["Patient", "Doctor", "Receptionist", "Admin"], {
    message: "Role is required",
  }),
  specialization: z.string().optional(),
});

export const createUserSchema = createUserBaseSchema.refine(
  (data) =>
    data.role !== "Doctor" ||
    (data.specialization && data.specialization.trim().length > 0),
  {
    message: "Specialization is required for Doctor role",
    path: ["specialization"],
  }
);

export type CreateUserData = z.infer<typeof createUserSchema>;
