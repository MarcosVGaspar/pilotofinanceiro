'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fmt$, fmtDate, toDateStr } from '@/lib/utils'

const PLATS = [
  { id: 'uber',     label: 'Uber',     color: '#fff',    bg: 'rgba(255,255,255,.06)' },
  { id: '99',       label: '99',       color: '#f7c800', bg: 'rgba(247,200,0,.06)'   },
  { id: 'indriver', label: 'InDriver', color: '#4ade80', bg: 'rgba(74,222,128,.06)'  },
  { id: 'outro',    label: 'Outro',    color: '#00FF87', bg: 'rgba(0,255,135,.06)'   },
]

const emptyForm = {
  plataforma: 'uber', data: '', valor: '',
  km_rodados: '', quantidade_corridas: '1',
  hora_inicio: '', hora_fim: '', observacoes: ''
}

export default function CorridasPage() {
  const supabase = createClient()
  const [corridas, setCorridas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ ...emptyForm, data: toDateStr(new Date()) })

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('corridas').select('*')
      .eq('user_id', user!.id)
      .order('data', { ascending: false })
    setCorridas(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function save() {
    if (!form.valor || !form.data) return alert('Preencha data e valor')
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      ...form,
      valor: parseFloat(form.valor),
      km_rodados: parseFloat(form.km_rodados) || null,
      quantidade_corridas: parseInt(form.quantidade_corridas) || 1,
      user_id: user!.id
    }
    if (editing) {
      await supabase.from('corridas').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('corridas').insert(payload)
    }
    setShowForm(false)
    setEditing(null)
    setForm({ ...emptyForm, data: toDateStr(new Date()) })
    load()
  }

  async function del(id: string) {
    if (!confirm('Excluir esta corrida?')) return
    await supabase.from('corridas').delete().eq('id', id)
    load()
  }

  function edit(c: any) {
    setEditing(c)
    setForm({
      plataforma: c.plataforma, data: c.data,
      valor: String(c.valor), km_rodados: String(c.km_rodados || ''),
      quantidade_corridas: String(c.quantidade_corridas || 1),
      hora_inicio: c.hora_inicio || '', hora_fim: c.hora_fim || '',
      observacoes: c.observacoes || ''
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalV = corridas.reduce((a, c) => a + Number(c.valor), 0)
  const totalQ = corridas.reduce((a, c) => a + (c.quantidade_corridas || 1), 0)
  const totalKm = corridas.reduce((a, c) => a + Number(c.km_rodados || 0), 0)

  const inputStyle = {
    width: '100%', padding: '11px 16px',
    background: 'rgba(255,255,255,.03)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '8px', color: 'var(--text-1)',
    fontFamily: 'inherit', fontSize: '14px', outline: 'none'
  }
  const labelStyle = {
    display: 'block' as const, fontSize: '11px',
    fontWeight: '700' as const, textTransform: 'uppercase' as const,
    letterSpacing: '.1em', color: 'var(--text-3)', marginBottom: '7px'
  }

  return (
    <div className="anim-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Corridas</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '4px' }}>Registre suas corridas por plataforma</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null) }}>
          + Nova Corrida
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Faturado', value: fmt$(totalV), color: 'var(--accent)' },
          { label: 'Corridas', value: String(totalQ), color: 'var(--text-1)' },
          { label: 'KM Rodados', value: `${totalKm.toFixed(0)} km`, color: 'var(--text-2)' },
        ].map((s, i) => (
          <div key={i} className="glass-card kpi-card">
            <p className="kpi-label">{s.label}</p>
            <p className="kpi-value" style={{ color: s.color, fontSize: '20px' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="form-panel" style={{ marginBottom: '20px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '16px' }}>
            {editing ? 'Editar Corrida' : 'Nova Corrida'}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {PLATS.map(p => (
              <button key={p.id}
                className={`plat-btn plat-${p.id}${form.plataforma === p.id ? ' active' : ''}`}
                onClick={() => setForm({ ...form, plataforma: p.id })}>
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={labelStyle}>Data</label><input type="date" style={inputStyle} value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></div>
            <div><label style={labelStyle}>Qtd corridas</label><input type="number" min="1" style={inputStyle} value={form.quantidade_corridas} onChange={e => setForm({ ...form, quantidade_corridas: e.target.value })} /></div>
            <div><label style={labelStyle}>Valor (R$)</label><input type="number" step="0.01" style={inputStyle} value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
            <div><label style={labelStyle}>KM rodados</label><input type="number" step="0.1" style={inputStyle} value={form.km_rodados} onChange={e => setForm({ ...form, km_rodados: e.target.value })} /></div>
            <div><label style={labelStyle}>Hora início</label><input type="time" style={inputStyle} value={form.hora_inicio} onChange={e => setForm({ ...form, hora_inicio: e.target.value })} /></div>
            <div><label style={labelStyle}>Hora fim</label><input type="time" style={inputStyle} value={form.hora_fim} onChange={e => setForm({ ...form, hora_fim: e.target.value })} /></div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <label style={labelStyle}>Observações</label>
            <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' as const }} value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button className="btn-secondary" onClick={() => { setShowForm(false); setEditing(null) }}>Cancelar</button>
            <button className="btn-primary" onClick={save}>Salvar</button>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="pf-table">
            <thead>
              <tr>
                {['Data','Plataforma','Corridas','KM','Valor','Ticket',''].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>Carregando...</td></tr>
              ) : corridas.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🚗</div><p className="empty-text">Nenhuma corrida registrada</p></div></td></tr>
              ) : corridas.map(c => {
                const plat = PLATS.find(p => p.id === c.plataforma)!
                return (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-1)' }}>{fmtDate(c.data)}</td>
                    <td><span className={`chip chip-${c.plataforma}`}>{plat.label}</span></td>
                    <td>{c.quantidade_corridas || 1}</td>
                    <td>{c.km_rodados ? `${Number(c.km_rodados).toFixed(1)} km` : '–'}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{fmt$(Number(c.valor))}</td>
                    <td>{fmt$(Number(c.valor) / (c.quantidade_corridas || 1))}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-ghost" style={{ padding: '6px' }} onClick={() => edit(c)}>✏️</button>
                        <button className="btn-danger" style={{ padding: '6px' }} onClick={() => del(c.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {corridas.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={2} style={{ color: 'var(--text-3)' }}>Total ({corridas.length})</td>
                  <td style={{ color: 'var(--text-1)', fontWeight: 700 }}>{totalQ}</td>
                  <td style={{ color: 'var(--text-1)', fontWeight: 700 }}>{totalKm.toFixed(0)} km</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{fmt$(totalV)}</td>
                  <td style={{ color: 'var(--text-2)' }}>{fmt$(totalQ > 0 ? totalV / totalQ : 0)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
