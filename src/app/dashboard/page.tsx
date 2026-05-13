'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fmt$, getMonthName } from '@/lib/utils'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    totalCorridas: 0, totalRendas: 0, totalDespesas: 0,
    qtdCorridas: 0, meta: 0, pct: 0, firstName: 'Piloto',
    chartData: [] as any[], catTotals: {} as Record<string, number>
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const now = new Date()
      const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      const [
        { data: corridas },
        { data: rendas },
        { data: despesas },
        { data: profile },
      ] = await Promise.all([
        supabase.from('corridas').select('*').eq('user_id', user.id).gte('data', `${ym}-01`),
        supabase.from('rendas').select('*').eq('user_id', user.id).gte('data', `${ym}-01`),
        supabase.from('despesas').select('*').eq('user_id', user.id).gte('data', `${ym}-01`),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
      ])

      const totalCorridas = (corridas || []).reduce((a: number, c: any) => a + Number(c.valor), 0)
      const totalRendas   = (rendas || []).reduce((a: number, r: any) => a + Number(r.valor), 0)
      const totalDespesas = (despesas || []).reduce((a: number, d: any) => a + Number(d.valor), 0)
      const qtdCorridas   = (corridas || []).reduce((a: number, c: any) => a + (c.quantidade_corridas || 1), 0)
      const meta          = Number(profile?.meta_mensal || 0)
      const pct           = meta > 0 ? Math.min(((totalCorridas + totalRendas) / meta) * 100, 100) : 0
      const firstName     = profile?.nome?.split(' ')[0] || 'Piloto'

      const months6 = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      })

      const [{ data: allCorridas }, { data: allRendas }, { data: allDespesas }] = await Promise.all([
        supabase.from('corridas').select('data,valor').eq('user_id', user.id).gte('data', `${months6[0]}-01`),
        supabase.from('rendas').select('data,valor').eq('user_id', user.id).gte('data', `${months6[0]}-01`),
        supabase.from('despesas').select('data,valor,categoria').eq('user_id', user.id).gte('data', `${months6[0]}-01`),
      ])

      const chartData = months6.map(m => ({
        mes: m.slice(5, 7) + '/' + m.slice(2, 4),
        receitas:
          (allCorridas || []).filter((c: any) => c.data?.startsWith(m)).reduce((a: number, c: any) => a + Number(c.valor), 0) +
          (allRendas || []).filter((r: any) => r.data?.startsWith(m)).reduce((a: number, r: any) => a + Number(r.valor), 0),
        despesas:
          (allDespesas || []).filter((d: any) => d.data?.startsWith(m)).reduce((a: number, d: any) => a + Number(d.valor), 0),
      }))

      const catTotals: Record<string, number> = {}
      ;(despesas || []).forEach((d: any) => {
        catTotals[d.categoria] = (catTotals[d.categoria] || 0) + Number(d.valor)
      })

      setData({ totalCorridas, totalRendas, totalDespesas, qtdCorridas, meta, pct, firstName, chartData, catTotals })
      setLoading(false)
    }
    load()
  }, [supabase, router])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
          <p style={{ color: 'var(--text-3)', fontFamily: 'var(--font-display)', fontSize: '14px' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  const { totalCorridas, totalRendas, totalDespesas, qtdCorridas, meta, pct, firstName, chartData, catTotals } = data
  const saldo = totalCorridas + totalRendas - totalDespesas
  const isPositive = saldo >= 0
  const now = new Date()

  const kpis = [
    { label: 'Total Corridas', value: fmt$(totalCorridas), color: 'var(--accent)',   icon: '🚗', sub: `${qtdCorridas} corridas`,             delay: 'delay-1' },
    { label: 'Rendas Extras',  value: fmt$(totalRendas),   color: 'var(--success)',  icon: '💰', sub: 'este mês',                            delay: 'delay-2' },
    { label: 'Despesas',       value: fmt$(totalDespesas), color: 'var(--danger)',   icon: '💳', sub: 'este mês',                            delay: 'delay-3' },
    { label: 'Ticket Médio',   value: fmt$(qtdCorridas > 0 ? totalCorridas / qtdCorridas : 0), color: 'var(--cyan)', icon: '🎯', sub: 'por corrida', delay: 'delay-4' },
  ]

  return (
    <div className="anim-fade">
      <div className="orb1" style={{ opacity: .4 }} />

      <div className="greeting-banner anim-up" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--text-3)', marginBottom: '6px' }}>
              {getMonthName(now)}
            </p>
            <h1 className="greeting-name">
              Olá, <span style={{ color: 'var(--accent)' }}>{firstName}</span>! 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '6px' }}>
              Aqui está o resumo das suas finanças
            </p>
          </div>
         <div style={{
  padding: '12px 16px', borderRadius: '14px', textAlign: 'center',
  background: isPositive ? 'rgba(0,255,135,.07)' : 'rgba(255,71,87,.07)',
  border: `1px solid ${isPositive ? 'rgba(0,255,135,.18)' : 'rgba(255,71,87,.18)'}`,
  marginTop: '12px', width: '100%',
}}>
  <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-3)', marginBottom: '4px' }}>
    Saldo do Mês
  </p>
  <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: isPositive ? 'var(--accent)' : 'var(--danger)', letterSpacing: '-.02em' }}>
    {fmt$(saldo)}
  </p>
</div>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {kpis.map((k, i) => (
          <div key={i} className={`glass-card kpi-card glow anim-up ${k.delay}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p className="kpi-label">{k.label}</p>
              <span style={{ fontSize: '22px', opacity: .8 }}>{k.icon}</span>
            </div>
            <p className="kpi-value" style={{ color: k.color }}>{k.value}</p>
            <p className="kpi-sub">{k.sub}</p>
          </div>
        ))}
      </div>

      {meta > 0 && (
        <div className="glass-card anim-up delay-2" style={{ padding: '20px 24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>Meta Mensal</p>
            <p style={{ fontSize: '13px', fontWeight: 800, color: pct >= 100 ? 'var(--accent)' : 'var(--text-2)' }}>{pct.toFixed(0)}%</p>
          </div>
          <div className="progress-track">
            <div className={`progress-fill ${pct >= 100 ? 'green' : pct >= 70 ? 'yellow' : 'green'}`} style={{ width: `${pct}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>{fmt$(totalCorridas + totalRendas)} arrecadado</p>
            <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>{pct >= 100 ? '🎉 Meta atingida!' : `faltam ${fmt$(meta - totalCorridas - totalRendas)}`}</p>
          </div>
        </div>
      )}

      <DashboardCharts chartData={chartData} catTotals={catTotals} />
    </div>
  )
}
