'use client'
import React, { useState } from 'react'
import Link from 'next/link'

const steps = [
    {
    icon: '⚙️',
    title: 'Configure seu perfil',
    color: 'var(--cyan)',
    items: [
      'Acesse Mais → Configurações',
      'Preencha seu nome e cidade',
      'Defina sua meta mensal bruta (ex: R$ 5.000)',
      'Defina sua meta líquida — o que quer ter no bolso (ex: R$ 3.500)',
      'Informe sua renda fixa mensal (salário, benefício)',
      'Configure os preços dos combustíveis da sua região',
      'Defina o período de análise da margem histórica (ex: 3 meses)',
      'Marque quais categorias são custos operacionais',
      'Escolha a cor de destaque do app em Cor de Destaque',
      'Salve as configurações',
    ],
    tip: '💡 Com a meta líquida configurada, o sistema calcula automaticamente quanto você precisa faturar em bruto para atingi-la.',
  },

  {
    icon: '🚗',
    title: 'Lançar corridas',
    color: 'var(--accent)',
    items: [
      'Toque em Corridas no menu inferior',
      'Toque em + Nova Corrida',
      'Selecione a plataforma (Uber, 99, InDriver)',
      'Informe a data, quantidade de corridas e valor total',
      'Informe os KM rodados (opcional mas recomendado)',
      'Toque em Salvar',
    ],
    tip: '💡 Lance suas corridas diariamente para que a meta diária seja calculada corretamente.',
  },
  {
    icon: '💰',
    title: 'Lançar rendas extras',
    color: 'var(--success)',
    items: [
      'Acesse Mais → Rendas',
      'Toque em + Nova Renda',
      'Selecione o tipo (Salário, Freelance, Aluguel...)',
      'Informe descrição, valor e data',
      'Para rendas mensais, selecione Recorrência → Mensal',
      'Marque "Já recebido" quando o valor entrar na conta',
    ],
    tip: '💡 Rendas recorrentes aparecem separadas das avulsas para facilitar o controle.',
  },
    {
    icon: '💳',
    title: 'Controlar despesas',
    color: 'var(--danger)',
    items: [
      'Toque em Despesas no menu inferior',
      'Toque em + Nova Despesa',
      'Selecione a categoria (Moradia, Alimentação, Energia...)',
      'Informe descrição, valor, data e forma de pagamento',
      'Para contas fixas, selecione Tipo → Fixa',
      'Para parcelas, selecione Tipo → Parcelada',
      'Marque "Despesa Operacional" se for um custo do trabalho (combustível, manutenção, seguro...)',
      'Despesas operacionais são deduzidas do seu lucro líquido',
    ],
    tip: '💡 Marcar corretamente as despesas operacionais garante que o cálculo de lucro líquido seja preciso.',
  },

  {
    icon: '⛽',
    title: 'Controlar o veículo',
    color: 'var(--warn)',
    items: [
      'Acesse Mais → Veículo',
      'Toque em ⚙️ Veículo para cadastrar seu carro',
      'Registre cada abastecimento com litros e preço/L',
      'O consumo real é calculado automaticamente entre abastecimentos',
      'Registre manutenções com data e próxima revisão',
      'Acompanhe alertas de manutenções próximas',
    ],
    tip: '💡 O custo do veículo é incluído automaticamente no total de despesas do Dashboard.',
  },
    {
    icon: '🎯',
    title: 'Acompanhar a meta diária',
    color: 'var(--accent)',
    items: [
      'Toque em Meta no menu inferior',
      'Veja sua meta diária base (meta mensal ÷ dias do mês)',
      'A meta ajustada recalcula com base no que falta ganhar',
      'Dias verdes = meta atingida naquele dia',
      'Dias vermelhos = ficou abaixo da meta',
      'Quanto mais você supera, menor fica a meta dos dias seguintes',
      'Use o botão Bruto/Líquido para alternar entre as visões',
      'Na visão Líquido veja: meta líquida, meta bruta sugerida e margem histórica',
      'A margem é calculada automaticamente com base no período configurado',
    ],
    tip: '💡 A meta bruta sugerida é calculada com base na sua margem histórica. Se sua margem é 80%, para lucrar R$ 3.000 você precisa faturar R$ 3.750.',
  },

  {
    icon: '📊',
    title: 'Fluxo de caixa',
    color: 'var(--cyan)',
    items: [
      'Acesse Mais → Fluxo de Caixa',
      'Navegue entre meses com as setas ← →',
      'Veja o total de entradas, saídas e saldo do mês',
      'O gráfico mostra a evolução do saldo dia a dia',
      'No extrato veja todas as movimentações em ordem',
      'Entradas ficam em verde, saídas em vermelho',
    ],
    tip: '💡 Use o fluxo de caixa para planejar os próximos meses.',
  },
    {
    icon: '◉',
    title: 'Dashboard principal',
    color: 'var(--accent)',
    items: [
      'O Dashboard mostra um resumo do mês atual',
      'Use o botão Bruto/Líquido para alternar a visão',
      'Visão Bruta: total de corridas, rendas, despesas e ticket médio',
      'Visão Líquida: faturamento, custo operacional, lucro líquido e margem',
      'Barra de progresso da meta mensal',
      'Gráfico comparando receitas vs despesas dos últimos 6 meses',
      'Gráfico de pizza com distribuição das despesas por categoria',
    ],
    tip: '💡 A visão líquida mostra o que realmente sobra no seu bolso depois de descontar os custos operacionais do trabalho.',
  },
  {
    icon: '🎨',
    title: 'Personalizar o tema',
    color: '#A855F7',
    items: [
      'Acesse Mais → Configurações',
      'Role até a seção Cor de Destaque',
      'Escolha entre 6 cores: Verde, Ciano, Coral, Âmbar, Roxo ou Rosa',
      'A cor é aplicada instantaneamente em todo o app',
      'Salve as configurações para manter a cor escolhida',
    ],
    tip: '💡 A cor escolhida é salva na sua conta e aparece em qualquer dispositivo que você usar.',
  },
]

export default function TutorialPage() {

  const [openStep, setOpenStep] = useState<number | null>(0)

  return (
    <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em', marginBottom: '4px' }}>
        Tutorial
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '24px' }}>
        Aprenda a usar o PilotoFinanceiro no dia a dia
      </p>

      {/* Progresso */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '8px', fontWeight: 600 }}>
          GUIA RÁPIDO — {steps.length} seções
        </p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {steps.map((s, i) => (
            <button key={i} onClick={() => setOpenStep(openStep === i ? null : i)}
              style={{
                padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', border: '1px solid',
                borderColor: openStep === i ? s.color : 'rgba(255,255,255,.1)',
                background: openStep === i ? `${s.color}15` : 'transparent',
                color: openStep === i ? s.color : 'var(--text-3)',
                transition: 'all .2s',
              }}>
              {s.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {steps.map((step, i) => (
          <div key={i} className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
            {/* Header */}
            <button onClick={() => setOpenStep(openStep === i ? null : i)}
              style={{
                width: '100%', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left',
              }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${step.color}15`, fontSize: '20px',
                border: `1px solid ${step.color}30`,
              }}>
                {step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>
                  {i + 1}. {step.title}
                </p>
              </div>
              <span style={{ color: 'var(--text-3)', fontSize: '20px', transition: 'transform .2s', transform: openStep === i ? 'rotate(90deg)' : 'rotate(0)' }}>›</span>
            </button>

            {/* Content */}
            {openStep === i && (
              <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {step.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `${step.color}20`, fontSize: '11px', fontWeight: 800,
                        color: step.color, border: `1px solid ${step.color}30`,
                      }}>
                        {j + 1}
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.5, paddingTop: '2px' }}>{item}</p>
                    </div>
                  ))}
                </div>

                {/* Tip */}
                <div style={{
                  marginTop: '16px', padding: '12px 14px', borderRadius: '10px',
                  background: `${step.color}08`, border: `1px solid ${step.color}20`,
                }}>
                  <p style={{ fontSize: '13px', color: step.color, lineHeight: 1.5 }}>{step.tip}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ marginTop: '20px', padding: '20px', borderRadius: '16px', textAlign: 'center', background: 'rgba(0,255,135,.05)', border: '1px solid rgba(0,255,135,.15)' }}>
        <p style={{ fontSize: '24px', marginBottom: '8px' }}>🚗💨</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '6px' }}>
          Pronto para começar!
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '16px' }}>
          Configure seu perfil e lance sua primeira corrida
        </p>
        <Link href="/dashboard/configuracoes" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            Ir para Configurações →
          </button>
        </Link>
      </div>
    </div>
  )
}
