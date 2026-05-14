import React from 'react'
import Sidebar from '@/components/shared/Sidebar'
import BottomNav from '@/components/shared/BottomNav'
import ThemeInitializer from '@/components/shared/ThemeInitializer'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
    <>
    <ThemeInitializer />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar userName="Piloto" />
        <main className="main-content" style={{
          flex: 1,
          minHeight: '100vh',
          paddingBottom: '80px',
          minWidth: 0,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px',
            maxWidth: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}>
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
        </>
  )
}
