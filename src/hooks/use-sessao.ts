import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Sessão do Supabase Auth (quem está logado). O painel exige login: sem
 * sessão, o Porteiro (features/acesso) mostra a tela de entrada.
 *
 * `sessao` é undefined enquanto carrega e null quando ninguém está logado.
 */
export function useSessao() {
  const [sessao, setSessao] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data } = supabase.auth.onAuthStateChange((_evento, nova) => setSessao(nova))
    return () => data.subscription.unsubscribe()
  }, [])

  return { sessao, usuario: sessao?.user ?? null, carregando: sessao === undefined }
}
