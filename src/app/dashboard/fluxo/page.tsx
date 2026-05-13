'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fmt$, fmtDate } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function FluxoPage() {
  const supabase = createClient()
  const [date, setDate] = useState(new Date())
  const [movs, setMovs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const uid = user!.id
    const [{ data: c }, { data: r }, { data: d }, { data: a }, { data: m }] = await Promise.all([
      supabase.from('corridas').select('data,valor,plataforma,quantidade_corridas').eq('user_id', uid).gte('data', `${ym}-01`).lte('data', `${ym}-31`),
      supabase.from('rendas').select('data,valor,descricao').eq('user_id', uid).gte('data', `${ym}-01`).lte('data', `${ym}-31`),
      supabase.from('despesas').select('data,valor,descricao').eq('user_id', uid).gte('data', `${ym}-01`).lte('data', `${ym}-31`),
      supabase.from('abastecimentos').select('data,valor_total').eq('user_id', uid).gte('data', `${ym}-01`).lte('data', `${ym}-31`),
      supabase.from('manutencoes').select('data,valor,descricao').eq('user_id', uid).gte('data', `${ym}-01`).lte('data', `${ym}-31`),
    ])
    const all = [
      ...(c || []).map((x: any) => ({ date: x.data, tipo: 'Corrida',     desc: `${x.plataforma?.toUpperCase()} (${x.quantidade_corridas || 1}x)`, entrada: Number(x.valor), saida: 0 })),
      ...(r || []).map((x: any) => ({ date: x.data, tipo: 'Renda',       desc: x.descricao, entrada: Number(x.valor), saida: 0 })),
      ...(d || []).map((x: any) => ({ date: x.data, tipo: 'Despesa',     desc: x.descricao, entrada: 0, saida: Number(x.valor) })),
      ...(a || []).map((x: any) => ({ date: x.data, tipo: 'Combustível', desc: 'Abastecimento', entrada: 0, saida: Number(x.valor_total) })),
      ...(m || []).map((x: any) => ({ date: x.data, tipo: 'Manutenção',  desc: x.descricao || 'Manutenção', entrada: 0, saida: Number(x.valor) })),
    ].sort((a, b) => a.date.localeCompare(b.date))
    setMovs(all)
    setLoading(false)
  }, [supabase, ym])

  useEffect(() => { load() }, [load])

  const totalIn  = movs.reduce((a, m) => a + m.entrada, 0)
  const totalOut = movs.reduce((a, m) => a + m.saida, 0)
  const saldo    = totalIn - totalOut

  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  let acc = 0
  const lineData = Array.from({ length: daysInMonth }, (_, i) => {
    const ds = `${ym}-${String(i + 1).padStart(2, '0')}`
    acc += movs.filter(m => m.date === ds).reduce((a, m) => a + m.entrada - m.saida, 0)
    return { dia: i + 1, saldo: acc }
  })

  const reversed = [...movs].reverse()
  let runSaldo = saldo
  const extrato = reversed.map(m => {
    const s = runSaldo
    runSaldo -= (m.entrada - m.saida)
    return { ...m, saldoAcum: s }
  })

  const TT = {
    contentStyle: {
      background: 'rgba(13,18,32,.97)',
      border: '1px solid rgba(255,255,255,.12)',
      borderRadius: '12px',
      color: '#F0F4FF',
      fontSize: '13px',
    }
  }

  return (
    <div className="anim-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Fluxo de Caixa</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '4px' }}>Visão completa das suas movimentações</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-secondary" style={{ padding: '8px 14px' }}
            onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}>←</button>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-1)', minWidth: '150px', textAlign: 'center' }}>
            {months[date.getMonth()]} {date.getFullYear()}
          </span>
          <button className="btn-secondary" style={{ padding: '8px 14px' }}
            onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}>→</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Entradas', value: fmt$(totalIn),  color: 'var(--accent)'  },
          { label: 'Saídas',   value: fmt$(totalOut), color: 'var(--danger)'  },
          { label: 'Saldo',    value: fmt$(saldo),    color: saldo >= 0 ? 'var(--accent)' : 'var(--danger)' },
        ].map((s, i) => (
          <div key={i} className="glass-card kpi-card">
            <p className="kpi-label">{s.label}</p>
            <p className="kpi-value" style={{ color: s.color, fontSize: '20px' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '16px' }}>
          Saldo Acumulado
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={lineData}>
            <XAxis dataKey="dia" stroke="transparent" tick={{ fill: '#4A5A7A', fontSize: 11 }} tickLine={false} axisLine={false} tickCount={8} />
            <YAxis stroke="transparent" tick={{ fill: '#4A5A7A', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={TT.contentStyle} formatter={(v: number) => fmt$(v)} />
            <Line type="monotone" dataKey="saldo" stroke="#00FF87" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>Extrato</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="pf-table">
            <thead>
              <tr>{['Data','Tipo','Descrição','Entrada','Saída','Saldo'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>Carregando...</td></tr>
              ) : extrato.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📊</div><p className="empty-text">Nenhuma movimentação neste mês</p></div></td></tr>
              ) : extrato.map((m, i) => (
                <tr key={i} style={{ background: m.entrada > 0 ? 'rgba(0,255,135,.02)' : 'rgba(255,71,87,.02)' }}>
                  <td style={{ color: 'var(--text-1)', whiteSpace: 'nowrap' }}>{fmtDate(m.date)}</td>
                  <td><span className={`chip ${m.entrada > 0 ? 'chip-in' : 'chip-out'}`}>{m.tipo}</span></td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.desc}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{m.entrada > 0 ? fmt$(m.entrada) : '–'}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{m.saida > 0 ? fmt$(m.saida) : '–'}</td>
                  <td style={{ color: m.saldoAcum >= 0 ? 'var(--accent)' : 'var(--danger)', fontWeight: 700 }}>{fmt$(m.saldoAcum)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
