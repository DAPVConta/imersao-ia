import type { Lancamento } from '@/features/financas/tipos'

/**
 * Algo previsto: ainda não aconteceu, então fica fora dos totais do mês.
 * Mesmo formato de `Lancamento` (chaves em inglês — ver financas/tipos.ts),
 * porque é guardado no mesmo localStorage.
 */
export interface Agendamento extends Lancamento {
  /** id da linha em `agenda.agendamentos` no Supabase; null enquanto não subiu. */
  dbId: string | null
  /** Em algo que se repete todo mês: qual das vezes é esta (1, 2, 3...). */
  parcela?: number
  /** ...e quantas vezes são ao todo. */
  parcelas?: number
}

/** O que muda quando algo previsto de fato acontece (pode ter sido em outro dia ou valor). */
export interface Realizado {
  /** AAAA-MM-DD */
  data: string
  valor: number
}
