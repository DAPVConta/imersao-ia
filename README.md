# Assistente Financeiro Pessoal

Painel mensal de finanças pessoais: junta extrato da conta e fatura do cartão,
classifica os gastos por categoria, mostra a evolução mês a mês e mantém uma
agenda do que ainda vai acontecer.

**No ar:** https://imersao-ia-green.vercel.app

## O que o sistema faz

**Painel do mês**
- Troque de mês pelas setas do topo, pela lista, pelas teclas ← → ou clicando
  no mês no gráfico do ano. O painel abre no mês mais recente.
- **Cédula do mês:** quanto sobrou (ou faltou), o que entrou e saiu, a
  comparação com o mês anterior e a previsão contando a agenda. O rendilhado
  (guilhochê, como o das notas de dinheiro) muda de desenho a cada mês e o anel
  em volta mostra quanto da receita sobrou.
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

A identidade visual vem do dinheiro impresso: papel-moeda levemente
esverdeado, tinta verde-pinho, as cores das cédulas de real nas categorias e o
guilhochê das notas como assinatura. As decisões (paleta, fontes, layout, o
que evitar) estão em [`docs/design.md`](docs/design.md).

## Skills do projeto

Em `.claude/skills/`, usadas pelo Claude Code em todo trabalho neste
repositório (a regra está no `CLAUDE.md`):

- `frontend-design` ([anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design)) — design de interface.
- `supabase` e `supabase-postgres-best-practices` ([supabase/agent-skills](https://github.com/supabase/agent-skills)) — banco, segurança e desempenho.

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
  features/          um módulo por assunto: financas, painel, importacao, agenda
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

O painel não tem login. Por decisão do dono do projeto, os dados
compartilhados podem ser **lidos e alterados por qualquer pessoa que tenha o
endereço do site**. Serve para estudo e dados fictícios. Para dados reais, o
caminho é ligar o login do Supabase (a estrutura já está pronta) e voltar às
regras "cada um vê só o que é seu" — está descrito na migração
`20260917000000_permitir_gravacao_anonima_nos_dados_compartilhados.sql`.

Limitações conhecidas: excluir um lançamento e editar regras de categorização
valem só para o navegador em uso (não vão para o banco).

## Histórico

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
