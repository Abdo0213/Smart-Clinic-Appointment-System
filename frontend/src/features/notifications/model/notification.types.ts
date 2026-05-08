/**
 * Notification type enum — determines icon and visual style for each notification.
 * See data-model.md for full type mapping.
 */
export type NotificationType =
  | 'APPOINTMENT_REMINDER_24H'
  | 'APPOINTMENT_REMINDER_2H'
  | 'APPOINTMENT_STATUS_CHANGE'
  | 'PRESCRIPTION_READY'
  | 'APPOINTMENT_CANCELLED'

/**
 * Represents a single notification delivered to a user in the Smart Clinic system.
 */
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  metadata?: Record<string, unknown>
}

/**
 * Paginated notification response — matches Spring Boot pageable format.
 */
export interface PaginatedNotifications {
  content: Notification[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

/**
 * Query parameters for fetching notifications.
 */
export interface NotificationQueryParams {
  page?: number
  size?: number
  sort?: string
  unreadOnly?: boolean
}
