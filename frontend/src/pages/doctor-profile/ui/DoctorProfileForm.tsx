"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useUpdateDoctor } from "@/entities/doctor"
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
import type { Doctor } from "@/entities/doctor"

const phoneRegex = /^(\+?\d{7,15}|\d{10,15})$/

const doctorProfileSchema = z.object({
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

type DoctorProfileFormValues = z.infer<typeof doctorProfileSchema>

interface DoctorProfileFormProps {
  doctor: Doctor
  onSuccess?: () => void
  onCancel?: () => void
}

export function DoctorProfileForm({ doctor, onSuccess, onCancel }: DoctorProfileFormProps) {
  const updateDoctor = useUpdateDoctor()

  const form = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      specialization: doctor.specialization,
      bio: doctor.bio || "",
      phone: doctor.phone,
    },
  })

  function onSubmit(values: DoctorProfileFormValues) {
    updateDoctor.mutate(
      { id: doctor.id, data: values },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully")
          onSuccess?.()
        },
        onError: (error: unknown) => {
          const message =
            error && typeof error === "object" && "response" in error
              ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
              : undefined
          toast.error(message || "Failed to update profile")
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
