import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { entrar, pedirLinkDeNovaSenha } from '../banco'
import { acesso, useAcesso } from '../store'
import { Moldura } from './moldura'

type Modo = 'entrar' | 'esqueci'

/** Tela de login: e-mail e senha, e o caminho para quem esqueceu a senha. */
export function TelaDeEntrada() {
  const erroDoLink = useAcesso((e) => e.erroDoLink)
  const [modo, setModo] = useState<Modo>('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(erroDoLink)
  const [linkEnviado, setLinkEnviado] = useState(false)

  const trocarModo = (novo: Modo) => {
    setModo(novo)
    setErro(null)
    setLinkEnviado(false)
    acesso.definir((e) => ({ ...e, erroDoLink: null }))
  }

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setErro(null)
    try {
      if (modo === 'entrar') {
        await entrar(email, senha)
        // A sessão nova chega pelo onAuthStateChange e o App troca de tela sozinho.
      } else {
        await pedirLinkDeNovaSenha(email)
        setLinkEnviado(true)
      }
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : String(falha))
    } finally {
      setEnviando(false)
    }
  }

  const entrando = modo === 'entrar'

  return (
    <Moldura
      titulo={entrando ? 'Entre para ver as contas da casa' : 'Criar uma senha nova'}
      dica={entrando
        ? 'Use o e-mail e a senha da sua conta no painel.'
        : 'Digite o e-mail da sua conta. Mandamos um link para você escolher uma senha nova.'}
    >
      {erro && <Alert variant="erro">{erro}</Alert>}
      {linkEnviado && (
        <Alert variant="ok">
          Se esse e-mail tiver conta, o link chega em alguns minutos. Confira também a caixa de spam.
        </Alert>
      )}

      <form onSubmit={enviar} className="grid gap-4">
        <div>
          <Label htmlFor="acesso-email">E-mail</Label>
          <Input
            id="acesso-email" type="email" autoComplete="email" required autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {entrando && (
          <div>
            <Label htmlFor="acesso-senha">Senha</Label>
            <Input
              id="acesso-senha" type="password" autoComplete="current-password" required
              value={senha} onChange={(e) => setSenha(e.target.value)}
            />
          </div>
        )}
        <Button type="submit" variant="default" disabled={enviando} className="mt-1 h-10 w-full">
          {entrando ? (enviando ? 'Entrando…' : 'Entrar') : (enviando ? 'Enviando…' : 'Enviar link por e-mail')}
        </Button>
      </form>

      <Button variant="link" className="mt-5 px-0" onClick={() => trocarModo(entrando ? 'esqueci' : 'entrar')}>
        {entrando ? 'Esqueci minha senha' : 'Voltar para entrar'}
      </Button>
    </Moldura>
  )
}
