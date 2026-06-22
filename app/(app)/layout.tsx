'use client'

import { AppSidebar } from '@/components/shared/AppSidebar'
import { FabButton } from '@/components/chatbot/FabButton'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-dark-base">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <FabButton />
    </div>
  )
}