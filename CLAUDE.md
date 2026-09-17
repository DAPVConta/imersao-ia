# Assistente Financeiro — instruções do projeto

## Regras de trabalho

**Publicar sempre.** Toda alteração concluída vai para produção sem precisar
perguntar. O fluxo é: commit → push para `claude/financial-assistant-dashboard-kngtdk`
→ a Vercel publica sozinha → confirmar que o deploy ficou `READY` antes de
responder. Nunca deixar mudança pronta parada no repositório.

**Falar de forma simples.** O dono do projeto não é desenvolvedor. Explicar em
português claro, sem jargão, dizendo o que mudou e o que ele precisa fazer.
Quando um termo técnico for inevitável, explicar o que significa.

**Conferir antes de afirmar.** Não dizer que algo está no ar sem checar o estado
do deploy, nem que algo funciona sem ter testado.

## Onde as coisas estão

| O quê | Onde |
|---|---|
| O sistema inteiro | `index.html` (arquivo único, ~1,7 MB) |
| Esquema e políticas do banco | `supabase/migrations/` |
| Site publicado | https://imersao-ia-green.vercel.app |
| Projeto na Vercel | `dapvcontas-projects/imersao-ia`, ligado ao GitHub |

O `index.html` traz tudo embutido — pdf.js, as fontes e os dados de exemplo —
justamente para funcionar offline e sem CDN. Por isso é grande; editar direto
com Edit, não reconstruir de template.

## Carimbo de versão

`VERSAO_APP`, perto do `INIT`, aparece no rodapé da página. **Incrementar sempre
que houver mudança visível** (`v17/09/2026-c` → `-d`). É como o dono confirma,
sem abrir ferramentas de desenvolvedor, que o navegador dele pegou a versão nova
e não uma cópia em cache.

## Banco de dados (Supabase)

Projeto `imersao-ia-db` (`ygknsbttphqnrwnywcak`). O painel não tem login: fala
com a API REST como visitante (`anon`), usando a chave publicável que fica
visível no HTML.

As linhas compartilhadas (`usuario_id IS NULL`) aceitam **leitura e gravação
anônimas**. Isso foi uma decisão explícita do dono, tomada depois de apresentada
a alternativa com autenticação — está registrada em
`supabase/migrations/20260917000000_permitir_gravacao_anonima_nos_dados_compartilhados.sql`,
junto com a consequência (os dados são graváveis por qualquer um que tenha o
endereço) e o caminho de volta (autenticar, mesmo que anonimamente, e voltar às
políticas por dono). Não reverter isso sem ele pedir.

Só `competencias`, `faturas`, `lancamentos` e `agendamentos` estão abertas para
escrita. `categorias`, `contas`, `cartoes`, `regras_categorizacao` e `perfis`
seguem somente-leitura para o visitante.

## Agenda

`agendamentos` guarda o que ainda não aconteceu. Um lançamento manual com data
futura vai para lá em vez de entrar nos totais do mês — previsão não é fato, e
somar as duas coisas faria o saldo mostrar dinheiro que não saiu nem entrou.
Quando o dono clica em "Aconteceu", o agendamento vira um lançamento no mês da
data prevista e guarda o vínculo (`lancamento_id`, `situacao = 'realizado'`),
para não ser confirmado duas vezes. A visão `vw_agenda_detalhada` já traz a
categoria resolvida, como `vw_lancamentos_detalhados` faz com os lançamentos.

## Como testar

Não há suíte de testes. O que funciona bem é dirigir a página com Playwright
(Chromium em `/opt/pw-browsers/chromium`; instalar com
`npm install -g playwright --prefix /tmp/npmglobal` e rodar com `NODE_PATH`).

O Supabase é bloqueado pelo proxy deste ambiente, então:

- para testar o **fluxo do site**, interceptar com `page.route('**/rest/v1/**')`
  e conferir método, caminho e corpo das requisições;
- para testar **permissões do banco**, rodar SQL com `set local role anon;` pelo
  MCP do Supabase — é o mesmo papel que o site usa — e limpar os dados de teste
  depois.

Conferir sempre o resultado por screenshot, nos modos claro e escuro, e nos casos
de borda (um mês só, nenhum lançamento, importação que falha).
