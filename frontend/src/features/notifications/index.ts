// Feature barrel — notifications
export type {
  Notification,
  NotificationType,
  PaginatedNotifications,
  NotificationQueryParams,
} from './model/notification.types'

export { notificationSchema, notificationTypeSchema } from './model/notification.schemas'
export { MOCK_NOTIFICATIONS } from './model/notification.mock'

export {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllRead,
  notificationKeys,
} from './api/notification.queries'

export { NotificationItem } from './ui/notification-item'
export { NotificationEmptyState } from './ui/notification-empty-state'
