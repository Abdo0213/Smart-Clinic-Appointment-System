'use client'

interface NotificationBadgeProps {
  count: number
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count <= 0) return null

  const display = count > 99 ? '99+' : String(count)

  return (
    <span
      className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 py-0.5 text-[10px] font-bold leading-none text-destructive-foreground"
      aria-label={`${count} unread notifications`}
    >
      {display}
    </span>
  )
}
