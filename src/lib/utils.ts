import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function fmt$(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

export function fmtDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

export function fmtN(value: number, decimals = 1): string {
  return (value || 0).toFixed(decimals).replace('.', ',')
}

export function toDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function getMonthLabel(ym: string): string {
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const [, m] = ym.split('-')
  return months[parseInt(m) - 1]
}

export function getMonthName(date: Date): string {
  return format(date, "MMMM 'de' yyyy", { locale: ptBR })
}
