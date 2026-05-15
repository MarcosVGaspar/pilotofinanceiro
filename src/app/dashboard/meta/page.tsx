'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fmt$ } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function MetaPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [modoBruto, setModoBruto] = useState(true)

  // Meta
  const [metaBruta, setMetaBruta] = useState(0)
  const [metaLiquida, setMetaLiquida] = useState(0)
  const [metaBrutaSugerida, setMetaBrutaSugerida] = useState(0)
  const [margemHistorica, setMargemHistorica] = useState(0)
  const [periodoMargem, setPeriodoMargem] = useState(3)

  // Progresso
  const [totalCorridas, setTotalCorridas] = useState(0)
  const [totalOperacional, setTotalOperacional] = useState(0)
  const [rendaFixa, setRendaFixa] = useState(0)
  const [metaDiaria, setMetaDiaria] = useState(0)
  const [metaDiariaAjustada, setMetaDiariaAjustada] = useState(0)
  const [diasPassados, setDiasPassados] = useState(0)
  const [diasRestantes, setDiasRestantes] = useState(0)
  const [faltaMes, setFaltaMes] = useState(0)
  const [dias, setDias] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const now    = new Date()
      const ano    = now.getFullYear()
      const mes    = now.getMonth() + 1
      const ym     = `${ano}-${String(mes).padStart(2, '0')}`
      const diasNM = new Date(ano, mes, 0).getDate()
      const diaAtual = now.getDate()

      const [{ data: config }, { data: corridas }] = await Promise.all([
        supabase.from('configuracoes').select('*').eq('user_id', user.id).single(),
        supabase.from('corridas').select('data,valor').eq('user_id', user.id).gte('data', `${ym}-01`),
      ])

      // Lê os valores salvos das configurações
      const mBruta   = Number(config?.meta_bruta_sugerida || 0)
      const mLiq     = Number(config?.meta_liquida || 0)
      const rendaF   = Number(config?.renda_fixa_mensal || 0)
      const periodo  = Number(config?.periodo_margem || 3)
      const catsOp   = config?.categorias_operacionais || ['combustivel','manutencao_veiculo','seguro','impostos']

      // Histórico para calcular margem
      const dataInicio = new Date()
      dataInicio.setMonth(dataInicio.getMonth() - periodo)
      const dataInicioStr = dataInicio.getFullYear() + '-' + String(dataInicio.getMonth() + 1).padStart(2, '0') + '-01'

      const [{ data: histCorridas }, { data: histDespesas }, { data: histAbast }, { data: histManut }] = await Promise.all([
        supabase.from('corridas').select('valor').eq('user_id', user.id).gte('data', dataInicioStr),
        supabase.from('despesas').select('valor,categoria,operacional').eq('user_id', user.id).gte('data', dataInicioStr),
        supabase.from('abastecimentos').select('valor_total').eq('user_id', user.id).gte('data', dataInicioStr),
        supabase.from('manutencoes').select('valor').eq('user_id', user.id).gte('data', dataInicioStr),
      ])

      const totalBrutoHist = (histCorridas || []).reduce((a: number, x: any) => a + Number(x.valor), 0)
      const totalOpHist =
        (histDespesas || []).filter((x: any) => x.operacional || catsOp.includes(x.categoria)).reduce((a: number, x: any) => a + Number(x.valor), 0) +
        (histAbast || []).reduce((a: number, x: any) => a + Number(x.valor_total || 0), 0) +
        (histManut || []).reduce((a: number, x: any) => a + Number(x.valor || 0), 0)

      const margem       = totalBrutoHist > 0 ? (totalBrutoHist - totalOpHist) / totalBrutoHist : 0.8
      const brutaSugerida = mLiq > 0 && margem > 0 ? mLiq / margem : mBruta
      const totalOpMes   = totalOpHist / periodo

      // Meta de corridas = meta bruta - renda fixa
      const metaCorridasMes  = mBruta > 0 ? Math.max(mBruta - rendaF, 0) : 0
      const metaDiariaBase   = metaCorridasMes > 0 ? metaCorridasMes / diasNM : 0

      const totalGanho       = (corridas || []).reduce((a: number, c: any) => a + Number(c.valor), 0)
      const falta            = Math.max(metaCorridasMes - totalGanho, 0)
      const diasRest         = diasNM - diaAtual
      const metaAjustada     = diasRest > 0 ? falta / diasRest : 0

      setMetaBruta(mBruta)
      setMetaLiquida(mLiq)
      setMetaBrutaSugerida(brutaSugerida)
      setMargemHistorica(margem * 100)
      setPeriodoMargem(periodo)
      setTotalOperacional(totalOpMes)
      setTotalCorridas(totalGanho)
      setRendaFixa(rendaF)
      setMetaDiaria(metaDiariaBase)
      setMetaDiariaAjustada(metaAjustada)
      setDiasPassados(diaAtual)
      setDiasRestantes(diasRest)
      setFaltaMes(falta)

      // Calendário
      const diasArr = Array.from({ length: diasNM }, (_, i) => {
        const dia = i + 1
        const ds  = `${ym}-${String(dia).padStart(2, '0')}`
        const ganho = (corridas || [])
          .filter((c: any) => c.data === ds)
          .reduce((a: number, c: any) => a + Number(c.valor), 0)
        return { dia, ds, ganho, bateu: ganho >= metaDiariaBase, futuro: dia > diaAtual }
      })
      setDias(diasArr)
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

  // Valores exibidos dependem do modo
  const metaExibida      = modoBruto ? metaBruta : metaLiquida
  const progressoExibido = modoBruto ? totalCorridas : Math.max(totalCorridas - totalOperacional, 0)
  const pct              = metaExibida > 0 ? Math.min((progressoExibido / metaExibida) * 100, 100) : 0

  return (
    <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em', marginBottom: '4px' }}>
        Meta Diária
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '16px' }}>
        Acompanhe seu progresso dia a dia
      </p>

      {/* Toggle Bruto / Líquido */}
      {metaLiquida > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
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
      )}

      {/* Cards principais */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div className="glass-card glow" style={{ padding: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: '6px' }}>Meta Diária Base</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--accent)' }}>{fmt$(metaDiaria)}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>por dia no mês</p>
        </div>
        <div className="glass-card" style={{ padding: '16px', border: '1px solid rgba(0,212,255,.2)' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: '6px' }}>Meta Ajustada</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--cyan)' }}>{fmt$(metaDiariaAjustada)}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>próximos {diasRestantes} dias</p>
        </div>
        <div className="glass-card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: '6px' }}>
            {modoBruto ? 'Ganho este mês' : 'Líquido este mês'}
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>{fmt$(progressoExibido)}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{diasPassados} dias</p>
        </div>
        <div className="glass-card" style={{ padding: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: '6px' }}>Falta no mês</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: faltaMes > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {faltaMes > 0 ? fmt$(faltaMes) : '🎉 Meta!'}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{diasRestantes} dias restantes</p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>
            {modoBruto ? 'Progresso — Meta Bruta' : 'Progresso — Meta Líquida'}
          </p>
          <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)' }}>{pct.toFixed(0)}%</p>
        </div>
        <div className="progress-track">
          <div className={'progress-fill ' + (pct >= 100 ? 'green' : pct >= 70 ? 'yellow' : 'green')} style={{ width: pct + '%' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>{fmt$(progressoExibido)} acumulado</p>
          <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>Meta: {fmt$(metaExibida)}</p>
        </div>
      </div>

      {/* Bruto vs Líquido — card informativo */}
      {metaLiquida > 0 && (
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '12px' }}>
            Bruto vs Líquido
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(var(--accent-rgb),.05)', border: '1px solid rgba(var(--accent-rgb),.15)' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '4px' }}>Meta Bruta</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--accent)' }}>{fmt$(metaBruta)}</p>
            </div>
            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,230,118,.05)', border: '1px solid rgba(0,230,118,.15)' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '4px' }}>Meta Líquida</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--success)' }}>{fmt$(metaLiquida)}</p>
            </div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(0,212,255,.05)', border: '1px solid rgba(0,212,255,.15)' }}>
            <p style={{ fontSize: '12px', color: 'var(--cyan)', lineHeight: 1.6 }}>
              📊 Margem histórica ({periodoMargem} {periodoMargem === 1 ? 'mês' : 'meses'}): <strong>{margemHistorica.toFixed(1)}%</strong>
              {metaBrutaSugerida > 0 && (
                <span style={{ display: 'block', marginTop: '4px', color: 'var(--text-2)' }}>
                  Para lucrar {fmt$(metaLiquida)}, faturar {fmt$(metaBrutaSugerida)}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Calendário */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '16px' }}>
          Calendário do Mês
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
          {['D','S','T','Q','Q','S','S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', padding: '4px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }, (_, i) => (
            <div key={'e' + i} />
          ))}
          {dias.map(d => (
            <div key={d.dia} style={{
              aspectRatio: '1', borderRadius: '8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: d.futuro ? 'rgba(255,255,255,.03)' : d.ganho > 0 ? d.bateu ? 'rgba(var(--accent-rgb),.12)' : 'rgba(255,71,87,.12)' : 'rgba(255,255,255,.03)',
              border: `1px solid ${d.futuro ? 'rgba(255,255,255,.06)' : d.ganho > 0 ? d.bateu ? 'rgba(var(--accent-rgb),.25)' : 'rgba(255,71,87,.25)' : 'rgba(255,255,255,.06)'}`,
            }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: d.futuro ? 'var(--text-3)' : d.ganho > 0 ? d.bateu ? 'var(--accent)' : 'var(--danger)' : 'var(--text-3)' }}>{d.dia}</span>
              {d.ganho > 0 && (
                <span style={{ fontSize: '8px', color: d.bateu ? 'var(--accent)' : 'var(--danger)', marginTop: '1px' }}>
                  {(d.ganho / 1000).toFixed(1)}k
                </span>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', justifyContent: 'center' }}>
          {[
            ['rgba(var(--accent-rgb),.12)', 'rgba(var(--accent-rgb),.25)', 'var(--accent)', 'Meta atingida'],
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
