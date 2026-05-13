'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ConfigPage() {
  const supabase = createClient()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({
    nome: '', cidade: '', meta_mensal: '', meta_corridas: ''
  })
  const [config, setConfig] = useState({
  preco_gasolina: '', preco_etanol: '',
  preco_diesel: '', consumo_medio: '',
  custo_fixo_veiculo: '', renda_fixa_mensal: ''
})


  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('configuracoes').select('*').eq('user_id', user.id).single(),
      ])
      if (p) setProfile({
        nome: p.nome || '', cidade: p.cidade || '',
        meta_mensal: String(p.meta_mensal || ''),
        meta_corridas: String(p.meta_corridas || '')
      })
      if (c) setConfig({
        preco_gasolina: String(c.preco_gasolina || ''),
        preco_etanol: String(c.preco_etanol || ''),
        preco_diesel: String(c.preco_diesel || ''),
        consumo_medio: String(c.consumo_medio || ''),
        custo_fixo_veiculo: String(c.custo_fixo_veiculo || '')
      })
    }
    load()
  }, [supabase])

  async function saveAll() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await Promise.all([
      supabase.from('profiles').update({
        nome: profile.nome,
        cidade: profile.cidade,
        meta_mensal: parseFloat(profile.meta_mensal) || 0,
        meta_corridas: parseInt(profile.meta_corridas) || 0,
      }).eq('id', user.id),
      supabase.from('configuracoes').update({
        preco_gasolina: parseFloat(config.preco_gasolina) || 0,
        preco_etanol: parseFloat(config.preco_etanol) || 0,
        preco_diesel: parseFloat(config.preco_diesel) || 0,
        consumo_medio: parseFloat(config.consumo_medio) || 0,
        custo_fixo_veiculo: parseFloat(config.custo_fixo_veiculo) || 0,
      }).eq('user_id', user.id),
    ])
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const S = {
    label: { display: 'block' as const, fontSize: '11px', fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: 'var(--text-3)', marginBottom: '7px' },
    input: { width: '100%', padding: '11px 16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', color: 'var(--text-1)', fontFamily: 'inherit', fontSize: '14px', outline: 'none' },
    card: { background: 'rgba(13,18,32,.9)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '20px', padding: '24px', marginBottom: '16px' },
  }

  return (
    <div className="anim-fade" style={{ maxWidth: '640px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em', marginBottom: '4px' }}>
        Configurações
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '24px' }}>
        Perfil, metas e preços de combustível
      </p>

      {saved && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', fontWeight: 600, background: 'rgba(0,255,135,.08)', color: 'var(--accent)', border: '1px solid rgba(0,255,135,.2)' }}>
          ✅ Configurações salvas com sucesso!
        </div>
      )}

      <div style={S.card}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '16px' }}>
          👤 Perfil
        </p>
       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={S.label}>Nome</label>
            <input type="text" style={S.input} value={profile.nome}
              onChange={e => setProfile({ ...profile, nome: e.target.value })} />
          </div>
          <div>
            <label style={S.label}>Cidade</label>
            <input type="text" style={S.input} value={profile.cidade}
              onChange={e => setProfile({ ...profile, cidade: e.target.value })} />
          </div>
          <div>
            <label style={S.label}>Meta mensal (R$)</label>
            <input type="number" step="0.01" style={S.input} value={profile.meta_mensal}
              onChange={e => setProfile({ ...profile, meta_mensal: e.target.value })} />
          </div>
          <div>
            <label style={S.label}>Meta de corridas</label>
            <input type="number" style={S.input} value={profile.meta_corridas}
              onChange={e => setProfile({ ...profile, meta_corridas: e.target.value })} />
          </div>
        </div>
      </div>

     <div style={S.card}>
  <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '16px' }}>
    ⛽ Combustível
  </p>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      <div>
        <label style={S.label}>Gasolina (R$/L)</label>
        <input type="number" step="0.01" style={S.input} value={config.preco_gasolina}
          onChange={e => setConfig({ ...config, preco_gasolina: e.target.value })} />
      </div>
      <div>
        <label style={S.label}>Etanol (R$/L)</label>
        <input type="number" step="0.01" style={S.input} value={config.preco_etanol}
          onChange={e => setConfig({ ...config, preco_etanol: e.target.value })} />
      </div>
      <div>
        <label style={S.label}>Diesel (R$/L)</label>
        <input type="number" step="0.01" style={S.input} value={config.preco_diesel}
          onChange={e => setConfig({ ...config, preco_diesel: e.target.value })} />
      </div>
      <div>
        <label style={S.label}>Consumo (km/L)</label>
        <input type="number" step="0.1" style={S.input} value={config.consumo_medio}
          onChange={e => setConfig({ ...config, consumo_medio: e.target.value })} />
      </div>
    </div>
    <div>
      <label style={S.label}>Custo fixo veículo/mês (R$)</label>
      <input type="number" step="0.01" style={S.input} value={config.custo_fixo_veiculo}
        onChange={e => setConfig({ ...config, custo_fixo_veiculo: e.target.value })} />
    </div>
  </div>
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
