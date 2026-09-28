import { Alert } from '@/components/ui/alert'
import { useAviso } from '@/lib/avisos'

/** Mostra a mensagem mais recente (sucesso ou erro) no topo do conteúdo. */
export function FaixaAviso() {
  const aviso = useAviso()
  if (!aviso) return null
  return (
    <Alert key={aviso.id} variant={aviso.tipo}>
      {aviso.conteudo}
    </Alert>
  )
}
