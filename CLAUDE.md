# Assistente Financeiro — instruções do projeto

## Regras de trabalho

**Publicar sempre.** Toda alteração concluída vai para produção sem precisar
perguntar. O fluxo é: rodar as verificações (abaixo) → commit → push para
`claude/financial-assistant-dashboard-kngtdk` (é o ramo de produção na Vercel)
→ a Vercel constrói e publica sozinha → confirmar que o deploy ficou `READY`
e abrir o site antes de responder. Nunca deixar mudança pronta parada no
repositório. Se o trabalho for feito em outro ramo, levar para o de produção
com merge (sem reescrever histórico).

**Falar de forma simples.** O dono do projeto não é desenvolvedor. Explicar em
português claro, sem jargão, dizendo o que mudou e o que ele precisa fazer.
Quando um termo técnico for inevitável, explicar o que significa.

**Conferir antes de afirmar.** Não dizer que algo está no ar sem checar o estado
do deploy, nem que algo funciona sem ter testado.

## Stack

| Camada | Tecnologia |
|---|---|
| Front | React 18 + TypeScript (strict) + Vite 6 |
| Estilo | Tailwind CSS 3 + shadcn/ui (Radix UI) + CVA (`class-variance-authority`) |
| Rotas | React Router 6 (`src/rotas.tsx`) |
| Back | Supabase: Postgres (+RLS), Auth, Storage, Edge Functions |
| Deploy | Vercel, ligada ao GitHub (`dapvcontas-projects/imersao-ia`) |
| Testes | Vitest (regras de negócio) + Playwright (tela) |

Versões fixas de propósito: **Tailwind 3** (não 4) e **tailwind-merge 2** (a 3
é para Tailwind 4 e apaga classes como `outline` sem avisar). React 18.

## Comandos

```bash
npm install          # depois de clonar
npm run dev          # site local em http://localhost:5173
npm run build        # checa tipos (tsc) e gera dist/ — é o que a Vercel roda
npm run lint         # ESLint
npm test             # Vitest
npm run preview      # serve o dist/ em http://localhost:4173
```

**Antes de todo push:** `npm run lint && npm test && npm run build` sem erros.

## Onde as coisas estão

```
index.html                 casca HTML (Vite injeta o app aqui)
public/                    arquivos servidos como estão (favicon.svg)
src/
  main.tsx                 liga o React, fontes e CSS
  App.tsx                  cabeçalho + rotas + rodapé; chama iniciar()
  rotas.tsx                mapa de páginas (endereço → página)
  index.css                TOKENS DE COR (claro/escuro) e estilos globais
  pages/                   uma página por rota (painel.tsx = "/")
  components/
    ui/                    componentes shadcn/ui (button, card, select, tabs, dialog...)
    layout/                cabeçalho, rodapé, logo, faixa de aviso
  features/<modulo>/       tudo de um assunto junto:
    tipos.ts               tipos do módulo
    banco.ts               ÚNICO lugar que fala com o Supabase sobre o módulo
    acoes.tsx              o que acontece quando o usuário clica (muda estado + banco + aviso)
    store.ts               estado do módulo (se precisar)
    *.ts                   regras puras (cálculo, classificação) — com *.test.ts ao lado
    components/            componentes visuais do módulo
  hooks/                   hooks genéricos (tema, contagem, sessão do Auth)
  lib/                     utilitários: supabase.ts, datas.ts, formato.ts, avisos.ts, store.ts, versao.ts
  types/database.ts        tipos do banco — GERADO, não editar à mão
supabase/
  migrations/              esquema e políticas do banco (fonte da verdade)
  functions/               Edge Functions (Deno) + _shared/
vercel.json                build, cache e rotas da Vercel
.env                       URL e chave PUBLICÁVEL do Supabase (pode ficar no git)
```

Módulos que existem hoje: `financas` (dados, banco, regras), `painel`
(gráficos e tabelas), `importacao` (manual, PDF, CSV, regras), `agenda`.

## Como criar um módulo novo

1. Pasta `src/features/<nome>/` com `tipos.ts`, `banco.ts`, `components/`.
2. Se precisar de tabela nova: migração em `supabase/migrations/`
   (`AAAAMMDDHHMMSS_descricao_em_portugues.sql`), aplicar pelo MCP do Supabase
   (`apply_migration`), **habilitar RLS** e escrever as políticas na mesma
   migração. Depois regenerar `src/types/database.ts`
   (MCP `generate_typescript_types` ou `npm run gerar-tipos`).
3. Página em `src/pages/<nome>.tsx` e rota em `src/rotas.tsx`; link no
   `Cabecalho` se for uma área nova.
4. Regras de cálculo em funções puras com teste `*.test.ts` ao lado.
5. Testar a tela com Playwright (seção "Como testar"), subir `VERSAO_APP`,
   atualizar o README.md e publicar.

## Convenções de código

- **Português** em nomes de arquivo (kebab-case), funções, variáveis e
  comentários, como no banco. Componentes em PascalCase. Exceção: os
  componentes de `components/ui/` mantêm os nomes do shadcn (Button, Card...).
- Exceção importante: em `features/financas/tipos.ts` as chaves `months`,
  `transactions`, `desc`, `value`, `bank`, `card`... ficam **em inglês** porque é
  o formato salvo no navegador (`localStorage` `fin_dashboard_v1`) e nos backups
  JSON da versão anterior. Renomear apagaria os dados do dono.
- Imports com `@/` (ex.: `@/lib/supabase`). TypeScript sem `any`.
- Componentes **nunca** chamam `supabase.from(...)` direto: sempre via
  `features/<modulo>/banco.ts`. Toda chamada checa `error` e lança
  `erroDoBanco(error, 'tabela')`.
- Estado global: `criarStore` de `@/lib/store` (padrão do `financas/store.ts`).
  Estado imutável — mudar com `alterarBase(b => ...)` ou `definir(e => novo)`.
  Estado local de tela: `useState` normal.
- Mensagens ao usuário: `avisar(texto, 'ok' | 'erro')` de `@/lib/avisos`.
  Sempre em português simples, dizendo o que aconteceu e se ficou salvo.
- Padrão das ações: muda a tela na hora → grava no banco → se falhar, avisa
  que ficou só neste navegador.
- Texto do banco é gravável por qualquer visitante: nunca usar
  `dangerouslySetInnerHTML` com ele (o React já escapa o resto).
- Datas: lançamentos guardam `DD/MM/AAAA`; o banco usa `AAAA-MM-DD`; converter
  com `dataIso`/`dataBr` de `@/lib/datas`. Dinheiro: `fmtBRL` de `@/lib/formato`.

## Visual (design system)

- Cores **só por token**, nunca hex solto no componente: `bg-sheet`, `text-ink`,
  `text-ink-mute`, `border-rule`, `bg-credit` (verde/receita), `bg-debit`
  (vermelho/despesa), `bg-navy-3` (principal), `bg-gold` (destaque). Aceitam
  opacidade (`bg-credit/10`). Em SVG: `rgb(var(--credit))`.
- Os tokens ficam em `src/index.css`, como canais RGB, com versão clara e
  escura. Um token novo precisa entrar **nos três blocos** (claro, escuro
  forçado e escuro automático) e em `tailwind.config.ts`.
- Não usar o prefixo `dark:`: o tema troca sozinho pelas variáveis. O tema é
  auto/claro/escuro, gravado em `localStorage` `fin_theme`, aplicado como
  `data-theme` no `<html>`.
- Componente novo do shadcn: copiar de ui.shadcn.com para `src/components/ui/`
  (o `components.json` já está configurado) e **trocar as cores padrão pelos
  tokens acima**. Variações (tamanho, cor) com `cva`, como em `button.tsx`.
- Categorias e suas cores: `features/financas/categorias.ts`.
- Nada de CDN: fontes (Inter, JetBrains Mono) e pdf.js vêm do npm e são
  servidos pelo próprio site.

## Carimbo de versão

`VERSAO_APP` em `src/lib/versao.ts` aparece no rodapé. **Incrementar sempre
que houver mudança visível** (`v28/09/2026-a` → `-b`; dia novo → nova data com
`-a`). É como o dono confirma, sem ferramentas de desenvolvedor, que o
navegador pegou a versão nova e não uma cópia em cache.

## Banco de dados (Supabase)

Projeto `imersao-ia-db` (`ygknsbttphqnrwnywcak`, região `sa-east-1`). Cliente
único em `src/lib/supabase.ts`, tipado com `src/types/database.ts`.

O painel não tem login: fala com o banco como visitante (`anon`), usando a
chave **publicável** que está no `.env` (feita para ficar no navegador; quem
protege é a RLS). **Nunca** colocar a chave secreta (`service_role` /
`sb_secret_...`) em variável `VITE_*` — tudo que começa com `VITE_` vai para a
página.

As linhas compartilhadas (`usuario_id IS NULL`) aceitam **leitura e gravação
anônimas**. Isso foi uma decisão explícita do dono, tomada depois de apresentada
a alternativa com autenticação — está registrada em
`supabase/migrations/20260917000000_permitir_gravacao_anonima_nos_dados_compartilhados.sql`,
junto com a consequência (os dados são graváveis por qualquer um que tenha o
endereço) e o caminho de volta (autenticar, mesmo que anonimamente, e voltar às
políticas por dono). Não reverter isso sem ele pedir. Toda consulta do painel
filtra `.is('usuario_id', null)`.

Só `competencias`, `faturas`, `lancamentos` e `agendamentos` estão abertas para
escrita. `categorias`, `contas`, `cartoes`, `regras_categorizacao` e `perfis`
seguem somente-leitura para o visitante.

Deduplicação: `lancamentos` tem índice único em
`(competencia_id, origem, data, descricao, valor)` e `agendamentos` em
`(usuario_id, origem, data_prevista, descricao, valor)`; gravar com
`.upsert(..., { onConflict: '<essas colunas>' })` para reimportar sem duplicar.

Como o site guarda dados: o navegador mantém uma cópia (`localStorage`
`fin_dashboard_v1`) e o banco é sincronizado. Ao abrir, cada mês do banco é
puxado **uma vez** (`sincronizados`) e nunca sobrescreve um mês que o usuário
já mexeu; a agenda pendente vem sempre do banco. Pendências conhecidas: excluir
um lançamento e editar regras de categorização afetam só o navegador.

### Auth, Storage e Edge Functions (prontos para usar)

- **Auth**: o cliente já guarda e renova sessão. `useSessao()`
  (`src/hooks/use-sessao.ts`) diz quem está logado. Módulo com dado pessoal
  deve gravar `usuario_id = auth.uid()` e usar as políticas "dono lê/escreve"
  que já existem nas tabelas. Ligar login no painel atual muda a decisão acima
  — só com pedido do dono.
- **Storage**: para guardar arquivos (ex.: PDFs de extrato), criar um bucket
  **privado** por migração, com políticas em `storage.objects` por
  `bucket_id` e dono; no front, `supabase.storage.from('<bucket>')`. Hoje o
  PDF é lido só no navegador e não é enviado.
- **Edge Functions**: em `supabase/functions/` (ver o README de lá). Usar para
  chave secreta, API de terceiros ou processamento pesado. Chamar com
  `supabase.functions.invoke('<nome>')`.

## Agenda

`agendamentos` guarda o que ainda não aconteceu. Um lançamento manual com data
futura vai para lá em vez de entrar nos totais do mês — previsão não é fato, e
somar as duas coisas faria o saldo mostrar dinheiro que não saiu nem entrou.
Quando o dono clica em "Aconteceu", o agendamento vira um lançamento no mês da
data prevista e guarda o vínculo (`lancamento_id`, `situacao = 'realizado'`),
para não ser confirmado duas vezes. A visão `vw_agenda_detalhada` já traz a
categoria resolvida, como `vw_lancamentos_detalhados` faz com os lançamentos.

## Deploy (Vercel)

- `vercel.json` define: `npm ci` → `npm run build` → publica `dist/`.
- Arquivos em `/assets/` têm nome com hash e cache de 1 ano; o resto (o
  `index.html`) sempre revalida — por isso uma versão nova aparece no próximo
  recarregar.
- Qualquer endereço sem arquivo cai no `index.html` (necessário para as rotas).
- Push em outro ramo gera um deploy de **prévia** (protegido por login da
  Vercel); só o ramo de produção atualiza https://imersao-ia-green.vercel.app.
- Conferir pelo MCP da Vercel (`list_deployments` / `get_deployment`, time
  `dapvcontas-projects`) que o deploy do commit ficou `READY`; se der `ERROR`,
  ler o log com `list_deployment_events`.

## Como testar

1. `npm run lint && npm test && npm run build`.
2. Tela: `npm run build && npx vite preview --port 4173` e dirigir com
   Playwright (Chromium em `/opt/pw-browsers/chromium`; instalar com
   `npm install -g playwright --prefix /tmp/npmglobal` e rodar com
   `NODE_PATH=/tmp/npmglobal/lib/node_modules`).

O Supabase é bloqueado pelo proxy deste ambiente, então:

- para testar o **fluxo do site**, interceptar com `page.route('**/rest/v1/**')`
  e conferir método, caminho e corpo das requisições;
- para testar **permissões do banco**, rodar SQL com `set local role anon;` pelo
  MCP do Supabase — é o mesmo papel que o site usa — e limpar os dados de teste
  depois.

Conferir sempre o resultado por screenshot, nos modos claro e escuro, no
celular (390 px, sem rolagem lateral) e nos casos de borda (um mês só, nenhum
lançamento, importação que falha, banco fora do ar). PDF de teste dá para gerar
com o próprio Chromium (`page.pdf()`).

## Documentação

`README.md` descreve o sistema para quem chega. **Atualizar a cada módulo ou
mudança de comportamento** (seção "O que o sistema faz" e "Histórico").
