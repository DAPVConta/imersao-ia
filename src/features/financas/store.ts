import { criarStore } from '@/lib/store'
import { mesVazio } from './calculos'
import { REGRAS_PADRAO } from './classificacao'
import type { BaseLocal, Mes } from './tipos'

/** Mesma chave da versão anterior: quem já usava não perde o que tinha. */
export const CHAVE_LOCAL = 'fin_dashboard_v1'

function carregar(): BaseLocal {
  try {
    const bruto = localStorage.getItem(CHAVE_LOCAL)
    if (bruto) {
      const salvo = JSON.parse(bruto) as BaseLocal
      if (!Array.isArray(salvo.agenda)) salvo.agenda = [] // backups anteriores à agenda
      if (!salvo.rules) salvo.rules = structuredClone(REGRAS_PADRAO)
      if (!salvo.months) salvo.months = {}
      return salvo
    }
  } catch {
    /* localStorage indisponível ou corrompido: começa do zero */
  }
  return { months: {}, rules: structuredClone(REGRAS_PADRAO), agenda: [] }
}

export interface EstadoFinancas {
  base: BaseLocal
  /** Mês aberto na tela, 'AAAA-MM' */
  mesAtual: string | null
  /** true até a primeira leitura do banco terminar */
  carregando: boolean
}

export const financas = criarStore<EstadoFinancas>({
  base: carregar(),
  mesAtual: null,
  carregando: true,
})

// Toda mudança na base vai para o localStorage.
let ultimaSalva: BaseLocal | null = null
financas.assinar(() => {
  const { base } = financas.ler()
  if (base === ultimaSalva) return
  ultimaSalva = base
  try {
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify(base))
  } catch {
    /* sem espaço ou modo privado: segue só em memória */
  }
})

export const useFinancas = financas.use

/**
 * Altera a base numa cópia (nunca no estado atual) e publica o resultado.
 * Dentro de `mudar` pode mutar à vontade: é uma cópia.
 */
export function alterarBase(mudar: (base: BaseLocal) => void) {
  financas.definir((e) => {
    const copia = structuredClone(e.base)
    mudar(copia)
    return { ...e, base: copia }
  })
}

export function escolherMes(chave: string | null) {
  financas.definir((e) => ({ ...e, mesAtual: chave }))
}

/** Garante que o mês existe dentro de uma base (use dentro de alterarBase). */
export function garantirMes(base: BaseLocal, chave: string): Mes {
  if (!base.months[chave]) base.months[chave] = mesVazio()
  return base.months[chave]
}
