'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function calcMetaBruta(metaLiquida: number, custoFixo: number, rendaFixa: number): number {
  // Meta bruta = (meta líquida + custos fixos - renda fixa) com margem mínima de 0
  const resultado = metaLiquida + custoFixo - rendaFixa
  return Math.max(0, resultado)
}

export default function ConfigPage() {
  const supabase = createClient()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({
    nome: '', cidade: '', meta_corridas: ''
  })
  const [config, setConfig] = useState({
    preco_gasolina: '', preco_etanol: '',
    preco_diesel: '', consumo_medio: '',
    custo_fixo_veiculo: '', renda_fixa_mensal: '',
    meta_liquida: '', meta_bruta_sugerida: '',
    accent_color: '#00FF87',
  })
  const [metaBrutaEditada, setMetaBrutaEditada] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('configuracoes').select('*').eq('user_id', user.id).single(),
      ])
      if (p) setProfile({
        nome: p.nome || '',
        cidade: p.cidade || '',
        meta_corridas: String(p.meta_corridas || ''),
      })
      if (c) setConfig({
        preco_gasolina: String(c.preco_gasolina || ''),
        preco_etanol: String(c.preco_etanol || ''),
        preco_diesel: String(c.preco_diesel || ''),
        consumo_medio: String(c.consumo_medio || ''),
        custo_fixo_veiculo: String(c.custo_fixo_veiculo || ''),
        renda_fixa_mensal: String(c.renda_fixa_mensal || ''),
        meta_liquida: String(c.meta_liquida || ''),
        meta_bruta_sugerida: String(c.meta_bruta_sugerida || ''),
        accent_color: c.accent_color || '#00FF87',
      })
    }
    load()
  }, [supabase])

  // Recalcula meta bruta sugerida automaticamente quando mudam os inputs
  useEffect(() => {
    if (metaBrutaEditada) return
    const ml = parseFloat(config.meta_liquida) || 0
    const cf = parseFloat(config.custo_fixo_veiculo) || 0
    const rf = parseFloat(config.renda_fixa_mensal) || 0
    if (ml > 0) {
      const sugerida = calcMetaBruta(ml, cf, rf)
      setConfig(prev => ({ ...prev, meta_bruta_sugerida: String(sugerida.toFixed(2)) }))
    }
  }, [config.meta_liquida, config.custo_fixo_veiculo, config.renda_fixa_mensal, metaBrutaEditada])

  async function saveAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const rendaFixa = parseFloat(config.renda_fixa_mensal) || 0
    const metaLiquida = parseFloat(config.meta_liquida) || 0
    const metaBruta = parseFloat(config.meta_bruta_sugerida) || 0

    await Promise.all([
      supabase.from('profiles').update({
        nome: profile.nome,
        cidade: profile.cidade,
        meta_mensal: metaBruta,
        meta_corridas: parseInt(profile.meta_corridas) || 0,
      }).eq('id', user.id),
      supabase.from('configuracoes').update({
        preco_gasolina: parseFloat(config.preco_gasolina) || 0,
        preco_etanol: parseFloat(config.preco_etanol) || 0,
        preco_diesel: parseFloat(config.preco_diesel) || 0,
        consumo_medio: parseFloat(config.consumo_medio) || 0,
        custo_fixo_veiculo: parseFloat(config.custo_fixo_veiculo) || 0,
        renda_fixa_mensal: rendaFixa,
        meta_liquida: metaLiquida,
        meta_bruta_sugerida: metaBruta,
        accent_color: config.accent_color,
      }).eq('user_id', user.id),
    ])

    if (rendaFixa > 0) {
      const now = new Date()
      const primeiroDia = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const { data: existing } = await supabase
        .from('rendas').select('id')
        .eq('user_id', user.id)
        .eq('tipo', 'salario')
        .eq('recorrencia', 'mensal')
        .gte('data', primeiroDia)
        .single()
      if (!existing) {
        await supabase.from('rendas').insert({
          user_id: user.id, tipo: 'salario',
          descricao: 'Renda fixa mensal', valor: rendaFixa,
          data: primeiroDia, recorrencia: 'mensal', recebido: true,
        })
      }
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,.03)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '8px', color: 'var(--text-1)',
    fontFamily: 'inherit', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '.1em',
    color: 'var(--text-3)', marginBottom: '7px'
  }
  const card: React.CSSProperties = {
    background: 'rgba(13,18,32,.9)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '20px', padding: '20px', marginBottom: '14px'
  }
  const grid2: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
    gap: '10px',
  }
  const sectionTitle: React.CSSProperties = {
    fontFamily: 'var(--font-display)', fontSize: '14px',
    fontWeight: 700, color: 'var(--text-1)', marginBottom: '14px'
  }

  const metaLiquidaNum = parseFloat(config.meta_liquida) || 0
  const custoFixoNum   = parseFloat(config.custo_fixo_veiculo) || 0
  const rendaFixaNum   = parseFloat(config.renda_fixa_mensal) || 0
  const metaBrutaCalc  = calcMetaBruta(metaLiquidaNum, custoFixoNum, rendaFixaNum)

  return (
    <div className="anim-fade" style={{ maxWidth: '640px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em', marginBottom: '4px' }}>
        Configurações
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '20px' }}>
        Perfil, metas e preços de combustível
      </p>

      {saved && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '14px', fontSize: '13px', fontWeight: 600, background: 'rgba(var(--accent-rgb),.08)', color: 'var(--accent)', border: '1px solid rgba(var(--accent-rgb),.2)' }}>
          ✅ Configurações salvas com sucesso!
        </div>
      )}

      {/* PERFIL */}
      <div style={card}>
        <p style={sectionTitle}>👤 Perfil</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={lbl}>Nome</label>
            <input type="text" style={inp} value={profile.nome}
              onChange={e => setProfile({ ...profile, nome: e.target.value })} />
          </div>
          <div style={grid2}>
            <div>
              <label style={lbl}>Cidade</label>
              <input type="text" style={inp} value={profile.cidade}
                onChange={e => setProfile({ ...profile, cidade: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Meta de corridas</label>
              <input type="number" style={inp} value={profile.meta_corridas}
                onChange={e => setProfile({ ...profile, meta_corridas: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      {/* META BRUTA vs LÍQUIDA */}
      <div style={{ ...card, border: '1px solid rgba(var(--accent-rgb),.2)', background: 'linear-gradient(135deg, rgba(var(--accent-rgb),.04) 0%, rgba(13,18,32,.95) 100%)' }}>
        <p style={sectionTitle}>🎯 Meta Mensal</p>
        <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '14px', lineHeight: 1.5 }}>
          Defina quanto quer <strong style={{ color: 'var(--text-2)' }}>lucrar líquido</strong> por mês. O app calcula automaticamente a meta bruta necessária considerando seus custos.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={lbl}>Meta líquida (R$) — o que quer no bolso</label>
            <input type="number" step="0.01" style={inp}
              value={config.meta_liquida}
              placeholder="Ex: 3000,00"
              onChange={e => {
                setConfig({ ...config, meta_liquida: e.target.value })
                setMetaBrutaEditada(false)
              }} />
          </div>

          {/* Card de sugestão */}
          {metaLiquidaNum > 0 && (
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(var(--accent-rgb),.06)', border: '1px solid rgba(var(--accent-rgb),.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>💡 Meta bruta sugerida</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--accent)' }}>
                  R$ {metaBrutaCalc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-3)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span>Meta líquida: <strong style={{ color: 'var(--text-2)' }}>R$ {metaLiquidaNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                <span>+ Custo fixo veículo: <strong style={{ color: 'var(--text-2)' }}>R$ {custoFixoNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                <span>− Renda fixa: <strong style={{ color: 'var(--text-2)' }}>R$ {rendaFixaNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
              </div>
            </div>
          )}

          <div>
            <label style={lbl}>Meta bruta (R$) — editável manualmente</label>
            <input type="number" step="0.01"
              style={{ ...inp, borderColor: metaBrutaEditada ? 'rgba(var(--accent-rgb),.4)' : 'rgba(255,255,255,.1)' }}
              value={config.meta_bruta_sugerida}
              placeholder="Calculado automaticamente"
              onChange={e => {
                setConfig({ ...config, meta_bruta_sugerida: e.target.value })
                setMetaBrutaEditada(true)
              }} />
            {metaBrutaEditada && (
              <button style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => {
                  setMetaBrutaEditada(false)
                  setConfig(prev => ({ ...prev, meta_bruta_sugerida: String(metaBrutaCalc.toFixed(2)) }))
                }}>
                ↩ Restaurar valor sugerido
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RENDA FIXA */}
      <div style={card}>
        <p style={sectionTitle}>💰 Renda Fixa Mensal</p>
        <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '12px', lineHeight: 1.5 }}>
          Salário, benefício ou qualquer renda garantida. Desconta da meta bruta que precisa fazer com corridas.
        </p>
        <div>
          <label style={lbl}>Valor (R$)</label>
          <input type="number" step="0.01" style={inp}
            value={config.renda_fixa_mensal}
            onChange={e => {
              setConfig({ ...config, renda_fixa_mensal: e.target.value })
              setMetaBrutaEditada(false)
            }}
            placeholder="Ex: 1500,00" />
        </div>
      </div>

      {/* COMBUSTÍVEL */}
      <div style={card}>
        <p style={sectionTitle}>⛽ Combustível & Veículo</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={grid2}>
            <div>
              <label style={lbl}>Gasolina (R$/L)</label>
              <input type="number" step="0.01" style={inp} value={config.preco_gasolina}
                onChange={e => setConfig({ ...config, preco_gasolina: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Etanol (R$/L)</label>
              <input type="number" step="0.01" style={inp} value={config.preco_etanol}
                onChange={e => setConfig({ ...config, preco_etanol: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Diesel (R$/L)</label>
              <input type="number" step="0.01" style={inp} value={config.preco_diesel}
                onChange={e => setConfig({ ...config, preco_diesel: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Consumo (km/L)</label>
              <input type="number" step="0.1" style={inp} value={config.consumo_medio}
                onChange={e => setConfig({ ...config, consumo_medio: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={lbl}>Custo fixo veículo/mês (R$)</label>
            <input type="number" step="0.01" style={inp} value={config.custo_fixo_veiculo}
              onChange={e => {
                setConfig({ ...config, custo_fixo_veiculo: e.target.value })
                setMetaBrutaEditada(false)
              }} />
          </div>
        </div>
      </div>

      {/* COR DE DESTAQUE */}
      <div style={card}>
        <p style={sectionTitle}>🎨 Cor de Destaque</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          {[
            { color: '#00FF87', label: 'Verde' },
            { color: '#00D4FF', label: 'Ciano' },
            { color: '#FF4757', label: 'Coral' },
            { color: '#FFB800', label: 'Âmbar' },
            { color: '#A855F7', label: 'Roxo'  },
            { color: '#FF69B4', label: 'Rosa'  },
          ].map(({ color, label }) => (
            <button key={color}
              onClick={() => {
                setConfig({ ...config, accent_color: color })
                document.documentElement.style.setProperty('--accent', color)
                const r = parseInt(color.slice(1,3),16)
                const g = parseInt(color.slice(3,5),16)
                const b = parseInt(color.slice(5,7),16)
                document.documentElement.style.setProperty('--accent-rgb', `${r},${g},${b}`)
              }}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: '50%',
                background: color, border: 'none', cursor: 'pointer',
                boxShadow: config.accent_color === color
                  ? `0 0 0 3px var(--bg-card), 0 0 0 5px ${color}` : 'none',
                transform: config.accent_color === color ? 'scale(1.15)' : 'scale(1)',
                transition: 'all .2s',
              }}
              title={label}
            />
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '12px', textAlign: 'center' }}>
          A cor será aplicada em todo o app
        </p>
      </div>

      <button className="btn-primary" onClick={saveAll}
        style={{ width: '100%', padding: '14px', fontSize: '15px', marginBottom: '12px' }}>
        Salvar Configurações
      </button>

      <button className="btn-danger" onClick={signOut}
        style={{ width: '100%', padding: '14px', fontSize: '14px', justifyContent: 'center' }}>
        🚪 Sair da conta
      </button>
    </div>
  )
}
