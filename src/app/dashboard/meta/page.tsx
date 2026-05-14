'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fmt$ } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function MetaPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState(0)
  const [rendaFixa, setRendaFixa] = useState(0)
  const [metaDiaria, setMetaDiaria] = useState(0)
  const [metaDiariaAjustada, setMetaDiariaAjustada] = useState(0)
  const [totalCorridas, setTotalCorridas] = useState(0)
  const [diasPassados, setDiasPassados] = useState(0)
  const [diasRestantes, setDiasRestantes] = useState(0)
  const [faltaMes, setFaltaMes] = useState(0)
  const [dias, setDias] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const now = new Date()
      const ano = now.getFullYear()
      const mes = now.getMonth() + 1
      const ym = `${ano}-${String(mes).padStart(2, '0')}`
      const diasNoMes = new Date(ano, mes, 0).getDate()
      const diaAtual = now.getDate()

      const [{ data: config }, { data: corridas }] = await Promise.all([
        supabase.from('configuracoes').select('*').eq('user_id', user.id).single(),
        supabase.from('corridas').select('data,valor').eq('user_id', user.id).gte('data', `${ym}-01`),
      ])

      const metaMensal = Number(config?.meta_mensal || profile?.meta_mensal || 0)
const rendaF = Number(config?.renda_fixa_mensal || 0)
      const rendaF = Number(config?.renda_fixa_mensal || 0)
      const metaCorridasMes = rendaF > 0 ? metaMensal - rendaF : metaMensal
      const metaDiariaBase = metaCorridasMes > 0 ? metaCorridasMes / diasNoMes : 0

      // Total ganho até hoje
      const totalGanho = (corridas || []).reduce((a: number, c: any) => a + Number(c.valor), 0)

      // Meta esperada até hoje
      const metaEsperadaAteHoje = metaDiariaBase * diaAtual

      // Falta para o mês
      const falta = Math.max(metaCorridasMes - totalGanho, 0)

      // Meta diária ajustada para os dias restantes
      const diasRest = diasNoMes - diaAtual
      const metaAjustada = diasRest > 0 ? falta / diasRest : 0

      setMeta(metaMensal)
      setRendaFixa(rendaF)
      setMetaDiaria(metaDiariaBase)
      setMetaDiariaAjustada(metaAjustada)
      setTotalCorridas(totalGanho)
      setDiasPassados(diaAtual)
      setDiasRestantes(diasRest)
      setFaltaMes(falta)

      // Montar array de dias
      const diasArr = Array.from({ length: diasNoMes }, (_, i) => {
        const dia = i + 1
        const ds = `${ym}-${String(dia).padStart(2, '0')}`
        const ganho = (corridas || [])
          .filter((c: any) => c.data === ds)
          .reduce((a: number, c: any) => a + Number(c.valor), 0)
        const bateu = ganho >= metaDiariaBase
        const futuro = dia > diaAtual
        return { dia, ds, ganho, bateu, futuro }
      })
      setDias(diasArr)
      setLoading(false)
    }
    load()
  }, [])

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

  const pct = meta > 0 ? Math.min((totalCorridas / (meta - rendaFixa)) * 100, 100) : 0

  return (
    <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em', marginBottom: '4px' }}>
        Meta Diária
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '20px' }}>
        Acompanhe seu progresso dia a dia
      </p>

      {/* Cards principais */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div className="glass-card glow" style={{ padding: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: '6px' }}>Meta Diária Base</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--accent)' }}>{fmt$(metaDiaria)}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>por dia no mês</p>
        </div>
        <div className="glass-card glow" style={{ padding: '16px', border: '1px solid rgba(0,212,255,.2)' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: '6px' }}>Meta Ajustada</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--cyan)' }}>{fmt$(metaDiariaAjustada)}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>para os próximos {diasRestantes} dias</p>
        </div>
        <div className="glass-card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: '6px' }}>Ganho este mês</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>{fmt$(totalCorridas)}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{diasPassados} dias trabalhados</p>
        </div>
        <div className="glass-card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: '6px' }}>Falta no mês</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: faltaMes > 0 ? 'var(--danger)' : 'var(--success)' }}>{faltaMes > 0 ? fmt$(faltaMes) : '🎉 Meta!'}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{diasRestantes} dias restantes</p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>
            Progresso da Meta de Corridas
          </p>
          <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)' }}>{pct.toFixed(0)}%</p>
        </div>
        <div className="progress-track">
          <div className={'progress-fill ' + (pct >= 100 ? 'green' : pct >= 70 ? 'yellow' : 'green')}
            style={{ width: pct + '%' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>{fmt$(totalCorridas)} ganho</p>
          <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>Meta: {fmt$(meta - rendaFixa)}</p>
        </div>
      </div>

      {/* Calendário */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '16px' }}>
          Calendário do Mês
        </p>

        {/* Header dias da semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {['D','S','T','Q','Q','S','S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Dias */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {/* Espaços vazios antes do primeiro dia */}
          {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }, (_, i) => (
            <div key={'empty-' + i} />
          ))}
          {dias.map(d => (
            <div key={d.dia} style={{
              aspectRatio: '1',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: d.futuro
                ? 'rgba(255,255,255,.03)'
                : d.ganho > 0
                  ? d.bateu ? 'rgba(0,255,135,.12)' : 'rgba(255,71,87,.12)'
                  : 'rgba(255,255,255,.03)',
              border: `1px solid ${d.futuro ? 'rgba(255,255,255,.06)' : d.ganho > 0 ? d.bateu ? 'rgba(0,255,135,.25)' : 'rgba(255,71,87,.25)' : 'rgba(255,255,255,.06)'}`,
              cursor: d.ganho > 0 ? 'pointer' : 'default',
            }}>
              <span style={{
                fontSize: '12px', fontWeight: 700,
                color: d.futuro ? 'var(--text-3)' : d.ganho > 0 ? d.bateu ? 'var(--accent)' : 'var(--danger)' : 'var(--text-3)',
              }}>{d.dia}</span>
              {d.ganho > 0 && (
                <span style={{ fontSize: '8px', color: d.bateu ? 'var(--accent)' : 'var(--danger)', marginTop: '1px' }}>
                  {(d.ganho / 1000).toFixed(1)}k
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', justifyContent: 'center' }}>
          {[
            ['rgba(0,255,135,.12)', 'rgba(0,255,135,.25)', 'var(--accent)', 'Meta atingida'],
            ['rgba(255,71,87,.12)', 'rgba(255,71,87,.25)', 'var(--danger)', 'Abaixo da meta'],
          ].map(([bg, border, color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: bg, border: `1px solid ${border}` }} />
              <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
