'use client'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const items = [
  { href: '/dashboard/rendas',        icon: '💰', label: 'Rendas',        sub: 'Salários e receitas extras' },
  { href: '/dashboard/veiculo',       icon: '⛽', label: 'Veículo',        sub: 'Abastecimentos e manutenções' },
  { href: '/dashboard/fluxo',         icon: '📊', label: 'Fluxo de Caixa', sub: 'Extrato e calendário' },
  { href: '/dashboard/configuracoes', icon: '⚙️', label: 'Configurações',  sub: 'Perfil, metas e combustível' },
]


export default function MaisPage() {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="anim-fade">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em', marginBottom: '4px' }}>
        Mais
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '24px' }}>
        Outras funcionalidades
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map(item => (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
              <span style={{ fontSize: '32px' }}>{item.icon}</span>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>{item.label}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '3px' }}>{item.sub}</p>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: '20px' }}>›</span>
            </div>
          </Link>
        ))}

        <div style={{ marginTop: '8px' }}>
          <button onClick={signOut}
            className="btn-danger"
            style={{ width: '100%', padding: '14px', justifyContent: 'center', fontSize: '14px' }}>
            🚪 Sair da conta
          </button>
        </div>
      </div>
    </div>
  )
}
