import { useEffect, useState, type ReactNode } from 'react'
import { useSessao } from '@/hooks/use-sessao'
import { tenhoAcesso } from '../banco'
import { useAcesso } from '../store'
import { NovaSenha } from './nova-senha'
import { SemAcesso } from './sem-acesso'
import { TelaDeEntrada } from './tela-de-entrada'

type Situacao = 'conferindo' | 'liberado' | 'negado'

/**
 * Decide o que mostrar: tela de entrada (sem login), nova senha (voltou pelo
 * link do e-mail), aviso de sem acesso (logado, mas fora da lista da casa) ou
 * o painel. Quem protege os dados de verdade é a RLS do banco; isto só evita
 * mostrar uma tela vazia ou cheia de erros.
 */
export function Porteiro({ children }: { children: ReactNode }) {
  const { usuario, carregando } = useSessao()
  const trocandoSenha = useAcesso((e) => e.trocandoSenha)
  const [situacao, setSituacao] = useState<Situacao>('conferindo')
  const idUsuario = usuario?.id

  useEffect(() => {
    if (!idUsuario) return
    let vale = true
    setSituacao('conferindo')
    tenhoAcesso()
      .then((ok) => vale && setSituacao(ok ? 'liberado' : 'negado'))
      // Banco fora do ar: abre o painel, que mostra os dados deste navegador e avisa do erro.
      .catch(() => vale && setSituacao('liberado'))
    return () => {
      vale = false
    }
  }, [idUsuario])

  if (carregando) return <div className="min-h-dvh bg-paper" aria-busy="true" />
  if (!usuario) return <TelaDeEntrada />
  if (trocandoSenha) return <NovaSenha email={usuario.email ?? ''} />
  if (situacao === 'conferindo') return <div className="min-h-dvh bg-paper" aria-busy="true" />
  if (situacao === 'negado') return <SemAcesso email={usuario.email ?? ''} />
  return <>{children}</>
}
