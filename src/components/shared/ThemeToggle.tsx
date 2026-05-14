'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ThemeToggle() {
  const supabase = createClient()
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('pf-theme') || 'dark'
    setIsDark(saved === 'dark')
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  async function toggle() {
    const newTheme = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    localStorage.setItem('pf-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)

    // Salvar no Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('configuracoes').update({ tema: newTheme }).eq('user_id', user.id)
      }
    } catch {}
  }

  return (
    <button onClick={toggle}
      style={{
        width: '48px', height: '26px', borderRadius: '99px', cursor: 'pointer',
        border: '1px solid var(--border-md)', position: 'relative',
        background: isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,180,90,.15)',
        transition: 'all .3s ease', flexShrink: 0,
      }}>
      <div style={{
        position: 'absolute', top: '3px',
        left: isDark ? '3px' : '23px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: isDark ? '#6B82A8' : 'var(--accent)',
        transition: 'left .3s cubic-bezier(.4,0,.2,1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px',
      }}>
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  )
}
