# Research: Notification Center

**Feature**: Notification Center
**Branch**: `006-notification`
**Date**: 2026-05-07

## 1. Notification Center UX Patterns

### Common UI Patterns

| Pattern | Description | Examples | Pros | Cons |
|---------|-------------|----------|------|------|
| **Dropdown Panel** | Bell icon in header, click opens a dropdown overlay | GitHub, Gmail, Slack web | Familiar pattern, low implementation cost, minimal screen disruption | Limited space on mobile, hard to show many notifications |
| **Slide-over Drawer** | Panel slides in from the right edge | Linear, Notion | More space for content, supports rich notification details, works well on mobile | Obscures more of the screen, higher implementation cost |
| **Dedicated Page** | Full page at `/notifications` route | Facebook, LinkedIn | Unlimited space, supports pagination/filtering, best for large volumes | Requires navigation away from current context |
| **Hybrid** | Dropdown for quick view + "See all" link to dedicated page | GitHub, Gmail | Best of both worlds — quick access + full view | Two views to maintain, must keep in sync |

### Recommendation for Smart Clinic

**Hybrid approach**: Dropdown panel (triggered by bell icon) for quick notification scanning with a "View all notifications" link to a dedicated `/notifications` page. Rationale:

1. Clinic users need quick access without leaving their current workflow (booking, viewing records)
2. Notification volume is moderate (~100 max) so the dropdown handles most cases
3. A dedicated page supports future features like filtering by type, date range, or search
4. For v1 MVP, implement the dropdown panel only. The dedicated page can be added in a later iteration.

### Notification Item Layout

```text
┌─────────────────────────────────────────────────┐
│ [Icon]  Title                         • Mark Read│
│         Message text truncated to 2 lines...     │
│         2 hours ago                              │
└─────────────────────────────────────────────────┘
```

Key design decisions:
- **Icon**: Determined by `NotificationType` — provides instant visual categorization
- **Bold title for unread**: `font-weight: 600` for unread, `400` for read
- **Subtle background tint**: `bg-muted/50` for unread, `bg-transparent` for read
- **Relative timestamps**: "2 hours ago", "Yesterday", "May 5" (fallback to absolute date after 7 days)
- **Truncation**: Message truncated to 2 lines with `line-clamp-2`
- **Mark read action**: Small button/link on hover or always visible for accessibility

---

## 2. Real-Time Delivery: Polling vs WebSocket vs SSE

### Comparison

| Approach | How It Works | Latency | Complexity | Server Cost | Reliability |
|----------|-------------|---------|------------|-------------|-------------|
| **HTTP Polling** | Client periodically calls GET endpoint | 30s–60s (configurable) | Low | Medium (repeated requests) | High (simple HTTP) |
| **Long Polling** | Client sends request, server holds until data or timeout | Near-real-time (~1s) | Medium | Medium-High | Medium (connection timeouts) |
| **Server-Sent Events (SSE)** | Server pushes events over persistent HTTP connection | Real-time | Medium | Low-Medium | Medium (auto-reconnect needed) |
| **WebSocket** | Full-duplex persistent connection | Real-time | High | Low (once connected) | Medium (connection management) |

### Decision Matrix for Smart Clinic

| Criterion | Polling | SSE | WebSocket |
|-----------|---------|-----|-----------|
| Backend complexity | ✅ Zero new infra | ⚠️ Needs SSE endpoint | ⚠️ Needs WS server |
| Notification volume | ✅ Low volume (≤100/user) | ✅ Suitable | 🔶 Overkill for this volume |
| Real-time requirement | ✅ Near-real-time OK (clinic doesn't need sub-second) | ✅ Real-time | ✅ Real-time |
| v1 Implementation speed | ✅ Fastest (just API call) | ⚠️ Moderate | ❌ Slowest |
| Connection management | ✅ Stateless | ⚠️ Reconnect logic | ❌ Complex reconnection |
| Mobile compatibility | ✅ Works everywhere | ⚠️ Some mobile browser issues | ✅ Works but battery impact |
| Fallback simplicity | ✅ Already HTTP | ⚠️ Falls back to polling | ❌ Must implement polling fallback |

### Recommendation for v1: HTTP Polling

**Rationale**:
1. Backend does not have notification endpoints yet — polling requires zero server-side infrastructure beyond the REST API
2. Notification volume is low; a 30-second polling interval is perfectly acceptable
3. Clinic operations do not require sub-second notification delivery (a 30s delay is tolerable for appointment reminders)
4. Simplest to implement, debug, and maintain
5. Polling is also the natural fallback for SSE/WebSocket, so we're building the fallback first

### Future Migration Path (v2+)

When real-time notifications become a priority:

1. **Phase 1**: Add SSE endpoint to backend (`GET /notifications/stream`)
2. **Phase 2**: Frontend creates an `EventSource` connection; falls back to polling on error
3. **Phase 3**: React Query acts as the polling fallback; SSE pushes invalidate the query cache
4. **WebSocket is not recommended** unless the app needs bidirectional real-time features (chat, live collaboration) — which is out of scope for a clinic system

---

## 3. Badge Count Management

### State Synchronization Strategy

The badge count must stay consistent across these scenarios:

| Scenario | Expected Behavior |
|----------|-------------------|
| Initial page load | Fetch unread count via `GET /notifications/unread-count` |
| User marks notification as read | Optimistic decrement; invalidate count query on success |
| User marks all as read | Optimistic reset to 0; invalidate count query on success |
| New notification arrives (polling) | Next poll cycle fetches updated count |
| Multiple tabs open | Each tab polls independently; React Query refetchOnWindowFocus helps |
| API error on count fetch | Hide badge; show bell without count; retry on next interval |

### React Query Cache Invalidation Strategy

```text
Mutation: markAsRead → onSuccess:
  1. Optimistically update ['notifications'] cache (set isRead=true on item)
  2. Invalidate ['notifications', 'unread-count'] to refetch accurate count

Mutation: markAllRead → onSuccess:
  1. Optimistically update ['notifications'] cache (set isRead=true on ALL items)
  2. Invalidate ['notifications', 'unread-count'] to refetch accurate count

Query: useUnreadCount → refetchInterval: 30000
  - Background refresh every 30 seconds
  - refetchOnWindowFocus: true (default)

Query: useNotifications → refetchInterval: 30000
  - Background refresh every 30 seconds
  - Stale time: 0 (always consider stale, always refetch on mount)
```

### Badge Count Display Rules

```typescript
function formatBadgeCount(count: number): string | null {
  if (count <= 0) return null;      // Hide badge
  if (count > 99) return "99+";     // Cap display
  return String(count);              // Exact number
}
```

### Optimistic Update Pattern

```typescript
useMutation({
  mutationFn: markNotificationRead,
  onMutate: async (notificationId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["notifications"] });
    await queryClient.cancelQueries({ queryKey: ["notifications", "unread-count"] });

    // Snapshot previous values
    const previousNotifications = queryClient.getQueryData(["notifications"]);
    const previousCount = queryClient.getQueryData(["notifications", "unread-count"]);

    // Optimistically update notification list
    queryClient.setQueryData(["notifications"], (old) => ({
      ...old,
      content: old.content.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
    }));

    // Optimistically decrement count
    queryClient.setQueryData(["notifications", "unread-count"], (old) => ({
      ...old,
      count: Math.max(0, old.count - 1),
    }));

    return { previousNotifications, previousCount };
  },
  onError: (_err, _id, context) => {
    // Rollback on error
    queryClient.setQueryData(["notifications"], context.previousNotifications);
    queryClient.setQueryData(["notifications", "unread-count"], context.previousCount);
  },
  onSettled: () => {
    // Always refetch after error or success to ensure consistency
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
  },
});
```

---

## 4. Notification Type Visual Mapping

| NotificationType | Icon Component | Color Token | Urgency | Notes |
|-----------------|---------------|-------------|---------|-------|
| `APPOINTMENT_REMINDER_24H` | `Clock` | `text-blue-500` | Info | Standard reminder, calm appearance |
| `APPOINTMENT_REMINDER_2H` | `Clock` | `text-amber-500` | Warning | Urgent reminder, amber draws attention |
| `APPOINTMENT_STATUS_CHANGE` | `RefreshCw` | `text-teal-500` | Info | Status transition, neutral |
| `PRESCRIPTION_READY` | `Pill` | `text-green-500` | Success | Positive event, green indicates readiness |
| `APPOINTMENT_CANCELLED` | `AlertTriangle` | `text-red-500` | Error | Negative event, red indicates attention needed |

All icons from Lucide React (already included via Shadcn UI).

---

## 5. Accessibility Considerations

| Aspect | Implementation |
|--------|---------------|
| Bell button | `aria-label="Notifications"`, `aria-haspopup="true"`, `aria-expanded` bound to panel state |
| Badge | `aria-label="X unread notifications"`, role="status" for live updates |
| Notification list | `role="list"`, each item `role="listitem"` |
| Mark as read | `aria-label="Mark as read"`, button semantics |
| Panel close | Escape key closes panel, focus returns to bell button |
| Live region | Badge count changes announced via `aria-live="polite"` |
| Keyboard nav | Tab through notifications, Enter/Space on actions |

---

## 6. Performance Considerations

| Concern | Mitigation |
|---------|------------|
| Large notification lists | Paginated API (20 per page), render only visible page |
| Frequent polling | 30s interval is conservative; React Query deduplicates requests across components |
| Optimistic update re-renders | Use `queryClient.setQueryData` which is synchronous and efficient |
| Badge count in header | `useUnreadCount` is a separate lightweight query; does not refetch full notification list |
| Component re-renders | React Query's structural sharing minimizes re-renders when data hasn't changed |

---

## 7. Security Considerations

| Concern | Mitigation |
|---------|------------|
| User can only see own notifications | Backend enforces via JWT; frontend passes `Authorization` header |
| Mark-as-read on others' notifications | Backend returns 403; frontend shows error toast |
| XSS in notification message | React auto-escapes; never use `dangerouslySetInnerHTML` for notification content |
| Polling DDoS | 30s minimum interval; respect `Retry-After` header if implemented |

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Pattern | Hybrid (dropdown + future page) | Best UX for quick access + scalability |
| Delivery Mechanism | HTTP Polling (30s interval) | Simplest, no backend infra needed, sufficient for v1 |
| Real-time Upgrade Path | SSE in v2 | Lightweight, HTTP-based, natural upgrade from polling |
| Badge Count | Separate lightweight query | Avoids refetching full list just for count |
| State Management | React Query (server) + Zustand (UI only) | Follows constitution; no server state in Zustand |
| Optimistic Updates | Yes, with rollback | Essential for responsive mark-as-read UX |
| Stubbing Strategy | Full mock data with console warnings | Enables frontend development while backend is blocked |
