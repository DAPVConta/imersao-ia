/**
 * Modelo de dados do painel no navegador.
 *
 * ATENÇÃO: os nomes das chaves (months, transactions, desc, value...) estão em
 * inglês porque é o formato já gravado no localStorage ('fin_dashboard_v1') e
 * nos backups JSON da versão anterior. Mudar os nomes faria o dono perder o que
 * está salvo no navegador. Código novo usa português; estas chaves ficam.
 */
import type { Agendamento } from '@/features/agenda/tipos'
import type { Enums } from '@/types/database'

export type { Agendamento }

export type TipoLancamento = Enums<'tipo_lancamento'> // receita | despesa | transferencia
export type Origem = Enums<'origem_lancamento'> // conta | cartao

export interface Lancamento {
  id: string
  /** DD/MM/AAAA */
  date: string
  desc: string
  type: TipoLancamento
  source: Origem
  category: string
  /** Sempre positivo; o sinal vem de `type`. */
  value: number
}

export interface ResumoConta {
  saldoAnterior: number | null
  saldoFinal: number | null
}

export interface ResumoCartao {
  vencimento: string
  fechamento: string
  saldoAnterior: number | null
  pagamento: number | null
  comprasPeriodo: number | null
  total: number | null
  limiteTotal: number | null
  pagamentoMinimo: number | null
}

export interface Mes {
  bank: ResumoConta
  card: ResumoCartao
  transactions: Lancamento[]
}

export interface Regra {
  cat: string
  label: string
  type?: TipoLancamento
}

export interface Regras {
  cnpj: Record<string, Regra>
  mcc: Record<string, Regra>
}

export interface BaseLocal {
  /** Chave 'AAAA-MM' */
  months: Record<string, Mes>
  rules: Regras
  agenda: Agendamento[]
  /** Meses já puxados do banco uma vez (para exclusão local não "voltar"). */
  sincronizados?: Record<string, boolean>
}

export interface Totais {
  receitas: number
  despesas: number
  saldo: number
  porCategoria: Record<string, number>
}

/** Lançamento ainda não confirmado (pré-visualização de importação). */
export type LancamentoNovo = Omit<Lancamento, 'id'>
