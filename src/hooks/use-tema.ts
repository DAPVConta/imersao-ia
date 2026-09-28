import { useCallback, useEffect, useState } from 'react'

export type Tema = 'auto' | 'light' | 'dark'
const CHAVE = 'fin_theme'
const ORDEM: Tema[] = ['auto', 'light', 'dark']

function lerTema(): Tema {
  try {
    const t = localStorage.getItem(CHAVE)
    return t === 'light' || t === 'dark' ? t : 'auto'
  } catch {
    return 'auto'
  }
}

/** Tema automático → claro → escuro. Aplicado como data-theme no <html>. */
export function useTema() {
  const [tema, setTema] = useState<Tema>(lerTema)

  useEffect(() => {
    if (tema === 'auto') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = tema
    try {
      localStorage.setItem(CHAVE, tema)
    } catch {
      /* ignora */
    }
  }, [tema])

  const alternar = useCallback(() => setTema((t) => ORDEM[(ORDEM.indexOf(t) + 1) % ORDEM.length]), [])
  return { tema, alternar }
}
