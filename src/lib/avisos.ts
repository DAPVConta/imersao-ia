import type { ReactNode } from 'react'
import { criarStore } from './store'

/** Faixa de mensagem no topo da página (sucesso ou erro), some sozinha em 6 s. */
export type Aviso = { id: number; tipo: 'ok' | 'erro'; conteudo: ReactNode }

const avisos = criarStore<Aviso | null>(null)
let contador = 0
let temporizador: ReturnType<typeof setTimeout> | undefined

export function avisar(conteudo: ReactNode, tipo: Aviso['tipo'] = 'ok') {
  const id = ++contador
  avisos.definir({ id, tipo, conteudo })
  clearTimeout(temporizador)
  temporizador = setTimeout(() => {
    if (avisos.ler()?.id === id) avisos.definir(null)
  }, 6000)
}

export const useAviso = () => avisos.use()
