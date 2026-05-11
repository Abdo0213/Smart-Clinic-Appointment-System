'use client'

import { formatDistanceToNow } from 'date-fns'
import {
  ClockIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  PillIcon,
  CheckIcon,
  BellIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Notification } from '../model/notification.types'

// ─── Type-to-style mapping ───────────────────────────────────

const TYPE_CONFIG: Record<
  Notification['type'],
  { icon: typeof ClockIcon; accent: string; bg: string }
> = {
  APPOINTMENT_REMINDER_24H: {
    icon: ClockIcon,
    accent: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  APPOINTMENT_REMINDER_2H: {
    icon: ClockIcon,
    accent: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  APPOINTMENT_STATUS_CHANGE: {
    icon: RefreshCwIcon,
    accent: 'text-teal-500',
    bg: 'bg-teal-500/10',
  },
  PRESCRIPTION_READY: {
    icon: PillIcon,
    accent: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  APPOINTMENT_CANCELLED: {
    icon: AlertTriangleIcon,
    accent: 'text-red-500',
    bg: 'bg-red-500/10',
  },
}

// ─── Component ───────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  isMarkingRead?: boolean
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  isMarkingRead,
}: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.type] || {
    icon: BellIcon,
    accent: 'text-gray-500',
    bg: 'bg-gray-500/10',
  }
  const Icon = config.icon
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
        notification.isRead
          ? 'bg-muted/10 grayscale-[0.8] opacity-60'
          : 'bg-accent/30 font-medium border-l-2 border-primary hover:bg-accent/50'
      }`}
      role="listitem"
      aria-label={`${notification.isRead ? 'Read' : 'Unread'} notification: ${notification.title}`}
      onClick={() => {
        if (!notification.isRead && onMarkAsRead) {
          onMarkAsRead(notification.id)
        }
      }}
    >
      {/* Type icon */}
      <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${notification.isRead ? 'bg-muted' : config.bg}`}>
        <Icon className={`size-4 ${notification.isRead ? 'text-muted-foreground' : config.accent}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-tight ${notification.isRead ? 'font-normal text-slate-500 dark:text-slate-400' : 'font-semibold'}`}>
          {notification.title}
        </p>
        <p className={`mt-0.5 text-xs line-clamp-2 ${notification.isRead ? 'text-slate-500/70 dark:text-slate-400/70' : 'text-muted-foreground'}`}>
          {notification.message}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground/50">{timeAgo}</p>
      </div>

      {/* Mark as read action removed as entire item is now clickable */}
    </div>
  )
}
