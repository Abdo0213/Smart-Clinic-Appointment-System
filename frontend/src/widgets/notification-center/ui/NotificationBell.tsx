'use client'

import { BellIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationCenter } from './NotificationCenter'
import { NotificationBadge } from './NotificationBadge'
import { useUnreadCount } from '@/features/notifications'

export function NotificationBell() {
  const { data, isError } = useUnreadCount()
  const count = isError ? 0 : (data?.count ?? 0)

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <BellIcon className="size-5" />
            <NotificationBadge count={count} />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-96 p-0">
        <NotificationCenter />
      </PopoverContent>
    </Popover>
  )
}
