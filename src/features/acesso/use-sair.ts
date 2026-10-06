import { useState } from 'react'
import { avisar } from '@/lib/avisos'
import { sair } from './banco'

/** Sai da conta neste navegador e recarrega na tela de entrada. */
export function useSair() {
  const [saindo, setSaindo] = useState(false)
  const executar = async () => {
    setSaindo(true)
    try {
      await sair()
      // Recarrega para começar limpo na próxima entrada.
      window.location.replace('/')
    } catch (e) {
      avisar(e instanceof Error ? e.message : String(e), 'erro')
      setSaindo(false)
    }
  }
  return { saindo, sair: executar }
}
