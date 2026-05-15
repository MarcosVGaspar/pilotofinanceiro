'use client'
import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { fmt$ } from '@/lib/utils'

const COLORS = [
  '#00FF87','#00D4FF','#FFB800','#FF4757','#4ade80',
  '#a78bfa','#f472b6','#fb923c','#22d3ee','#facc15',
  '#f87171','#a3e635','#60a5fa','#c084fc'
]

const CAT: Record<string, string> = {
  moradia:'Moradia', energia:'Energia', agua:'Água',
  internet_telefone:'Internet', manutencao_veiculo:'Manutenção',
  combustivel:'Combustível', seguro:'Seguro', impostos:'Impostos',
  alimentacao:'Alimentação', saude:'Saúde', educacao:'Educação',
  lazer:'Lazer', cartao_credito:'Cartão', outros:'Outros',
}

const TT = {
  contentStyle: {
    background:'rgba(13,18,32,.97)',
    border:'1px solid rgba(255,255,255,.12)',
    borderRadius:'12px', color:'#F0F4FF', fontSize:'13px',
  },
  cursor:{ fill:'rgba(255,255,255,.04)' },
}

export default function DashboardCharts({
  chartData, catTotals,
}: {
  chartData: { mes: string; receitas: number; despesas: number }[]
  catTotals: Record<string, number>
}) {
  const donut = Object.entries(catTotals)
    .filter(([,v]) => v > 0)
    .map(([k,v]) => ({ name: CAT[k]||k, value: v }))
    .sort((a,b) => b.value - a.value)

  const total = donut.reduce((a, d) => a + d.value, 0)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

      {/* Bar Chart */}
      <div className="glass-card anim-up delay-1" style={{ padding:'20px', overflow:'hidden' }}>
        <div style={{ marginBottom:'16px' }}>
          <p style={{ fontFamily:'var(--font-display)', fontSize:'14px', fontWeight:700, color:'var(--text-1)' }}>
            Receitas vs Despesas
          </p>
          <p style={{ fontSize:'12px', color:'var(--text-3)', marginTop:'3px' }}>Últimos 6 meses</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barGap={4} barCategoryGap="30%">
            <XAxis dataKey="mes" stroke="transparent"
              tick={{ fill:'#4A5A7A', fontSize:11 }}
              axisLine={false} tickLine={false} />
            <YAxis stroke="transparent"
              tick={{ fill:'#4A5A7A', fontSize:10 }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip {...TT} formatter={(v:number) => fmt$(v)} />
            <Bar dataKey="receitas" name="Receitas" fill="var(--accent)" radius={[6,6,0,0]} opacity={.85}/>
            <Bar dataKey="despesas" name="Despesas" fill="#FF4757" radius={[6,6,0,0]} opacity={.85}/>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display:'flex', gap:'16px', marginTop:'8px', justifyContent:'center' }}>
          {[['Receitas','var(--accent)'],['Despesas','#FF4757']].map(([l,c]) => (
            <div key={l} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <div style={{ width:10, height:10, borderRadius:3, background:c }} />
              <span style={{ fontSize:'11px', color:'var(--text-3)', fontWeight:600 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Donut Chart */}
      <div className="glass-card anim-up delay-2" style={{ padding:'20px', overflow:'hidden' }}>
        <p style={{ fontFamily:'var(--font-display)', fontSize:'14px', fontWeight:700, color:'var(--text-1)', marginBottom:'16px' }}>
          Distribuição por Categoria
        </p>
        {donut.length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }}>

            {/* Donut centralizado */}
            <div style={{ width:'100%', maxWidth:'200px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={donut} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={2} dataKey="value" strokeWidth={0}
                  >
                    {donut.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={TT.contentStyle} formatter={(v:number) => fmt$(v)}/>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Lista de categorias */}
            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'8px' }}>
              {donut.slice(0,6).map((d,i) => {
                const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : '0'
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'10px', height:'10px', borderRadius:'3px', background:COLORS[i%COLORS.length], flexShrink:0 }}/>
                    <span style={{ fontSize:'13px', color:'var(--text-2)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.name}</span>
                    <span style={{ fontSize:'11px', color:'var(--text-3)', flexShrink:0 }}>{pct}%</span>
                    <span style={{ fontSize:'13px', fontWeight:700, color:'var(--text-1)', flexShrink:0 }}>{fmt$(d.value)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ padding:'24px 0' }}>
            <div className="empty-icon">💳</div>
            <p className="empty-text">Sem despesas este mês</p>
          </div>
        )}
      </div>
    </div>
  )
}
