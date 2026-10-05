import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !chave) {
  throw new Error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (veja o arquivo .env).')
}

/**
 * Cliente único do Supabase para o app inteiro — nunca crie outro.
 *
 * Usa a chave PUBLICÁVEL: quem protege os dados é a RLS do banco. Depois do
 * login (Supabase Auth), o cliente manda o token do usuário sozinho em cada
 * requisição; sem login (papel `anon`) o banco não entrega nada.
 */
export const supabase = createClient<Database>(url, chave, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/** Transforma o erro do Supabase numa mensagem curta para mostrar na tela. */
export function erroDoBanco(erro: { message: string; code?: string } | null, onde: string): Error {
  const detalhe = erro ? `${erro.code ? erro.code + ' — ' : ''}${erro.message}` : 'erro desconhecido'
  return new Error(`${onde}: ${detalhe}`.slice(0, 220))
}
