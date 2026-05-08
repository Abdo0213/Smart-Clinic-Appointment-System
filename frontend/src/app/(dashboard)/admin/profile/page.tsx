'use client'

import { useAuthStore } from '@/features/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserIcon, MailIcon, ShieldCheckIcon } from 'lucide-react'

export default function AdminProfilePage() {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Profile</h1>
          <p className="text-muted-foreground">Manage your administrative account details</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="size-5 text-primary" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>Your personal and login details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">First Name</p>
                <p className="font-medium">{user.firstName || 'Admin'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                <p className="font-medium">{user.lastName || 'User'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="flex items-center gap-2 font-medium">
                  <MailIcon className="size-4 text-muted-foreground" />
                  {user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5 text-primary" />
              <CardTitle>Role & Permissions</CardTitle>
            </div>
            <CardDescription>Your access level within the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Role</p>
              <Badge className="mt-1 bg-primary px-3 py-1 text-sm uppercase">
                {user.role}
              </Badge>
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">Administrative Access</p>
              <p className="mt-1 text-muted-foreground">
                You have full access to manage users, doctors, patients, and system-wide reports.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
