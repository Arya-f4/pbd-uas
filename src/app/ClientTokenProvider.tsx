'use client'

import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function ClientTokenProvider({ user, children }: { user: any; children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user && pathname !== '/auth/signin') {
      router.push('/auth/signin')
    } else if (user && pathname === '/auth/signin') {
      router.push('/') // Redirect to home or dashboard if user is already logged in
    }
  }, [user, router, pathname])

  if (!user && pathname !== '/auth/signin') {
    return null // Or you could return a loading spinner here
  }

  return <>{children}</>
}