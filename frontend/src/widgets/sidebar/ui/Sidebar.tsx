'use client'

import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/features/auth'
import { ROLE_SIDEBAR_ITEMS } from '@/shared/config/appConfig'
import type { SidebarItem } from '@/shared/config/appConfig'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, User, Calendar, Clock, Users, UserCheck, Receipt, UserCog, Stethoscope, BarChart3, FileText } from 'lucide-react'
import Link from 'next/link'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  User,
  Calendar,
  Clock,
  Users,
  UserCheck,
  Receipt,
  UserCog,
  Stethoscope,
  BarChart3,
  FileText,
}

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  const items: SidebarItem[] = ROLE_SIDEBAR_ITEMS[user.role] ?? []

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-background">
      <div className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
        <Stethoscope className="size-5 text-primary" />
        <span className="font-semibold">Smart Clinic</span>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const Icon = iconMap[item.icon] ?? LayoutDashboard
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start gap-2', isActive && 'bg-accent font-medium')}
              onClick={() => {}}
              render={<Link href={item.href} />}
            >
              <Icon className="size-4" />
              {item.label}
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
