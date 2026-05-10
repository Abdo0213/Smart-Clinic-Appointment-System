import { apiClient } from "@/shared/api/client";
import { API_ROUTES } from "@/shared/api/apiRoutes";
import type {
  Notification,
  PaginatedNotifications,
  NotificationQueryParams,
} from '../model/notification.types';

/**
 * GET /notifications
 * Returns paginated notifications for the current user.
 */
export async function getNotifications(
  params?: NotificationQueryParams
): Promise<PaginatedNotifications> {
  const response = await apiClient.get<PaginatedNotifications>("/notifications", { params });
  return response.data;
}

/**
 * PATCH /notifications/{id}/read
 * Marks a single notification as read.
 */
export async function markNotificationRead(id: string): Promise<Notification> {
  const response = await apiClient.patch<Notification>(`/notifications/${id}/read`);
  return response.data;
}

/**
 * PATCH /notifications/read-all
 * Marks all unread notifications as read.
 */
export async function markAllNotificationsRead(): Promise<{ updatedCount: number }> {
  const response = await apiClient.patch<{ updatedCount: number }>("/notifications/read-all");
  return response.data;
}

/**
 * GET /notifications/unread-count
 * Returns the count of unread notifications.
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  const response = await apiClient.get<{ count: number }>("/notifications/unread-count");
  return response.data;
}
