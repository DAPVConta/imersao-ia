import { useSyncExternalStore } from 'react'

/**
 * Store mínima (mesmo espírito do zustand, sem dependência): um estado
 * imutável, quem quiser escuta, e um hook para os componentes.
 * Regra: nunca mutar o estado — `definir` recebe uma função que devolve o novo.
 */
export function criarStore<T>(inicial: T) {
  let estado = inicial
  const ouvintes = new Set<() => void>()

  const ler = () => estado
  const definir = (proximo: T | ((atual: T) => T)) => {
    estado = typeof proximo === 'function' ? (proximo as (atual: T) => T)(estado) : proximo
    ouvintes.forEach((f) => f())
  }
  const assinar = (f: () => void) => {
    ouvintes.add(f)
    return () => ouvintes.delete(f)
  }
  function useEstado(): T
  function useEstado<S>(seletor: (e: T) => S): S
  function useEstado<S>(seletor?: (e: T) => S) {
    // O seletor deve devolver um valor já existente no estado (não um objeto novo),
    // senão o React entra em laço. Para derivar dados, use useMemo no componente.
    return useSyncExternalStore(assinar, () => (seletor ? seletor(estado) : estado))
  }

  return { ler, definir, assinar, use: useEstado }
}
