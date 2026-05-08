'use client'

import { toast } from 'sonner'
import { Loader2Icon, CheckCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllRead,
  useUnreadCount,
  NotificationItem,
  NotificationEmptyState,
} from '@/features/notifications'

export function NotificationCenter() {
  const { data, isLoading, isError } = useNotifications()
  const { data: unreadData } = useUnreadCount()
  const markAsRead = useMarkAsRead()
  const markAllRead = useMarkAllRead()

  const notifications = data?.content ?? []
  const unreadCount = unreadData?.count ?? 0

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id, {
      onError: () => toast.error('Failed to mark notification as read'),
    })
  }

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => toast.success('All notifications marked as read'),
      onError: () => toast.error('Failed to mark all notifications as read'),
    })
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <p className="text-sm text-destructive">Failed to load notifications</p>
        <p className="text-xs text-muted-foreground">Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
          >
            {markAllRead.isPending ? (
              <Loader2Icon className="mr-1 size-3 animate-spin" />
            ) : (
              <CheckCheckIcon className="mr-1 size-3" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      <Separator />

      {/* Dev-mode stub indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-amber-500/10 px-4 py-1.5 text-center text-[10px] text-amber-600 dark:text-amber-400">
          ⛔ Using stubbed notification data — backend endpoints not available
        </div>
      )}

      {/* Notification list */}
      {notifications.length === 0 ? (
        <NotificationEmptyState />
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div role="list" aria-label="Notifications">
            {notifications.map((notification) => (
              <div key={notification.id}>
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  isMarkingRead={markAsRead.isPending}
                />
                <Separator />
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
