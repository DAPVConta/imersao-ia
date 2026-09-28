import { useEffect, useState } from 'react'

const semAnimacao = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Número que "conta" de 0 até o alvo em 750 ms (respeita "reduzir movimento"). */
export function useContagem(alvo: number, duracao = 750): number {
  const [valor, setValor] = useState(semAnimacao() ? alvo : 0)

  useEffect(() => {
    if (semAnimacao() || isNaN(alvo)) {
      setValor(alvo)
      return
    }
    const inicio = performance.now()
    let quadro = 0
    const passo = (agora: number) => {
      const p = Math.min(1, (agora - inicio) / duracao)
      setValor(alvo * (1 - Math.pow(1 - p, 3)))
      if (p < 1) quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [alvo, duracao])

  return valor
}
