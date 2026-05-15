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
  const [modoBruto, setModoBruto] = useState(true)
  const [firstName, setFirstName] = useState('Piloto')
  const [totalCorridas, setTotalCorridas] = useState(0)
  const [totalRendas, setTotalRendas] = useState(0)
  const [totalDespesas, setTotalDespesas] = useState(0)
  const [totalOperacional, setTotalOperacional] = useState(0)
  const [qtdCorridas, setQtdCorridas] = useState(0)
  const [metaBruta, setMetaBruta] = useState(0)
  const [metaLiquida, setMetaLiquida] = useState(0)
  const [chartData, setChartData] = useState<any[]>([])
  const [catTotals, setCatTotals] = useState<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const now = new Date()
      const ym = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')

      const [c, r, d, p, cfg, ab, mn] = await Promise.all([
        supabase.from('corridas').select('*').eq('user_id', user.id).gte('data', ym + '-01'),
        supabase.from('rendas').select('*').eq('user_id', user.id).gte('data', ym + '-01'),
        supabase.from('despesas').select('*').eq('user_id', user.id).gte('data', ym + '-01'),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('configuracoes').select('*').eq('user_id', user.id).single(),
        supabase.from('abastecimentos').select('*').eq('user_id', user.id).gte('data', ym + '-01'),
        supabase.from('manutencoes').select('*').eq('user_id', user.id).gte('data', ym + '-01'),
      ])

      const corridas      = c.data   || []
      const rendas        = r.data   || []
      const despesas      = d.data   || []
      const profile       = p.data
      const config        = cfg.data
      const abastecimentos = ab.data || []
      const manutencoes   = mn.data  || []

      const tc = corridas.reduce((a: number, x: any) => a + Number(x.valor), 0)
      const tr = rendas.reduce((a: number, x: any) => a + Number(x.valor), 0)
      const td = despesas.reduce((a: number, x: any) => a + Number(x.valor), 0)
             + abastecimentos.reduce((a: number, x: any) => a + Number(x.valor_total || 0), 0)
             + manutencoes.reduce((a: number, x: any) => a + Number(x.valor || 0), 0)
      const qc = corridas.reduce((a: number, x: any) => a + (x.quantidade_corridas || 1), 0)

      const tOp = despesas
        .filter((x: any) => x.operacional)
        .reduce((a: number, x: any) => a + Number(x.valor), 0)
        + abastecimentos.reduce((a: number, x: any) => a + Number(x.valor_total || 0), 0)
        + manutencoes.reduce((a: number, x: any) => a + Number(x.valor || 0), 0)

      // Meta: usa meta_bruta_sugerida do config, fallback para meta_mensal do profile
      const mBruta  = Number(config?.meta_bruta_sugerida || profile?.meta_mensal || 0)
      const mLiq    = Number(config?.meta_liquida || 0)

      setTotalCorridas(tc)
      setTotalRendas(tr)
      setTotalDespesas(td)
      setTotalOperacional(tOp)
      setQtdCorridas(qc)
      setMetaBruta(mBruta)
      setMetaLiquida(mLiq)
      setFirstName(profile?.nome?.split(' ')[0] || 'Piloto')

      // Gráfico 6 meses
      const months6 = Array.from({ length: 6 }, (_, i) => {
        const dt = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0')
      })
      const [a1, a2, a3] = await Promise.all([
        supabase.from('corridas').select('data,valor').eq('user_id', user.id).gte('data', months6[0] + '-01'),
        supabase.from('rendas').select('data,valor').eq('user_id', user.id).gte('data', months6[0] + '-01'),
        supabase.from('despesas').select('data,valor,categoria').eq('user_id', user.id).gte('data', months6[0] + '-01'),
      ])
      const cd = months6.map(mo => ({
        mes: mo.slice(5, 7) + '/' + mo.slice(2, 4),
        receitas:
          (a1.data || []).filter((x: any) => x.data?.startsWith(mo)).reduce((a: number, x: any) => a + Number(x.valor), 0) +
          (a2.data || []).filter((x: any) => x.data?.startsWith(mo)).reduce((a: number, x: any) => a + Number(x.valor), 0),
        despesas:
          (a3.data || []).filter((x: any) => x.data?.startsWith(mo)).reduce((a: number, x: any) => a + Number(x.valor), 0),
      }))
      const ct: Record<string, number> = {}
      despesas.forEach((x: any) => { ct[x.categoria] = (ct[x.categoria] || 0) + Number(x.valor) })

      setChartData(cd)
      setCatTotals(ct)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
        <p style={{ color: 'var(--text-3)', fontFamily: 'var(--font-display)', fontSize: '14px' }}>Carregando...</p>
      </div>
    </div>
  )

  const now = new Date()
    const faturamentoBruto = totalCorridas + totalRendas
  const lucroLiquido     = faturamentoBruto - totalOperacional

  // Bruto = tudo que entrou | Líquido = tudo que entrou menos operacional
  const progressoExibido = modoBruto ? faturamentoBruto : lucroLiquido
  const saldoExibido     = modoBruto ? faturamentoBruto - totalDespesas : lucroLiquido
  const metaExibida      = modoBruto ? metaBruta : metaLiquida
  const pct              = metaExibida > 0 ? Math.min((progressoExibido / metaExibida) * 100, 100) : 0
  const isPositive       = saldoExibido >= 0

  const kpis = modoBruto ? [
    { label: 'Total Corridas',  value: fmt$(totalCorridas), color: 'var(--accent)',  icon: '🚗', sub: qtdCorridas + ' corridas' },
    { label: 'Rendas Extras',   value: fmt$(totalRendas),   color: 'var(--success)', icon: '💰', sub: 'este mês' },
    { label: 'Despesas Totais', value: fmt$(totalDespesas), color: 'var(--danger)',  icon: '💳', sub: 'este mês' },
    { label: 'Ticket Médio',    value: fmt$(qtdCorridas > 0 ? totalCorridas / qtdCorridas : 0), color: 'var(--cyan)', icon: '🎯', sub: 'por corrida' },
  ] : [
    { label: 'Faturamento',   value: fmt$(faturamentoBruto), color: 'var(--accent)',  icon: '🚗', sub: 'bruto total' },
    { label: 'Custo Op.',     value: fmt$(totalOperacional), color: 'var(--danger)',  icon: '⚙️', sub: 'operacional' },
    { label: 'Lucro Líquido', value: fmt$(lucroLiquido),     color: lucroLiquido >= 0 ? 'var(--success)' : 'var(--danger)', icon: '💚', sub: 'no bolso' },
    { label: 'Margem', value: faturamentoBruto > 0 ? ((lucroLiquido / faturamentoBruto) * 100).toFixed(1) + '%' : '0%', color: 'var(--cyan)', icon: '📊', sub: 'de lucro' },
  ]

  return (
    <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
      {/* Banner de saudação */}
      <div className="greeting-banner anim-up" style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--text-3)', marginBottom: '6px' }}>
          {getMonthName(now)}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>
          Olá, <span style={{ color: 'var(--accent)' }}>{firstName}</span>! 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '4px', marginBottom: '14px' }}>
          Aqui está o resumo das suas finanças
        </p>

        {/* Toggle Bruto / Líquido */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button onClick={() => setModoBruto(true)} style={{
            flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', border: '1px solid', transition: 'all .2s',
            background: modoBruto ? 'rgba(var(--accent-rgb),.1)' : 'transparent',
            borderColor: modoBruto ? 'rgba(var(--accent-rgb),.3)' : 'rgba(255,255,255,.1)',
            color: modoBruto ? 'var(--accent)' : 'var(--text-3)',
          }}>📊 Bruto</button>
          <button onClick={() => setModoBruto(false)} style={{
            flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', border: '1px solid', transition: 'all .2s',
            background: !modoBruto ? 'rgba(0,230,118,.1)' : 'transparent',
            borderColor: !modoBruto ? 'rgba(0,230,118,.3)' : 'rgba(255,255,255,.1)',
            color: !modoBruto ? 'var(--success)' : 'var(--text-3)',
          }}>💚 Líquido</button>
        </div>

        {/* Saldo do mês */}
        <div style={{
          padding: '14px 16px', borderRadius: '12px', textAlign: 'center',
          background: isPositive ? 'rgba(var(--accent-rgb),.07)' : 'rgba(255,71,87,.07)',
          border: '1px solid ' + (isPositive ? 'rgba(var(--accent-rgb),.18)' : 'rgba(255,71,87,.18)'),
        }}>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-3)', marginBottom: '4px' }}>
            {modoBruto ? 'Saldo Bruto do Mês' : 'Lucro Líquido do Mês'}
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 800, color: isPositive ? 'var(--accent)' : 'var(--danger)', letterSpacing: '-.02em' }}>
            {fmt$(saldoExibido)}
          </p>
          {!modoBruto && metaLiquida > 0 && (
            <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>
              Meta líquida: {fmt$(metaLiquida)}
            </p>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {kpis.map((k, i) => (
          <div key={i} className="glass-card glow" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)' }}>{k.label}</p>
              <span style={{ fontSize: '16px' }}>{k.icon}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800, color: k.color, letterSpacing: '-.02em', lineHeight: 1, margin: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {k.value}
            </p>
            <p style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '2px' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Barra de meta */}
      {metaExibida > 0 && (
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>
              {modoBruto ? 'Meta Bruta Mensal' : 'Meta Líquida Mensal'}
            </p>
            <p style={{ fontSize: '13px', fontWeight: 800, color: pct >= 100 ? 'var(--accent)' : 'var(--text-2)' }}>{pct.toFixed(0)}%</p>
          </div>
          <div className="progress-track">
            <div className={'progress-fill ' + (pct >= 100 ? 'green' : pct >= 70 ? 'yellow' : 'green')} style={{ width: pct + '%' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>{fmt$(progressoExibido)}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>
              {pct >= 100 ? '🎉 Meta atingida!' : fmt$(metaExibida - progressoExibido) + ' restante'}
            </p>
          </div>
        </div>
      )}

      <DashboardCharts chartData={chartData} catTotals={catTotals} />
    </div>
  )
}
