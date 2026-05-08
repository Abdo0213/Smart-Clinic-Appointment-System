import { create } from 'zustand'

interface NotificationCenterState {
  isPanelOpen: boolean
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
}

export const useNotificationCenterStore = create<NotificationCenterState>((set) => ({
  isPanelOpen: false,
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
}))
