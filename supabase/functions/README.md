# Edge Functions

Código que roda no servidor do Supabase (Deno), para o que **não pode** rodar
no navegador: usar chave secreta, chamar API de terceiros com credencial,
processar arquivo pesado, tarefas agendadas.

Funções publicadas:

- `dicas-financeiras` — botão "Dicas da IA" do Painel. Confere se quem chamou é
  membro da casa, lê os números como esse usuário (RLS vale) e pede dicas ao
  Claude (SDK `@anthropic-ai/sdk`, versão fixa). Usa o segredo `claude_api`.

Esta pasta também traz o que toda função usa:

- `_shared/cors.ts` — cabeçalhos para o navegador poder chamar a função;
- `_shared/supabase.ts` — cliente "como o usuário" (respeita RLS) e cliente
  administrador (ignora RLS; usar só quando inevitável).

## Criar uma função

```
supabase/functions/<nome-em-kebab-case>/index.ts
```

```ts
import { json, responderPreflight } from '../_shared/cors.ts'
import { clienteDoUsuario } from '../_shared/supabase.ts'

Deno.serve(async (req) => {
  const preflight = responderPreflight(req)
  if (preflight) return preflight
  const supabase = clienteDoUsuario(req)
  const { data, error } = await supabase.from('categorias').select('nome')
  if (error) return json({ erro: error.message }, 400)
  return json({ data })
})
```

No front: `supabase.functions.invoke('<nome>', { body: {...} })`.

## Publicar

Pelo MCP do Supabase (`deploy_edge_function`) ou pela CLI:
`supabase functions deploy <nome> --project-ref ygknsbttphqnrwnywcak`.
Segredos (chaves de terceiros) ficam em *Project Settings → Edge Functions →
Secrets*, nunca no código.
