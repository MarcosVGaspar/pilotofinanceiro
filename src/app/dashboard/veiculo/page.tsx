'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fmt$, fmtDate, toDateStr } from '@/lib/utils'

const MANUT_TIPOS: Record<string, string> = {
  oleo: '🛢️ Óleo', pneus: '🔄 Pneus', freios: '🛑 Freios',
  revisao: '🔍 Revisão', funilaria: '🏗️ Funilaria',
  eletrica: '⚡ Elétrica', outro: '🔧 Outro'
}

export default function VeiculoPage() {
  const supabase = createClient()
  const [veiculo, setVeiculo] = useState<any>(null)
  const [abastecimentos, setAbastecimentos] = useState<any[]>([])
  const [manutencoes, setManutencoes] = useState<any[]>([])
  const [tab, setTab] = useState<'abast' | 'manut'>('abast')
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'abast' | 'manut' | 'veiculo'>('abast')

  const [formAbast, setFormAbast] = useState({ data: toDateStr(new Date()), posto: '', tipo_combustivel: 'gasolina', litros: '', valor_litro: '', km_atual: '' })
  const [formManut, setFormManut] = useState({ data: toDateStr(new Date()), tipo: 'oleo', descricao: '', valor: '', km_atual: '', prox_km: '', prox_data: '' })
  const [formVeiculo, setFormVeiculo] = useState({ modelo: '', placa: '', tipo_combustivel: 'flex', consumo_declarado: '', odometro_atual: '' })

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: v }, { data: ab }, { data: mn }] = await Promise.all([
      supabase.from('veiculos').select('*').eq('user_id', user!.id).single(),
      supabase.from('abastecimentos').select('*').eq('user_id', user!.id).order('data', { ascending: false }),
      supabase.from('manutencoes').select('*').eq('user_id', user!.id).order('data', { ascending: false }),
    ])
    setVeiculo(v)
    setAbastecimentos(ab || [])
    setManutencoes(mn || [])
    if (v) setFormVeiculo({
      modelo: v.modelo || '', placa: v.placa || '',
      tipo_combustivel: v.tipo_combustivel || 'flex',
      consumo_declarado: String(v.consumo_declarado || ''),
      odometro_atual: String(v.odometro_atual || '')
    })
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function saveAbast() {
    const { data: { user } } = await supabase.auth.getUser()
    const vl = parseFloat(formAbast.valor_litro)
    const lt = parseFloat(formAbast.litros)
    await supabase.from('abastecimentos').insert({
      ...formAbast, litros: lt, valor_litro: vl,
      valor_total: lt * vl, km_atual: parseInt(formAbast.km_atual),
      user_id: user!.id, veiculo_id: veiculo?.id || null
    })
    setShowForm(false)
    load()
  }

  async function saveManut() {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('manutencoes').insert({
      ...formManut, valor: parseFloat(formManut.valor),
      km_atual: parseInt(formManut.km_atual) || null,
      prox_km: parseInt(formManut.prox_km) || null,
      prox_data: formManut.prox_data || null,
      user_id: user!.id, veiculo_id: veiculo?.id || null
    })
    setShowForm(false)
    load()
  }

  async function saveVeiculo() {
    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      ...formVeiculo,
      consumo_declarado: parseFloat(formVeiculo.consumo_declarado) || null,
      odometro_atual: parseInt(formVeiculo.odometro_atual) || 0,
      user_id: user!.id
    }
    if (veiculo) {
      await supabase.from('veiculos').update(payload).eq('id', veiculo.id)
    } else {
      await supabase.from('veiculos').insert(payload)
    }
    setShowForm(false)
    load()
  }

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

  return (
    <div className="anim-fade">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Veículo</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '4px' }}>{veiculo?.modelo || 'Configure seu veículo'}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => { setFormType('veiculo'); setShowForm(true) }}>⚙️ Veículo</button>
          <button className="btn-secondary" onClick={() => { setFormType('abast'); setShowForm(true) }}>⛽ Abast.</button>
          <button className="btn-primary" onClick={() => { setFormType('manut'); setShowForm(true) }}>🔧 Manut.</button>
        </div>
      </div>

      {/* Cards do veículo */}
      {veiculo && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '8px', marginBottom: '16px' }}>
          {[
            { label: 'Modelo',      value: veiculo.modelo },
            { label: 'Placa',       value: veiculo.placa || '–' },
            { label: 'Combustível', value: veiculo.tipo_combustivel },
            { label: 'Odômetro',    value: `${Number(veiculo.odometro_atual || 0).toLocaleString('pt-BR')} km` },
          ].map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: '14px', overflow: 'hidden' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-3)', marginBottom: '5px' }}>{s.label}</p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="form-panel" style={{ marginBottom: '16px' }}>

          {/* Abastecimento */}
          {formType === 'abast' && (
            <>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '14px' }}>⛽ Novo Abastecimento</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={grid2}>
                  <div><label style={lbl}>Data</label><input type="date" style={inp} value={formAbast.data} onChange={e => setFormAbast({ ...formAbast, data: e.target.value })} /></div>
                  <div><label style={lbl}>Posto</label><input type="text" style={inp} value={formAbast.posto} onChange={e => setFormAbast({ ...formAbast, posto: e.target.value })} /></div>
                </div>
                <div style={grid2}>
                  <div>
                    <label style={lbl}>Combustível</label>
                    <select style={inp} value={formAbast.tipo_combustivel} onChange={e => setFormAbast({ ...formAbast, tipo_combustivel: e.target.value })}>
                      <option value="gasolina">Gasolina</option>
                      <option value="etanol">Etanol</option>
                      <option value="diesel">Diesel</option>
                      <option value="gnv">GNV</option>
                    </select>
                  </div>
                  <div><label style={lbl}>KM Atual</label><input type="number" style={inp} value={formAbast.km_atual} onChange={e => setFormAbast({ ...formAbast, km_atual: e.target.value })} /></div>
                </div>
                <div style={grid2}>
                  <div><label style={lbl}>Litros</label><input type="number" step="0.01" style={inp} value={formAbast.litros} onChange={e => setFormAbast({ ...formAbast, litros: e.target.value })} /></div>
                  <div><label style={lbl}>R$/Litro</label><input type="number" step="0.001" style={inp} value={formAbast.valor_litro} onChange={e => setFormAbast({ ...formAbast, valor_litro: e.target.value })} /></div>
                </div>
              </div>
              {formAbast.litros && formAbast.valor_litro && (
                <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>
                  Total: {fmt$(parseFloat(formAbast.litros) * parseFloat(formAbast.valor_litro))}
                </p>
              )}
            </>
          )}

          {/* Manutenção */}
          {formType === 'manut' && (
            <>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '14px' }}>🔧 Nova Manutenção</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={grid2}>
                  <div><label style={lbl}>Data</label><input type="date" style={inp} value={formManut.data} onChange={e => setFormManut({ ...formManut, data: e.target.value })} /></div>
                  <div>
                    <label style={lbl}>Tipo</label>
                    <select style={inp} value={formManut.tipo} onChange={e => setFormManut({ ...formManut, tipo: e.target.value })}>
                      {Object.entries(MANUT_TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Descrição</label>
                  <input type="text" style={inp} value={formManut.descricao} onChange={e => setFormManut({ ...formManut, descricao: e.target.value })} />
                </div>
                <div style={grid2}>
                  <div><label style={lbl}>Valor (R$)</label><input type="number" step="0.01" style={inp} value={formManut.valor} onChange={e => setFormManut({ ...formManut, valor: e.target.value })} /></div>
                  <div><label style={lbl}>KM Atual</label><input type="number" style={inp} value={formManut.km_atual} onChange={e => setFormManut({ ...formManut, km_atual: e.target.value })} /></div>
                </div>
                <div style={grid2}>
                  <div><label style={lbl}>Próx. KM</label><input type="number" style={inp} value={formManut.prox_km} onChange={e => setFormManut({ ...formManut, prox_km: e.target.value })} /></div>
                  <div><label style={lbl}>Próx. Data</label><input type="date" style={inp} value={formManut.prox_data} onChange={e => setFormManut({ ...formManut, prox_data: e.target.value })} /></div>
                </div>
              </div>
            </>
          )}

          {/* Veículo */}
          {formType === 'veiculo' && (
            <>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '14px' }}>⚙️ Dados do Veículo</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={lbl}>Modelo</label>
                  <input type="text" style={inp} value={formVeiculo.modelo} placeholder="Ex: Chevrolet Onix 2021" onChange={e => setFormVeiculo({ ...formVeiculo, modelo: e.target.value })} />
                </div>
                <div style={grid2}>
                  <div><label style={lbl}>Placa</label><input type="text" style={inp} value={formVeiculo.placa} onChange={e => setFormVeiculo({ ...formVeiculo, placa: e.target.value })} /></div>
                  <div>
                    <label style={lbl}>Combustível</label>
                    <select style={inp} value={formVeiculo.tipo_combustivel} onChange={e => setFormVeiculo({ ...formVeiculo, tipo_combustivel: e.target.value })}>
                      <option value="gasolina">Gasolina</option>
                      <option value="etanol">Etanol</option>
                      <option value="flex">Flex</option>
                      <option value="diesel">Diesel</option>
                      <option value="gnv">GNV</option>
                      <option value="eletrico">Elétrico</option>
                    </select>
                  </div>
                </div>
                <div style={grid2}>
                  <div><label style={lbl}>Consumo (km/L)</label><input type="number" step="0.1" style={inp} value={formVeiculo.consumo_declarado} onChange={e => setFormVeiculo({ ...formVeiculo, consumo_declarado: e.target.value })} /></div>
                  <div><label style={lbl}>Odômetro</label><input type="number" style={inp} value={formVeiculo.odometro_atual} onChange={e => setFormVeiculo({ ...formVeiculo, odometro_atual: e.target.value })} /></div>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '14px' }}>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" onClick={formType === 'abast' ? saveAbast : formType === 'manut' ? saveManut : saveVeiculo}>Salvar</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[{ id: 'abast', label: '⛽ Abastecimentos' }, { id: 'manut', label: '🔧 Manutenções' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            style={{
              padding: '9px 18px', borderRadius: '99px', fontSize: '13px',
              fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
              border: '1px solid',
              borderColor: tab === t.id ? 'rgba(var(--accent-rgb),.3)' : 'rgba(255,255,255,.1)',
              background: tab === t.id ? 'rgba(var(--accent-rgb),.08)' : 'rgba(255,255,255,.03)',
              color: tab === t.id ? 'var(--accent)' : 'var(--text-3)'
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabelas */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {tab === 'abast' ? (
            <table className="pf-table">
              <thead>
                <tr>{['Data','Posto','Comb.','Litros','R$/L','Total','KM','Consumo'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {abastecimentos.length === 0
                  ? <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">⛽</div><p className="empty-text">Nenhum abastecimento</p></div></td></tr>
                  : abastecimentos.map(a => (
                    <tr key={a.id}>
                      <td style={{ color: 'var(--text-1)', whiteSpace: 'nowrap' }}>{fmtDate(a.data)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{a.posto || '–'}</td>
                      <td>{a.tipo_combustivel}</td>
                      <td style={{ color: 'var(--text-1)' }}>{Number(a.litros).toFixed(2)}L</td>
                      <td>{fmt$(Number(a.valor_litro))}</td>
                      <td style={{ color: 'var(--warn)', fontWeight: 700 }}>{fmt$(Number(a.valor_total))}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{Number(a.km_atual).toLocaleString('pt-BR')} km</td>
                      <td style={{ color: a.consumo_calculado ? 'var(--success)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>
                        {a.consumo_calculado ? `${a.consumo_calculado} km/L` : '–'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <table className="pf-table">
              <thead>
                <tr>{['Data','Tipo','Descrição','KM','Próx. KM','Valor'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {manutencoes.length === 0
                  ? <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">🔧</div><p className="empty-text">Nenhuma manutenção</p></div></td></tr>
                  : manutencoes.map(m => (
                    <tr key={m.id}>
                      <td style={{ color: 'var(--text-1)', whiteSpace: 'nowrap' }}>{fmtDate(m.data)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{MANUT_TIPOS[m.tipo]}</td>
                      <td>{m.descricao || '–'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{m.km_atual ? `${Number(m.km_atual).toLocaleString('pt-BR')} km` : '–'}</td>
                      <td style={{ color: 'var(--cyan)', whiteSpace: 'nowrap' }}>
                        {m.prox_km ? `${Number(m.prox_km).toLocaleString('pt-BR')} km` : m.prox_data ? fmtDate(m.prox_data) : '–'}
                      </td>
                      <td style={{ color: 'var(--danger)', fontWeight: 700 }}>{fmt$(Number(m.valor))}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
