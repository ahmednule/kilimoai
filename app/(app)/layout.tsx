'use client'

import { AppSidebar } from '@/components/shared/AppSidebar'
import { FabButton } from '@/components/chatbot/FabButton'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-dark-base">
      <AppSidebar />
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        {children}
      </main>
      <FabButton />
    </div>
  )
}