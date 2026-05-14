'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fmt$, fmtDate, toDateStr } from '@/lib/utils'

const CATS = [
  { id: 'moradia',            label: 'Moradia',      icon: '🏠' },
  { id: 'energia',            label: 'Energia',      icon: '💡' },
  { id: 'agua',               label: 'Água',         icon: '💧' },
  { id: 'internet_telefone',  label: 'Internet/Tel', icon: '📶' },
  { id: 'manutencao_veiculo', label: 'Manutenção',   icon: '🔧' },
  { id: 'combustivel',        label: 'Combustível',  icon: '⛽' },
  { id: 'seguro',             label: 'Seguro',       icon: '🛡️' },
  { id: 'impostos',           label: 'Impostos',     icon: '📋' },
  { id: 'alimentacao',        label: 'Alimentação',  icon: '🛒' },
  { id: 'saude',              label: 'Saúde',        icon: '🏥' },
  { id: 'educacao',           label: 'Educação',     icon: '🎓' },
  { id: 'lazer',              label: 'Lazer',        icon: '🎮' },
  { id: 'cartao_credito',     label: 'Cartão',       icon: '💳' },
  { id: 'outros',             label: 'Outros',       icon: '📦' },
]

export default function DespesasPage() {
  const supabase = createClient()
  const [despesas, setDespesas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    categoria: '', descricao: '', valor: '',
    data: toDateStr(new Date()), tipo: 'variavel', forma_pagamento: 'pix', operacional: false
  })

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('despesas').select('*')
      .eq('user_id', user!.id)
      .order('data', { ascending: false })
    setDespesas(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function save() {
    if (!form.categoria) return alert('Selecione uma categoria')
    if (!form.descricao || !form.valor) return alert('Preencha todos os campos')
    const { data: { user } } = await supabase.auth.getUser()
    const payload = { ...form, valor: parseFloat(form.valor), user_id: user!.id }
    if (editing) {
      await supabase.from('despesas').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('despesas').insert(payload)
    }
    setShowForm(false)
    setEditing(null)
    setForm({ categoria: '', descricao: '', valor: '', data: toDateStr(new Date()), tipo: 'variavel', forma_pagamento: 'pix', operacional: false })

    load()
  }

  async function del(id: string) {
    if (!confirm('Excluir esta despesa?')) return
    await supabase.from('despesas').delete().eq('id', id)
    load()
  }

  function edit(d: any) {
    setEditing(d)
    setForm({ categoria: d.categoria, descricao: d.descricao, valor: String(d.valor), data: d.data, tipo: d.tipo, forma_pagamento: d.forma_pagamento || 'pix' })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const total = despesas.reduce((a, d) => a + Number(d.valor), 0)

  const S = {
    label: { display: 'block' as const, fontSize: '11px', fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: 'var(--text-3)', marginBottom: '7px' },
    input: { width: '100%', padding: '11px 16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', color: 'var(--text-1)', fontFamily: 'inherit', fontSize: '14px', outline: 'none', appearance: 'none' as const },
  }

  return (
    <div className="anim-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Despesas</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '4px' }}>Controle seus gastos por categoria</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null) }}>
          + Nova Despesa
        </button>
      </div>

      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-3)' }}>Total de Despesas</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--danger)', letterSpacing: '-.02em', marginTop: '4px' }}>{fmt$(total)}</p>
        </div>
        <span style={{ fontSize: '40px', opacity: .6 }}>💳</span>
      </div>

      {showForm && (
        <div className="form-panel" style={{ marginBottom: '20px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '16px' }}>
            {editing ? 'Editar Despesa' : 'Nova Despesa'}
          </p>

          <label style={S.label}>Categoria</label>
          <div className="cat-grid" style={{ marginBottom: '16px' }}>
            {CATS.map(c => (
              <button key={c.id}
                className={`cat-btn${form.categoria === c.id ? ' selected' : ''}`}
                onClick={() => setForm({ ...form, categoria: c.id })}>
                <span className="cat-icon">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={S.label}>Descrição</label>
              <input type="text" style={S.input} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Conta de luz de maio" />
            </div>
            <div>
              <label style={S.label}>Valor (R$)</label>
              <input type="number" step="0.01" style={S.input} value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
            </div>
            <div>
              <label style={S.label}>Data</label>
              <input type="date" style={S.input} value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
            </div>
            <div>
              <label style={S.label}>Tipo</label>
              <select style={S.input} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option value="variavel">Variável</option>
                <option value="fixa">Fixa</option>
                <option value="parcelada">Parcelada</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Pagamento</label>
              <select style={S.input} value={form.forma_pagamento} onChange={e => setForm({ ...form, forma_pagamento: e.target.value })}>
                <option value="pix">PIX</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>
          </div>
<div style={{ gridColumn: 'span 2' }}>
  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.1)' }}>
    <input
      type="checkbox"
      checked={form.operacional}
      onChange={e => setForm({ ...form, operacional: e.target.checked })}
      style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
    />
    <div>
      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>⚙️ Despesa Operacional</p>
      <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>Deduz do lucro líquido (combustível, manutenção, etc.)</p>
    </div>
  </label>
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
                {['Data','Categoria','Descrição','Tipo','Pgto','Valor',''].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>Carregando...</td></tr>
              ) : despesas.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">💳</div><p className="empty-text">Nenhuma despesa registrada</p></div></td></tr>
              ) : despesas.map(d => {
                const cat = CATS.find(c => c.id === d.categoria)
                return (
                  <tr key={d.id}>
                    <td style={{ color: 'var(--text-1)', whiteSpace: 'nowrap' }}>{fmtDate(d.data)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{cat?.icon} {cat?.label}</td>
                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.descricao}</td>
                    <td><span className={`chip chip-${d.tipo}`}>{d.tipo}</span></td>
                    <td style={{ fontSize: '12px' }}>{d.forma_pagamento}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 700 }}>{fmt$(Number(d.valor))}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-ghost" style={{ padding: '6px' }} onClick={() => edit(d)}>✏️</button>
                        <button className="btn-danger" style={{ padding: '6px' }} onClick={() => del(d.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
