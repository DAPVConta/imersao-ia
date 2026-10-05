import { supabase } from '@/lib/supabase'
import { mensagemDeErro } from './mensagens'

/**
 * Único lugar que fala com o Supabase Auth. As funções lançam Error com a
 * mensagem já em português, pronta para a tela.
 */

export async function entrar(email: string, senha: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
  if (error) throw new Error(mensagemDeErro(error))
}

export async function sair() {
  // scope 'local': sai só deste navegador (os outros aparelhos continuam logados).
  const { error } = await supabase.auth.signOut({ scope: 'local' })
  if (error) throw new Error(mensagemDeErro(error))
}

/** Envia o e-mail com o link para criar uma senha nova. Volta para este site. */
export async function pedirLinkDeNovaSenha(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: window.location.origin + '/',
  })
  if (error) throw new Error(mensagemDeErro(error))
}

export async function definirNovaSenha(senha: string) {
  const { error } = await supabase.auth.updateUser({ password: senha })
  if (error) throw new Error(mensagemDeErro(error))
}

/** true se o e-mail logado está na lista de membros da casa (acesso.membros). */
export async function tenhoAcesso(): Promise<boolean> {
  const { data, error } = await supabase.rpc('tenho_acesso')
  if (error) throw new Error(`Não foi possível conferir o acesso (${error.message}).`)
  return data === true
}
