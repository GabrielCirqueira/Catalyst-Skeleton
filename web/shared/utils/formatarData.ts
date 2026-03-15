import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Formata uma string ISO ou Date para exibição no formato brasileiro.
 *
 * @example formatarData('2024-01-15T10:30:00') → '15/01/2024'
 */
export function formatarData(data: string | Date, padrao = 'dd/MM/yyyy'): string {
  const d = typeof data === 'string' ? parseISO(data) : data
  return format(d, padrao, { locale: ptBR })
}

/**
 * Formata uma string ISO ou Date com hora.
 *
 * @example formatarDataHora('2024-01-15T10:30:00') → '15/01/2024 às 10:30'
 */
export function formatarDataHora(data: string | Date): string {
  return formatarData(data, "dd/MM/yyyy 'às' HH:mm")
}

/**
 * Retorna tempo relativo em português.
 *
 * @example tempoRelativo('2024-01-15T10:30:00') → 'há 3 dias'
 */
export function tempoRelativo(data: string | Date): string {
  const d = typeof data === 'string' ? parseISO(data) : data
  return formatDistanceToNow(d, { locale: ptBR, addSuffix: true })
}
