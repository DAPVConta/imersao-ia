import { flushSync } from 'react-dom'
import { escolherMes, financas } from './store'

type DocumentoComTransicao = Document & { startViewTransition?: (atualizar: () => void) => unknown }

/**
 * Troca o mês aberto. Onde o navegador suporta View Transitions, a troca é um
 * cruzamento suave feito pelo próprio navegador; onde não, troca direto.
 */
export function irParaMes(chave: string | null) {
  if (!chave || chave === financas.ler().mesAtual) return
  const doc = document as DocumentoComTransicao
  const semMovimento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (doc.startViewTransition && !semMovimento) {
    doc.startViewTransition(() => flushSync(() => escolherMes(chave)))
  } else {
    escolherMes(chave)
  }
}

/** Meses existentes, em ordem, e a posição do mês aberto. */
export function vizinhos() {
  const { base, mesAtual } = financas.ler()
  const chaves = Object.keys(base.months).sort()
  const i = mesAtual ? chaves.indexOf(mesAtual) : -1
  return { anterior: i > 0 ? chaves[i - 1] : null, proximo: i >= 0 && i < chaves.length - 1 ? chaves[i + 1] : null }
}
