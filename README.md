# Assistente Financeiro Pessoal

Painel mensal de finanças pessoais: junta extrato da conta e fatura do cartão,
classifica os gastos por categoria, mostra a evolução mês a mês e mantém uma
agenda do que ainda vai acontecer.

**No ar:** https://imersao-ia-green.vercel.app

## O que o sistema faz

**Painel do mês**
- Escolha o mês no topo; o painel abre no mês mais recente.
- Receitas, despesas e resultado do mês, com mini-gráfico da evolução e
  percentual de poupança.
- Saldo da conta, fatura do cartão, uso do limite e pagamento mínimo.
- Despesas por categoria (gráfico de rosca) e resumo da fatura.
- Evolução de receitas × despesas e total de gastos por mês com linha de média.
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
- Tudo que tem data futura fica previsto, fora dos totais do mês.
- Mostra o que há a pagar e a receber em 30 dias, o que passou da data e o
  resultado previsto do mês.
- "Aconteceu" transforma a previsão em lançamento do mês certo.

**Geral**
- Tema automático, claro ou escuro; funciona no celular.
- Os dados ficam no banco (Supabase) e aparecem em qualquer aparelho; o
  navegador guarda uma cópia e continua funcionando se o banco cair.
- Backup: exportar e importar tudo em um arquivo JSON.
- A versão aparece no rodapé (ex.: `v28/09/2026-a`) para conferir se o
  navegador pegou a atualização.

## Tecnologia

| Camada | Tecnologia |
|---|---|
| Front | React 18, TypeScript, Vite |
| Visual | Tailwind CSS, shadcn/ui (Radix UI), class-variance-authority |
| Back | Supabase — Postgres com RLS, Auth, Storage, Edge Functions |
| Deploy | Vercel (publica sozinha a cada push no ramo de produção) |
| Testes | Vitest e Playwright |

Leitura de PDF com [pdf.js](https://mozilla.github.io/pdf.js/), carregado só
quando alguém anexa um arquivo. Fontes Inter e JetBrains Mono servidas pelo
próprio site, sem CDN.

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
