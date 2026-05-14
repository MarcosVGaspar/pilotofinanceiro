'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'


const nav = [
  { href: '/dashboard',               icon: '◉', label: 'Início'   },
  { href: '/dashboard/corridas',      icon: '🚗', label: 'Corridas' },
  { href: '/dashboard/meta',          icon: '🎯', label: 'Meta'     },
  { href: '/dashboard/despesas',      icon: '💳', label: 'Despesas' },
  { href: '/dashboard/mais',          icon: '☰',  label: 'Mais'     },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
       <nav className="bottom-nav">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 16px 0', borderBottom: '1px solid var(--border)' }}>
        <ThemeToggle />
      </div>
      <div className="bnav-items">
        {nav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`bnav-item${pathname === item.href || (item.href === '/dashboard/mais' && ['/dashboard/veiculo','/dashboard/fluxo','/dashboard/configuracoes'].includes(pathname)) ? ' active' : ''}`}
          >
            <span style={{ fontSize: '21px', lineHeight: 1 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
