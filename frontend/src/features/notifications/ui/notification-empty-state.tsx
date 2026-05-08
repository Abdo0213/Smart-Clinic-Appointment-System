'use client'

import { BellOffIcon } from 'lucide-react'

export function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center" role="status">
      <BellOffIcon className="size-8 text-muted-foreground/50" />
      <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
      <p className="text-xs text-muted-foreground/70">
        You&apos;ll see appointment reminders, status updates, and more here.
      </p>
    </div>
  )
}
