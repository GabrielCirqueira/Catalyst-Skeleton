/**
 * Formata um número como moeda brasileira (BRL).
 *
 * @example formatarMoeda(1500.50) → 'R$ 1.500,50'
 * @example formatarMoeda(1500.50, 'USD') → 'US$ 1,500.50'
 */
export function formatarMoeda(valor: number, moeda = 'BRL', locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: moeda,
  }).format(valor)
}

/**
 * Formata um número como percentual.
 *
 * @example formatarPercentual(0.1543) → '15,43%'
 */
export function formatarPercentual(valor: number, casasDecimais = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(valor)
}

/**
 * Formata um número inteiro com separador de milhar.
 *
 * @example formatarNumero(1500000) → '1.500.000'
 */
export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor)
}
