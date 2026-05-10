'use client'

import { useAuthStore } from '@/features/auth'
import { LogoutButton } from '@/features/auth/ui/LogoutButton'
import type { AuthUser } from '@/features/auth/model/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { UserIcon, SettingsIcon } from 'lucide-react'
import Link from 'next/link'
import { ROUTE_PATHS } from '@/shared/config/appConfig'

interface UserMenuProps {
  user: AuthUser
}

export function UserMenu({ user }: UserMenuProps) {
  const role = user.role

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1.5 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">
          {user.firstName} {user.lastName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link 
            href={
              role === 'Patient' ? ROUTE_PATHS.PATIENT_PROFILE : 
              role === 'Doctor' ? ROUTE_PATHS.DOCTOR_PROFILE : 
              role === 'Admin' ? ROUTE_PATHS.ADMIN_PROFILE :
              role === 'Receptionist' ? ROUTE_PATHS.RECEPTION_PROFILE :
              "/"
            } 
            className="flex cursor-pointer items-center gap-2"
          >
            <UserIcon className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link 
            href={
              role === 'Patient' ? ROUTE_PATHS.PATIENT_PROFILE : 
              role === 'Doctor' ? ROUTE_PATHS.DOCTOR_PROFILE : 
              role === 'Admin' ? ROUTE_PATHS.ADMIN_PROFILE :
              role === 'Receptionist' ? ROUTE_PATHS.RECEPTION_PROFILE :
              "/"
            } 
            className="flex cursor-pointer items-center gap-2"
          >
            <SettingsIcon className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
