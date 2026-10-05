import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { avisar } from '@/lib/avisos'
import { sair } from '../banco'

/** Sai da conta neste navegador e volta para a tela de entrada. */
export function BotaoSair({ email, ...props }: ButtonProps & { email?: string }) {
  const [saindo, setSaindo] = useState(false)
  const clicar = async () => {
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
  return (
    <Button onClick={clicar} disabled={saindo} title={email ? `Sair da conta ${email}` : 'Sair da conta'} {...props}>
      <LogOut /> {saindo ? 'Saindo…' : 'Sair'}
    </Button>
  )
}
