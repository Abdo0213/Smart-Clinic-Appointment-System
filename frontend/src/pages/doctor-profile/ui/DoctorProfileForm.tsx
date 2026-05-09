"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useUpdateDoctor } from "@/entities/doctor"
import { useUpdateProfile } from "@/features/auth"
import type { Doctor } from "@/entities/doctor"

const phoneRegex = /^(\+?\d{7,15}|\d{10,15})$/

const doctorProfileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  specialization: z
    .string()
    .min(2, "Specialization must be at least 2 characters")
    .max(100, "Specialization must be at most 100 characters"),
  bio: z
    .string()
    .max(2000, "Bio must be at most 2000 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(phoneRegex, "Phone must be a valid format (E.164 or local, e.g. +201234567890 or 01234567890)"),
})

type DoctorProfileFormValues = z.infer<typeof doctorProfileSchema> & { email: string }

interface DoctorProfileFormProps {
  doctor: Doctor
  email?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function DoctorProfileForm({ doctor, email: initialEmail, onSuccess, onCancel }: DoctorProfileFormProps) {
  const updateDoctor = useUpdateDoctor()
  const updateProfile = useUpdateProfile()

  const form = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: initialEmail || "",
      specialization: doctor.specialization,
      bio: doctor.bio || "",
      phone: doctor.phone,
    },
  })

  async function onSubmit(values: DoctorProfileFormValues) {
    try {
      // 1. Update Auth Profile (firstName, lastName, email)
      await updateProfile.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
      })

      // 2. Update Doctor Profile (specialization, bio, phone, names for local cache)
      await updateDoctor.mutateAsync(
        {
          id: doctor.id,
          data: {
            userId: doctor.userId,
            firstName: values.firstName,
            lastName: values.lastName,
            specialization: values.specialization,
            bio: values.bio,
            phone: values.phone,
          }
        }
      )

      onSuccess?.()
    } catch (error) {
      // Errors are handled by mutations via toast
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Cardiology" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+201234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Write a short professional bio..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={updateDoctor.isPending} className="flex-1">
            {updateDoctor.isPending ? "Saving..." : "Save Changes"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
