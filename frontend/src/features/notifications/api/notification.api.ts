/**
 * Notification API — STUBBED
 *
 * ⛔ ALL BACKEND ENDPOINTS ARE MISSING. These functions return mock data
 * and log console.warn to indicate stubbed mode.
 *
 * When backend endpoints become available, replace stub implementations
 * with real HTTP calls using the existing apiClient.
 *
 * See: specs/006-notification/contracts/notification-api.md
 */

import { MOCK_NOTIFICATIONS } from '../model/notification.mock'
import type {
  Notification,
  PaginatedNotifications,
  NotificationQueryParams,
} from '../model/notification.types'

const STUB_TAG = '[STUB] Notification API endpoint not available. Using mock data.'

/** Deep clone to avoid mutation across calls */
let mockStore = structuredClone(MOCK_NOTIFICATIONS)

function delay(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * GET /notifications — ⛔ BLOCKED
 * Returns paginated mock notifications sorted by createdAt descending.
 */
export async function getNotifications(
  params?: NotificationQueryParams
): Promise<PaginatedNotifications> {
  console.warn(STUB_TAG)
  await delay()

  let items = [...mockStore]

  if (params?.unreadOnly) {
    items = items.filter((n) => !n.isRead)
  }

  // Sort by createdAt descending
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const page = params?.page ?? 0
  const size = params?.size ?? 20
  const start = page * size
  const pageItems = items.slice(start, start + size)
  const totalPages = Math.max(1, Math.ceil(items.length / size))

  return {
    content: pageItems,
    totalPages,
    totalElements: items.length,
    size,
    number: page,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: pageItems.length === 0,
  }
}

/**
 * PATCH /notifications/{id}/read — ⛔ BLOCKED
 * Marks a single notification as read in the mock store.
 */
export async function markNotificationRead(id: string): Promise<Notification> {
  console.warn(STUB_TAG)
  await delay()

  const notification = mockStore.find((n) => n.id === id)
  if (!notification) {
    throw new Error(`Notification not found: ${id}`)
  }

  notification.isRead = true
  return { ...notification }
}

/**
 * PATCH /notifications/read-all — ⛔ BLOCKED
 * Marks all unread notifications as read in the mock store.
 */
export async function markAllNotificationsRead(): Promise<{ updatedCount: number }> {
  console.warn(STUB_TAG)
  await delay(200)

  let updatedCount = 0
  for (const notification of mockStore) {
    if (!notification.isRead) {
      notification.isRead = true
      updatedCount++
    }
  }

  return { updatedCount }
}

/**
 * GET /notifications/unread-count — ⛔ BLOCKED
 * Returns the count of unread notifications.
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  console.warn(STUB_TAG)
  await delay(100)

  const count = mockStore.filter((n) => !n.isRead).length
  return { count }
}

/**
 * Resets mock store to initial state — useful for testing.
 */
export function _resetMockStore(): void {
  mockStore = structuredClone(MOCK_NOTIFICATIONS)
}
