import { Button } from '@/components/ui/button'
import { Moldura } from './moldura'
import { BotaoSair } from './botao-sair'

/** Conta válida, mas o e-mail não está na lista de membros da casa. */
export function SemAcesso({ email }: { email: string }) {
  return (
    <Moldura
      titulo="Esta conta ainda não tem acesso"
      dica={<>Você entrou como <strong className="font-semibold text-ink">{email}</strong>, mas esse e-mail não está na lista de pessoas da casa.</>}
    >
      <p className="mb-6 max-w-[62ch] text-[14px] text-ink-2">
        Peça ao dono do painel para incluir esse e-mail. Depois disso, é só recarregar a página.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="default" onClick={() => window.location.reload()}>Recarregar a página</Button>
        <BotaoSair variant="outline" />
      </div>
    </Moldura>
  )
}
