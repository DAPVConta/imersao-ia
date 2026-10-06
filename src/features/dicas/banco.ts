/**
 * Único lugar que fala com o servidor sobre as dicas da IA. Quem faz o
 * trabalho é a Edge Function `supabase/functions/dicas-financeiras`: ela lê
 * os dados da casa e pergunta ao Claude. A chave da IA fica no Supabase
 * (segredo `claude_api`) e nunca chega ao navegador.
 */
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { DicasDaIA } from './tipos'

export async function pedirDicas(): Promise<DicasDaIA> {
  const { data, error } = await supabase.functions.invoke<DicasDaIA>('dicas-financeiras', { method: 'POST' })
  if (error) {
    // A função responde { erro: '...' } já em português; mostra essa frase.
    if (error instanceof FunctionsHttpError) {
      const corpo = await (error.context as Response).json().catch(() => null) as { erro?: string } | null
      if (corpo?.erro) throw new Error(corpo.erro)
    }
    throw new Error('Não foi possível falar com o assistente agora. Confira a internet e tente de novo.')
  }
  if (!data || !Array.isArray(data.dicas)) throw new Error('O assistente respondeu num formato inesperado. Tente de novo.')
  return data
}
