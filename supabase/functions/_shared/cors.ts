// Cabeçalhos CORS para Edge Functions chamadas pelo navegador
// (via supabase.functions.invoke). Importar em cada função:
//   import { cors, responderPreflight } from '../_shared/cors.ts'

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

/** Responde o "preflight" (OPTIONS) que o navegador manda antes do POST. */
export function responderPreflight(req: Request): Response | null {
  return req.method === 'OPTIONS' ? new Response('ok', { headers: cors }) : null
}

export function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}
