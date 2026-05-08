'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth'
import { ROUTE_PATHS, ROLE_DEFAULT_REDIRECTS } from '@/shared/config/appConfig'
import { LoadingSpinner } from '@/shared/ui/loading-spinner/loading-spinner'

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuthStore()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace(ROUTE_PATHS.LOGIN)
      return
    }
    if (user?.role) {
      router.replace(ROLE_DEFAULT_REDIRECTS[user.role])
    }
  }, [isAuthenticated, user, isLoading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}
