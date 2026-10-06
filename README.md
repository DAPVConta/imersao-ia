# Assistente Financeiro Pessoal

Painel mensal de finanças pessoais: junta extrato da conta e fatura do cartão,
classifica os gastos por categoria, mostra a evolução mês a mês e mantém uma
agenda do que ainda vai acontecer.

**No ar:** https://imersao-ia-green.vercel.app

## O que o sistema faz

**Entrar (login)**
- O painel pede e-mail e senha (Supabase Auth). Sem entrar, não aparece nada
  e o banco não entrega dado nenhum.
- Só entra nos dados da casa quem está na lista de membros
  (`acesso.membros`). Uma conta fora da lista vê o aviso "Esta conta ainda não
  tem acesso".
- *Esqueci minha senha* manda um link por e-mail para criar uma senha nova.
- Botão *Sair* no fim do menu (no celular, no topo). Passo a passo de contas e credenciais em
  [`docs/login-e-credenciais.md`](docs/login-e-credenciais.md).

**Navegação**
- Menu à esquerda (barra de baixo no celular) com quatro páginas: Painel,
  Agenda, Lançamentos e Trazer lançamentos.
- Troque de mês na barra do topo (setas, lista ou teclas ← →) ou clicando no
  mês no gráfico do ano; vale para todas as páginas. Abre no mês mais recente.

**Dicas da IA**
- Botão *Dicas da IA* no alto do Painel: a inteligência artificial (Claude,
  da Anthropic) lê os números salvos no banco (meses, categorias, maiores
  despesas e agenda) e devolve um resumo, um alerta quando algo pede atenção
  e de 3 a 6 dicas práticas, com a economia estimada por mês.
- Roda no servidor do Supabase (Edge Function `dicas-financeiras`); a chave da
  IA fica no segredo `claude_api` do Supabase e nunca vai para o navegador.
  Cada clique em *Gerar de novo* é uma nova consulta (paga) à IA.

**Painel do mês**
- **Resultado do mês:** quanto sobrou (ou faltou), o que entrou e saiu, a
  comparação com o mês anterior, quanto do que entrou foi gasto e a previsão
  contando a agenda. O guilhochê (rendilhado das notas) muda a cada mês.
- **Indicadores:** entrou, saiu, guardado e a pagar em 30 dias, cada um com
  a variação em relação ao mês anterior e a tendência dos últimos meses.
- **O ano mês a mês:** entradas para cima, saídas para baixo, com a média de
  gastos.
- **Para onde foi o dinheiro:** despesas por categoria, da maior para a menor.
- **Conta e cartão:** saldo da conta, fatura, uso do limite e pagamento mínimo.
- Transferências (pagar a fatura, aplicar na reserva) não contam como receita
  nem despesa — só movem dinheiro de lugar.

**Lançar e importar**
- *Lançamento manual*: data de hoje ou passada entra no mês daquela data; data
  futura vai para a agenda.
- *Anexar PDF*: lê extrato bancário ou fatura de cartão direto no navegador (o
  arquivo não é enviado a lugar nenhum), sugere o mês e as categorias e mostra
  tudo para revisão antes de importar.
- *Colar CSV*: `data;descrição;tipo;origem;categoria;valor`.
- *Exemplo Jul/2026*: carrega dados fictícios para experimentar.
- *Regras de categorização*: classificação automática pelo CNPJ/CPF (extrato)
  ou pelo MCC do estabelecimento (fatura), com palavras-chave de reserva.
- Reimportar o mesmo extrato não duplica lançamentos.

**Agenda**
- Botão *Agendar*: uma conta a pagar ou um dinheiro a receber, uma vez ou
  todo mês (aluguel, salário, prestação), por quantos meses quiser.
- Lançamento manual com data futura também vai para a agenda.
- Tudo que tem data futura fica previsto, fora dos totais do mês.
- Mostra o que há a pagar e a receber em 30 dias, o que passou da data e o
  resultado previsto do mês.
- "Aconteceu" pergunta a data e o valor reais (pagou antes, a conta veio
  diferente) e transforma a previsão em lançamento do mês certo.

**Geral**
- Tema automático, claro ou escuro; funciona no celular e só com teclado.
- Os dados ficam no banco (Supabase) e aparecem em qualquer aparelho; o
  navegador guarda uma cópia e continua funcionando se o banco cair.
- Backup: exportar e importar tudo em um arquivo JSON.
- A versão aparece no rodapé (ex.: `v29/09/2026-a`) para conferir se o
  navegador pegou a atualização.

## Tecnologia

| Camada | Tecnologia |
|---|---|
| Front | React 18, TypeScript, Vite |
| Visual | Tailwind CSS, shadcn/ui (Radix UI), class-variance-authority; fontes Public Sans e Bodoni Moda |
| Back | Supabase — Postgres com RLS, Auth, Storage, Edge Functions |
| Deploy | Vercel (publica sozinha a cada push no ramo de produção) |
| Testes | Vitest e Playwright |

Leitura de PDF com [pdf.js](https://mozilla.github.io/pdf.js/), carregado só
quando alguém anexa um arquivo. Fontes servidas pelo próprio site, sem CDN.

## Design

Painel com menu à esquerda e cartões; a identidade vem do dinheiro impresso:
azul-petróleo da nota de R$ 100, verde de entrada, carmim de saída, as cores
das cédulas nas categorias e o guilhochê das notas como marca-d'água. As decisões (paleta, fontes, layout, o
que evitar) estão em [`docs/design.md`](docs/design.md).

## Skills do projeto

Em `.claude/skills/`, usadas pelo Claude Code em todo trabalho neste
repositório (a regra está no `CLAUDE.md`):

- `frontend-design` ([anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design)) — design de interface.
- `supabase` e `supabase-postgres-best-practices` ([supabase/agent-skills](https://github.com/supabase/agent-skills)) — banco, segurança e desempenho.
- `find-skills` ([vercel-labs/skills](https://github.com/vercel-labs/skills/tree/main/skills/find-skills)) — procura e instala skills novas pelo `npx skills`. Instalada em `.agents/skills/` com atalho em `.claude/skills/` (registro em `skills-lock.json`).

## Rodar na sua máquina

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
npm run dev        # abre em http://localhost:5173
```

Outros comandos: `npm run build` (gera a versão de produção em `dist/`),
`npm test` (testes), `npm run lint` (revisão automática do código).

O arquivo `.env` já aponta para o banco do projeto usando a chave
**publicável** do Supabase, que é feita para ficar no navegador — quem protege
os dados são as regras de acesso (RLS) do banco. Para usar outro projeto
Supabase, crie um `.env.local` com `VITE_SUPABASE_URL` e
`VITE_SUPABASE_PUBLISHABLE_KEY`.

## Organização do código

```
src/
  pages/             páginas (uma por endereço)
  features/          um módulo por assunto: acesso (login), dicas (IA), financas, painel, importacao, agenda
  components/ui/     componentes base (botão, cartão, seletor, abas, diálogo...)
  components/layout/ cabeçalho, rodapé, avisos
  lib/               conexão com o Supabase, datas, formatação
  types/database.ts  tipos gerados a partir do banco
supabase/
  migrations/        estrutura e regras de acesso do banco
  functions/         Edge Functions (código que roda no servidor)
```

Detalhes do banco em [`supabase/README.md`](supabase/README.md). Convenções,
passo a passo para criar módulos novos e rotina de publicação em
[`CLAUDE.md`](CLAUDE.md).

## Segurança — leia antes de usar com dados reais

O painel exige login. Os dados da casa (linhas com `usuario_id` nulo) só são
lidos e gravados por quem entrou **e** está na lista `acesso.membros`; o
visitante sem login não lê nem grava nada (migração
`20261005234904_login_obrigatorio.sql`). A chave que fica no site
(`VITE_SUPABASE_PUBLISHABLE_KEY`) é a publicável, feita para ser pública; a
chave secreta nunca vai para o site. Detalhes e passo a passo em
[`docs/login-e-credenciais.md`](docs/login-e-credenciais.md).

Limitações conhecidas: excluir um lançamento e editar regras de categorização
valem só para o navegador em uso (não vão para o banco).

## Histórico

- **06/10/2026 — `v06/10/2026-c`**: botão *Dicas da IA* no Painel (Claude lê os
  dados do banco e sugere como melhorar as finanças). Tela de entrada com um
  logotipo só, maior e centralizado.
- **06/10/2026 — `v06/10/2026-b`**: logotipo e favicon novos (símbolo de
  barras subindo com moeda). Logotipo completo na tela de entrada; símbolo no
  menu, na barra do celular, na aba do navegador e no atalho do celular.
- **06/10/2026 — `v06/10/2026-a`**: o layout novo (menu à esquerda,
  `v29/09/2026-c`) volta ao ar junto com o login — ele tinha ficado fora do
  ramo de produção. Tela de entrada no mesmo visual; *Sair* no menu.
- **05/10/2026 — `v05/10/2026-e`**: login obrigatório (e-mail e senha do
  Supabase), lista de membros da casa, "Esqueci minha senha" e botão *Sair*.
  O acesso sem login aos dados foi fechado.
- **05/10/2026 — `v05/10/2026-b`**: textos da one page em linguagem simples,
  ícones em relevo e botões que abrem o WhatsApp.
- **05/10/2026 — `v05/10/2026-a`**: página de chamada da 3ª turma da
  Imersão em IA em `/imersao.html` (estilo neumorphism, com programa, jornada,
  o que o aluno leva e investimento). Skill `find-skills` instalada.
- **29/09/2026 — `v29/09/2026-c`**: layout novo — menu fixo à esquerda,
  páginas separadas (Painel, Agenda, Lançamentos, Trazer lançamentos), faixa
  de resultado com o guilhochê como marca-d'água e indicadores com variação e
  tendência. Plano em `docs/design.md`.
- **29/09/2026 — `v29/09/2026-b`**: agenda de pagamentos e recebimentos —
  botão *Agendar* (uma vez ou todo mês) e confirmação com a data e o valor
  reais. A agenda passou a ter um compartimento próprio no banco (schema
  `agenda`); daqui em diante cada módulo novo ganha o seu.
- **29/09/2026 — `v29/09/2026-a`**: novo design (cédula do mês com
  guilhochê, gráfico do ano que troca de mês, extrato em lista, fontes Public
  Sans e Bodoni Moda, navegação por teclado). Skills de design e do Supabase
  instaladas; índices nas chaves estrangeiras do banco (recomendação dos
  advisors do Supabase); versões dos pacotes fixadas.
- **28/09/2026 — v2 (`v28/09/2026-a`)**: sistema reescrito em React +
  TypeScript + Vite + Tailwind + shadcn/ui, organizado em módulos, com testes
  automáticos e build na Vercel. O visual, as funções e os dados salvos no
  navegador foram mantidos. O arquivo único `index.html` (1,7 MB) da versão 1
  continua no histórico do Git.
- **17/09/2026**: agenda de lançamentos futuros; gráfico de gastos por mês;
  importações gravadas no banco.
- **24/08/2026**: banco de dados no Supabase (esquema, regras de acesso,
  visões analíticas, dados de exemplo).
- **Agosto/2026**: primeira versão do painel em um único arquivo HTML.
