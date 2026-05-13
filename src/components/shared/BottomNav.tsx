'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/dashboard',               icon: '◉', label: 'Início'   },
  { href: '/dashboard/corridas',      icon: '🚗', label: 'Corridas' },
  { href: '/dashboard/despesas',      icon: '💳', label: 'Despesas' },
  { href: '/dashboard/fluxo',         icon: '📊', label: 'Fluxo'    },
  { href: '/dashboard/configuracoes', icon: '⚙️', label: 'Config'   },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      <div className="bnav-items">
        {nav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`bnav-item${pathname === item.href ? ' active' : ''}`}
          >
            <span style={{ fontSize: '21px', lineHeight: 1 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
