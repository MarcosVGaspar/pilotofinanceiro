import React from 'react'
import Sidebar from '@/components/shared/Sidebar'
import BottomNav from '@/components/shared/BottomNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar userName="Piloto" />
      <main className="main-content" style={{ flex: 1, minHeight: '100vh', paddingBottom: '80px' }}>
        <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
