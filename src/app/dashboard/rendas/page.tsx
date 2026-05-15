'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fmt$, fmtDate, toDateStr } from '@/lib/utils'

const TIPOS: Record<string, string> = {
  salario: 'Salário', freelance: 'Freelance',
  aluguel: 'Aluguel', beneficio: 'Benefício', outro: 'Outro'
}

export default function RendasPage() {
  const supabase = createClient()
  const [rendas, setRendas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    tipo: 'salario', descricao: '', valor: '',
    data: toDateStr(new Date()), recorrencia: 'unica', recebido: false
  })

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('rendas').select('*')
      .eq('user_id', user!.id)
      .order('data', { ascending: false })
    setRendas(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function save() {
    if (!form.descricao || !form.valor) return alert('Preencha todos os campos')
    const { data: { user } } = await supabase.auth.getUser()
    const payload = { ...form, valor: parseFloat(form.valor), user_id: user!.id }
    if (editing) {
      await supabase.from('rendas').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('rendas').insert(payload)
    }
    setShowForm(false)
    setEditing(null)
    setForm({ tipo: 'salario', descricao: '', valor: '', data: toDateStr(new Date()), recorrencia: 'unica', recebido: false })
    load()
  }

  async function del(id: string) {
    if (!confirm('Excluir?')) return
    await supabase.from('rendas').delete().eq('id', id)
    load()
  }

  function edit(r: any) {
    setEditing(r)
    setForm({
      tipo: r.tipo, descricao: r.descricao,
      valor: String(r.valor), data: r.data,
      recorrencia: r.recorrencia, recebido: r.recebido
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const total = rendas.filter(r => r.data?.startsWith(ym)).reduce((a, r) => a + Number(r.valor), 0)
  const recorrentes = rendas.filter(r => r.recorrencia !== 'unica')
  const avulsas = rendas.filter(r => r.recorrencia === 'unica')

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,.03)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '8px', color: 'var(--text-1)',
    fontFamily: 'inherit', fontSize: '14px',
    outline: 'none', appearance: 'none',
    boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '.1em',
    color: 'var(--text-3)', marginBottom: '7px'
  }
  const grid2: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
    gap: '10px',
  }

  const RendaItem = ({ r }: { r: any }) => (
    <div style={{
      padding: '12px', borderRadius: '12px',
      background: 'rgba(255,255,255,.025)',
      border: '1px solid rgba(255,255,255,.06)',
      marginBottom: '8px', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.descricao}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '3px' }}>{TIPOS[r.tipo]} • {fmtDate(r.data)}</p>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)', marginTop: '4px' }}>{fmt$(Number(r.valor))}</p>
          <p style={{ fontSize: '11px', color: r.recebido ? 'var(--success)' : 'var(--warn)', marginTop: '2px' }}>
            {r.recebido ? '✅ Recebido' : '⏳ Pendente'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button className="btn-ghost" style={{ padding: '6px' }} onClick={() => edit(r)}>✏️</button>
          <button className="btn-danger" style={{ padding: '6px' }} onClick={() => del(r.id)}>🗑️</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="anim-fade">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Rendas</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '4px' }}>Salários, freelances e outras receitas</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null) }}>
          + Nova Renda
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Total Mês',   value: fmt$(total),                                                                               color: 'var(--accent)' },
          { label: 'Recorrentes', value: String(recorrentes.length),                                                                color: 'var(--cyan)'   },
          { label: 'Pendentes',   value: fmt$(rendas.filter(r => !r.recebido).reduce((a, r) => a + Number(r.valor), 0)),            color: 'var(--warn)'   },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '12px 8px', textAlign: 'center', overflow: 'hidden' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)', marginBottom: '5px' }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="form-panel" style={{ marginBottom: '16px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '14px' }}>
            {editing ? 'Editar Renda' : 'Nova Renda'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={grid2}>
              <div>
                <label style={lbl}>Tipo</label>
                <select style={inp} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                  {Object.entries(TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Recorrência</label>
                <select style={inp} value={form.recorrencia} onChange={e => setForm({ ...form, recorrencia: e.target.value })}>
                  <option value="unica">Única</option>
                  <option value="mensal">Mensal</option>
                  <option value="semanal">Semanal</option>
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Descrição</label>
              <input type="text" style={inp} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Salário empresa X" />
            </div>
            <div style={grid2}>
              <div>
                <label style={lbl}>Valor (R$)</label>
                <input type="number" step="0.01" style={inp} value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
              </div>
              <div>
                <label style={lbl}>Data</label>
                <input type="date" style={inp} value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.recebido} onChange={e => setForm({ ...form, recebido: e.target.checked })} />
              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Já recebido</span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '14px' }}>
            <button className="btn-secondary" onClick={() => { setShowForm(false); setEditing(null) }}>Cancelar</button>
            <button className="btn-primary" onClick={save}>Salvar</button>
          </div>
        </div>
      )}

      {/* Listas — coluna única no mobile */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>Recorrentes</p>
            <span className="chip chip-fixa">{recorrentes.length}</span>
          </div>
          {loading
            ? <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>Carregando...</p>
            : recorrentes.length === 0
              ? <div className="empty-state" style={{ padding: '20px 0' }}><div className="empty-icon">📅</div><p className="empty-text">Nenhuma renda recorrente</p></div>
              : recorrentes.map(r => <RendaItem key={r.id} r={r} />)
          }
        </div>

        <div className="glass-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>Avulsas / Extras</p>
            <span className="chip chip-variavel">{avulsas.length}</span>
          </div>
          {loading
            ? <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>Carregando...</p>
            : avulsas.length === 0
              ? <div className="empty-state" style={{ padding: '20px 0' }}><div className="empty-icon">💰</div><p className="empty-text">Nenhuma renda avulsa</p></div>
              : avulsas.map(r => <RendaItem key={r.id} r={r} />)
          }
        </div>
      </div>
    </div>
  )
}
