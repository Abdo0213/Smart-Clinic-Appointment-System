'use client'

import { useAuthStore } from '@/features/auth'
import { UserMenu } from './UserMenu'
import { NotificationBell } from '@/widgets/notification-center/ui/NotificationBell'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { StethoscopeIcon, MenuIcon } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
          <MenuIcon className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <Link href="/" className="flex items-center gap-2 font-semibold">
        <StethoscopeIcon className="size-5 text-primary" />
        <span className="hidden sm:inline">Smart Clinic</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        {user && <UserMenu user={user} />}
      </div>
    </header>
  )
}
