'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.senha
        })
        if (error) throw error
        if (data?.session) {
          window.location.href = '/dashboard'
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.senha,
          options: { data: { nome: form.nome } }
        })
        if (error) throw error
        setError('✅ Conta criada! Verifique seu e-mail.')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="orb1" />
      <div className="orb2" />
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            margin: '0 auto 16px',
            background: 'rgba(0,255,135,.08)',
            border: '1px solid rgba(0,255,135,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(0,255,135,.2)',
          }}>
            <svg width="34" height="34" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="44" stroke="#00FF87" strokeWidth="5"/>
              <circle cx="50" cy="50" r="11" fill="#00FF87"/>
              <line x1="50" y1="6" x2="50" y2="39" stroke="#00FF87" strokeWidth="5" strokeLinecap="round"/>
              <line x1="50" y1="61" x2="50" y2="94" stroke="#00FF87" strokeWidth="5" strokeLinecap="round"/>
              <line x1="6" y1="50" x2="39" y2="50" stroke="#00FF87" strokeWidth="5" strokeLinecap="round"/>
              <line x1="61" y1="50" x2="94" y2="50" stroke="#00FF87" strokeWidth="5" strokeLinecap="round"/>
              <polyline points="64,31 76,20 88,31" stroke="#00D4FF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <line x1="76" y1="20" x2="76" y2="50" stroke="#00D4FF" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>
            Piloto<span style={{ color: 'var(--accent)' }}>Financeiro</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-3)', marginTop: '6px' }}>
            Gestão financeira para motoristas de app
          </p>
        </div>

        <div className="login-card anim-up">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '24px', letterSpacing: '-.01em' }}>
            {isLogin ? 'Entrar na plataforma' : 'Criar conta grátis'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <div>
                <label className="pf-label">Nome completo</label>
                <input type="text" className="pf-input" required
                  placeholder="Seu nome"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="pf-label">E-mail</label>
              <input type="email" className="pf-input" required
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="pf-label">Senha</label>
              <input type="password" className="pf-input" required
                placeholder="••••••••"
                value={form.senha}
                onChange={e => setForm({ ...form, senha: e.target.value })}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 14px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 500,
                background: error.startsWith('✅') ? 'rgba(0,255,135,.07)' : 'rgba(255,71,87,.07)',
                color: error.startsWith('✅') ? 'var(--accent)' : 'var(--danger)',
                border: `1px solid ${error.startsWith('✅') ? 'rgba(0,255,135,.2)' : 'rgba(255,71,87,.2)'}`,
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '4px', padding: '13px', fontSize: '15px' }}>
              {loading ? 'Aguarde...' : isLogin ? '→ Entrar' : '→ Criar Conta'}
            </button>
          </form>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-3)' }}>
              {isLogin ? 'Não tem conta? Cadastre-se grátis →' : '← Já tem conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
