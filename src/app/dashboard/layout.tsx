import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/shared/Sidebar'
import BottomNav from '@/components/shared/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nome')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar userName={profile?.nome || 'Piloto'} />
      <main className="main-content" style={{ flex: 1, minHeight: '100vh', paddingBottom: '80px' }}>
        <div style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
