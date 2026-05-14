'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  useEffect(() => {
    async function loadTheme() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('configuracoes')
        .select('accent_color')
        .eq('user_id', user.id)
        .single()
      if (data?.accent_color) {
        document.documentElement.style.setProperty('--accent', data.accent_color)
      }
    }
    loadTheme()
  }, [])

  return <>{children}</>
}
