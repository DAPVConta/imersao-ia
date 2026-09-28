// Clientes do Supabase dentro de Edge Functions (Deno).
import { createClient } from 'npm:@supabase/supabase-js@2'

/**
 * Cliente que age COMO QUEM CHAMOU: repassa o token do usuário (ou o anon),
 * então a RLS continua valendo. É o padrão — use este sempre que possível.
 */
export function clienteDoUsuario(req: Request) {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
}

/**
 * Cliente ADMINISTRADOR (ignora a RLS). Só para tarefas de servidor que
 * realmente precisam; a chave nunca sai da função nem vai para o navegador.
 */
export function clienteAdmin() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
}
