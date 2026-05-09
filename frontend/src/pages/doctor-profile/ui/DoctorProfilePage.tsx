"use client"

import { useState } from "react"
import { useAuthStore } from "@/features/auth"
import { useGetDoctor, DoctorStatusBadge } from "@/entities/doctor"
import { LoadingSpinner } from "@/shared/ui/loading-spinner/loading-spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PencilIcon, StethoscopeIcon, PhoneIcon, UserIcon, CalendarIcon, LockIcon } from "lucide-react"
import { DoctorProfileForm } from "./DoctorProfileForm"
import { ChangePasswordForm } from "@/features/auth/ui/ChangePasswordForm"
import { formatDate } from "@/shared/lib/formatDate"

interface DoctorProfilePageProps {
  /** If provided, view another doctor's profile (admin view). Otherwise views own profile. */
  doctorId?: string
}

export default function DoctorProfilePage({ doctorId: externalDoctorId }: DoctorProfilePageProps) {
  const user = useAuthStore((s) => s.user)
  const doctorId = externalDoctorId || user?.doctorId || ""
  const isOwnProfile = !externalDoctorId || externalDoctorId === user?.doctorId

  const { data: doctor, isLoading, isError } = useGetDoctor(doctorId)
  const [isEditOpen, setIsEditOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError || !doctor) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <StethoscopeIcon className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-destructive">Profile Not Found</h2>
        <p className="text-muted-foreground">
          The requested doctor profile could not be found or you don&apos;t have access.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isOwnProfile ? "My Profile" : `Dr. ${doctor.firstName} ${doctor.lastName}`}
          </h1>
          <p className="text-muted-foreground">
            {isOwnProfile ? "View and manage your professional profile" : "Doctor profile details"}
          </p>
        </div>
        {isOwnProfile && (
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger
              render={(props) => (
                <Button variant="outline" {...props}>
                  <PencilIcon className="mr-2 size-4" />
                  Edit Profile
                </Button>
              )}
            />
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <DoctorProfileForm
                doctor={doctor}
                email={user?.email}
                onSuccess={() => setIsEditOpen(false)}
                onCancel={() => setIsEditOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="size-5 text-primary" />
              <CardTitle>Personal Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">First Name</p>
                <p className="font-medium">{doctor.firstName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                <p className="font-medium">{doctor.lastName}</p>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="flex items-center gap-1">
                    <PhoneIcon className="size-3 text-muted-foreground" />
                    {doctor.phone}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <DoctorStatusBadge isActive={doctor.isActive} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <StethoscopeIcon className="size-5 text-primary" />
              <CardTitle>Professional Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Specialization</p>
              <Badge variant="secondary" className="mt-1 text-sm">
                {doctor.specialization}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bio</p>
              <p className="mt-1 text-sm leading-relaxed">
                {doctor.bio || "No bio provided."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Member since {formatDate(doctor.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Security / Password Change */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LockIcon className="size-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="max-w-md">
            <p className="text-sm text-muted-foreground mb-4">
              Keep your account secure by using a strong password.
            </p>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
