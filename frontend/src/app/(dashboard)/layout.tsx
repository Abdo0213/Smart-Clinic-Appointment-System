'use client'

import { AuthGuard } from '@/features/auth'
import { Header } from '@/widgets/header'
import { Sidebar } from '@/widgets/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
