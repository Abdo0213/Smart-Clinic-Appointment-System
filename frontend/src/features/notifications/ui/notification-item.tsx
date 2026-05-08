'use client'

import { formatDistanceToNow } from 'date-fns'
import {
  ClockIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  PillIcon,
  CheckIcon,
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
  const config = TYPE_CONFIG[notification.type]
  const Icon = config.icon
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors ${
        notification.isRead
          ? 'bg-transparent opacity-70'
          : 'bg-accent/30 font-medium'
      }`}
      role="listitem"
      aria-label={`${notification.isRead ? 'Read' : 'Unread'} notification: ${notification.title}`}
    >
      {/* Type icon */}
      <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
        <Icon className={`size-4 ${config.accent}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-tight ${notification.isRead ? 'font-normal' : 'font-semibold'}`}>
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground/70">{timeAgo}</p>
      </div>

      {/* Mark as read action — only on unread */}
      {!notification.isRead && onMarkAsRead && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onMarkAsRead(notification.id)
          }}
          disabled={isMarkingRead}
          aria-label="Mark as read"
        >
          <CheckIcon className="size-3.5" />
        </Button>
      )}
    </div>
  )
}
