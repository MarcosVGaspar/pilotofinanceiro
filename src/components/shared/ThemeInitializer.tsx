'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function hexToRgb(hex: string): string | null {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return `${r},${g},${b}`
}

export default function ThemeInitializer() {
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      // Primeiro aplica o tema salvo no localStorage (instantâneo)
      const local = localStorage.getItem('pf-theme')
      if (local) document.documentElement.setAttribute('data-theme', local)

      // Depois busca do Supabase (sincroniza entre dispositivos)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('configuracoes')
          .select('tema, accent_color')
          .eq('user_id', user.id)
          .single()
        if (data?.tema) {
          document.documentElement.setAttribute('data-theme', data.tema)
          localStorage.setItem('pf-theme', data.tema)
        }
                        if (data?.accent_color) {
          document.documentElement.style.setProperty('--accent', data.accent_color)
          const rgb = hexToRgb(data.accent_color)
          if (rgb) document.documentElement.style.setProperty('--accent-rgb', rgb)
        }


      } catch {}
    }
    init()
  }, [])

  return null
}
