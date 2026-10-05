import { criarStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { lerRetornoDoLink } from './mensagens'

export interface EstadoAcesso {
  /** Voltou pelo link "esqueci minha senha": mostrar a tela de nova senha. */
  trocandoSenha: boolean
  /** Erro que veio no endereço (link expirado, por exemplo). */
  erroDoLink: string | null
}

// Lido na carga do módulo, antes de o supabase-js limpar o endereço.
const retorno = lerRetornoDoLink(typeof window === 'undefined' ? '' : window.location.hash)

export const acesso = criarStore<EstadoAcesso>({
  trocandoSenha: retorno.recuperacao,
  erroDoLink: retorno.erro,
})

if (retorno.erro) history.replaceState(null, '', window.location.pathname + window.location.search)

supabase.auth.onAuthStateChange((evento) => {
  if (evento === 'PASSWORD_RECOVERY') acesso.definir((e) => ({ ...e, trocandoSenha: true }))
  if (evento === 'SIGNED_OUT') acesso.definir((e) => ({ ...e, trocandoSenha: false }))
})

export const useAcesso = acesso.use
