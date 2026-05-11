import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from './notification.api'
import type {
  Notification,
  PaginatedNotifications,
  NotificationQueryParams,
} from '../model/notification.types'

// ─── Query Keys ──────────────────────────────────────────────

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: NotificationQueryParams) => ['notifications', params] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
}

// ─── Query Hooks ─────────────────────────────────────────────

/**
 * Fetches paginated notifications with 30-second polling.
 */
export function useNotifications(params?: NotificationQueryParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => getNotifications(params),
    refetchInterval: 30_000,
  })
}

/**
 * Fetches the unread notification count with 30-second polling.
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  })
}

// ─── Mutation Hooks ──────────────────────────────────────────

/**
 * Marks a single notification as read with optimistic update.
 * - Immediately sets isRead=true in the cache
 * - Decrements unread count optimistically
 * - Rolls back on error
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),

    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      // Snapshot previous state
      const previousLists = queryClient.getQueriesData<PaginatedNotifications>({
        queryKey: notificationKeys.all,
      })
      const previousCount = queryClient.getQueryData<{ count: number }>(notificationKeys.unreadCount)

      // Optimistically update all notification list caches
      queryClient.setQueriesData<PaginatedNotifications>(
        { queryKey: notificationKeys.all },
        (old) => {
          if (!old || !old.content) return old
          return {
            ...old,
            content: old.content.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
          }
        }
      )

      // Optimistically decrement unread count
      if (previousCount) {
        queryClient.setQueryData(notificationKeys.unreadCount, {
          count: Math.max(0, previousCount.count - 1),
        })
      }

      return { previousLists, previousCount }
    },

    onError: (_error, _id, context) => {
      // Rollback caches
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data)
        }
      }
      if (context?.previousCount) {
        queryClient.setQueryData(notificationKeys.unreadCount, context.previousCount)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

/**
 * Marks all notifications as read with optimistic update.
 * - Immediately sets all isRead=true in cache
 * - Resets unread count to 0
 * - Rolls back on error
 */
export function useMarkAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const previousLists = queryClient.getQueriesData<PaginatedNotifications>({
        queryKey: notificationKeys.all,
      })
      const previousCount = queryClient.getQueryData<{ count: number }>(notificationKeys.unreadCount)

      // Optimistically mark all as read
      queryClient.setQueriesData<PaginatedNotifications>(
        { queryKey: notificationKeys.all },
        (old) => {
          if (!old || !old.content) return old
          return {
            ...old,
            content: old.content.map((n) => ({ ...n, isRead: true })),
          }
        }
      )

      // Reset unread count
      queryClient.setQueryData(notificationKeys.unreadCount, { count: 0 })

      return { previousLists, previousCount }
    },

    onError: (_error, _vars, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data)
        }
      }
      if (context?.previousCount) {
        queryClient.setQueryData(notificationKeys.unreadCount, context.previousCount)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
