import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { avisar } from '@/lib/avisos'
import { definirNovaSenha } from '../banco'
import { acesso } from '../store'
import { Moldura } from './moldura'

const MINIMO = 8

/** Aparece quando a pessoa volta pelo link "Esqueci minha senha" do e-mail. */
export function NovaSenha({ email }: { email: string }) {
  const [senha, setSenha] = useState('')
  const [repetida, setRepetida] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    if (senha.length < MINIMO) return setErro(`A senha precisa ter pelo menos ${MINIMO} caracteres.`)
    if (senha !== repetida) return setErro('As duas senhas estão diferentes. Digite a mesma nos dois campos.')
    setEnviando(true)
    setErro(null)
    try {
      await definirNovaSenha(senha)
      acesso.definir((s) => ({ ...s, trocandoSenha: false }))
      avisar('Senha nova salva. Use ela da próxima vez que entrar.')
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : String(falha))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Moldura titulo="Escolha sua senha nova" dica={<>Conta {email}. Use pelo menos {MINIMO} caracteres.</>}>
      {erro && <Alert variant="erro">{erro}</Alert>}
      <form onSubmit={enviar} className="grid gap-4">
        {/* Campo escondido: ajuda o gerenciador de senhas a saber de qual conta é a senha. */}
        <input type="email" autoComplete="username" value={email} readOnly hidden />
        <div>
          <Label htmlFor="nova-senha">Senha nova</Label>
          <Input id="nova-senha" type="password" autoComplete="new-password" required autoFocus minLength={MINIMO}
            value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="nova-senha-2">Repita a senha nova</Label>
          <Input id="nova-senha-2" type="password" autoComplete="new-password" required minLength={MINIMO}
            value={repetida} onChange={(e) => setRepetida(e.target.value)} />
        </div>
        <Button type="submit" variant="default" disabled={enviando} className="mt-1 h-10 w-full">
          {enviando ? 'Salvando…' : 'Salvar senha nova'}
        </Button>
      </form>
    </Moldura>
  )
}
