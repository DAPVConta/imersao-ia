import { LogOut } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { useSair } from '../use-sair'

export function BotaoSair({ email, ...props }: ButtonProps & { email?: string }) {
  const { saindo, sair: executar } = useSair()
  return (
    <Button onClick={executar} disabled={saindo} title={email ? `Sair da conta ${email}` : 'Sair da conta'} {...props}>
      <LogOut /> {saindo ? 'Saindo…' : 'Sair'}
    </Button>
  )
}
