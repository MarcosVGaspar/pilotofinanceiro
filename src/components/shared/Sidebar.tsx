'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from './ThemeToggle'

const nav = [
  { href: '/dashboard',                icon: '◉',  label: 'Dashboard'      },
  { href: '/dashboard/corridas',       icon: '🚗', label: 'Corridas'       },
  { href: '/dashboard/rendas',         icon: '💰', label: 'Rendas'         },
  { href: '/dashboard/despesas',       icon: '💳', label: 'Despesas'       },
  { href: '/dashboard/meta',           icon: '🎯', label: 'Meta Diária'    },
  { href: '/dashboard/veiculo',        icon: '⛽', label: 'Veículo'        },
  { href: '/dashboard/fluxo',          icon: '📊', label: 'Fluxo de Caixa' },
  { href: '/dashboard/tutorial',       icon: '📖', label: 'Tutorial'       },
  { href: '/dashboard/configuracoes',  icon: '⚙️', label: 'Configurações'  },
]


export default function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="sidebar">
      <div style={{ padding: '22px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(0,255,135,.1)', border: '1px solid rgba(0,255,135,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0,255,135,.15)',
          }}>
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="44" stroke="#00FF87" strokeWidth="6"/>
              <circle cx="50" cy="50" r="11" fill="#00FF87"/>
              <line x1="50" y1="6" x2="50" y2="39" stroke="#00FF87" strokeWidth="5.5" strokeLinecap="round"/>
              <line x1="50" y1="61" x2="50" y2="94" stroke="#00FF87" strokeWidth="5.5" strokeLinecap="round"/>
              <line x1="6" y1="50" x2="39" y2="50" stroke="#00FF87" strokeWidth="5.5" strokeLinecap="round"/>
              <line x1="61" y1="50" x2="94" y2="50" stroke="#00FF87" strokeWidth="5.5" strokeLinecap="round"/>
              <polyline points="64,31 76,20 88,31" stroke="#00D4FF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <line x1="76" y1="20" x2="76" y2="50" stroke="#00D4FF" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.01em' }}>
              Piloto<span style={{ color: 'var(--accent)' }}>Financeiro</span>
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
              {userName}
            </p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {nav.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`nav-link${active ? ' active' : ''}`}>
              <span style={{ fontSize: '17px', lineHeight: 1 }}>{item.icon}</span>
              <span>{item.label}</span>
              {active && <span className="nav-dot" />}
            </Link>
          )
        })}
      </nav>

           <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 13px', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 500 }}>Tema</span>
          <ThemeToggle />
        </div>
        <button onClick={signOut}
          className="nav-link"
          style={{ width: '100%', color: 'var(--danger)', background: 'none', border: 'none' }}>
          <span style={{ fontSize: '17px' }}>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
