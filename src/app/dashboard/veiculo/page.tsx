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
    if (v) setFormVeiculo({ modelo: v.modelo || '', placa: v.placa || '', tipo_combustivel: v.tipo_combustivel || 'flex', consumo_declarado: String(v.consumo_declarado || ''), odometro_atual: String(v.odometro_atual || '') })
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

  const S = {
    label: { display: 'block' as const, fontSize: '11px', fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: '.1em', color: 'var(--text-3)', marginBottom: '7px' },
    input: { width: '100%', padding: '11px 16px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', color: 'var(--text-1)', fontFamily: 'inherit', fontSize: '14px', outline: 'none', appearance: 'none' as const },
  }

  return (
    <div className="anim-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Veículo</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '4px' }}>{veiculo?.modelo || 'Configure seu veículo'}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => { setFormType('veiculo'); setShowForm(true) }}>⚙️ Veículo</button>
          <button className="btn-secondary" onClick={() => { setFormType('abast'); setShowForm(true) }}>⛽ Abastecimento</button>
          <button className="btn-primary" onClick={() => { setFormType('manut'); setShowForm(true) }}>🔧 Manutenção</button>
        </div>
      </div>

      {veiculo && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Modelo',      value: veiculo.modelo },
            { label: 'Placa',       value: veiculo.placa || '–' },
            { label: 'Combustível', value: veiculo.tipo_combustivel },
            { label: 'Odômetro',    value: `${Number(veiculo.odometro_atual || 0).toLocaleString('pt-BR')} km` },
