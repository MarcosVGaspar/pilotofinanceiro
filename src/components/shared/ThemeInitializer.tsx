'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

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
        }
      } catch {}
    }
    init()
  }, [])

  return null
}
