# Banco de dados — painel de finanças

Projeto Supabase: `imersao-ia-db` (`ygknsbttphqnrwnywcak`, região `sa-east-1`).

As migrations em `supabase/migrations/` são a fonte de verdade do esquema e já
estão aplicadas no projeto remoto.

## Tabelas

| Tabela | Papel |
| --- | --- |
| `perfis` | Extensão de `auth.users` (nome, moeda, fuso). Criada automaticamente no cadastro. |
| `categorias` | Plano de contas do painel (`moradia`, `alimentacao`, …) com natureza e cor. |
| `contas` | Contas correntes das quais o extrato é importado. |
| `cartoes` | Cartões de crédito, com limite e dias de fechamento/vencimento. |
| `competencias` | Mês de referência (`ano`/`mes`) com saldo inicial e final da conta. |
| `faturas` | Fechamento do cartão dentro de uma competência (total, mínimo, pagamento). |
| `lancamentos` | Transações do extrato e da fatura, já categorizadas. |
| `regras_categorizacao` | Motor de classificação por CNPJ, MCC ou palavra-chave. |

### Tipos

- `tipo_lancamento`: `receita` \| `despesa` \| `transferencia`
- `origem_lancamento`: `conta` \| `cartao`
- `natureza_categoria`: `receita` \| `despesa` \| `transferencia`
- `tipo_regra`: `cnpj` \| `mcc` \| `palavra_chave`

`lancamentos.valor` é sempre positivo; o sinal vem de `lancamentos.tipo`.
Transferências (pagamento de fatura, aplicação) não entram em receitas nem
despesas — apenas movem saldo.

## Visões

- `vw_lancamentos_detalhados` — lançamentos com categoria e competência resolvidas.
- `vw_resumo_competencia` — KPIs do mês: receitas, despesas, resultado, despesas por origem.
- `vw_gastos_por_categoria` — distribuição de despesas com participação percentual.

Todas usam `security_invoker = on`, então a RLS do usuário continua valendo.

## Segurança

RLS está habilitada em todas as tabelas. A convenção é:

- `usuario_id = auth.uid()` → o dono lê e escreve;
- `usuario_id is null` → dado de sistema ou demonstração, legível por todos e
  não gravável pela API (nenhuma política de escrita aceita `null`).

As categorias e as regras padrão são dados de sistema. A competência
julho/2026 é o conjunto de demonstração.

## Categorização

A precedência ao classificar um lançamento é **CNPJ → MCC → palavra-chave**,
desempatada por `prioridade` (menor primeiro). Regras de palavra-chave guardam
uma expressão regular aplicada com `~*` sobre a descrição.

O CNPJ do próprio banco usa `resolver_por_operacao = true`: a categoria depende
do `tipo_operacao` (`TARIFA` → despesa, `RENDIMENTO` → receita,
`PAGTO FATURA` → transferência).

## Reimportação

O índice único `lancamentos_deduplicacao_idx` cobre
`(competencia_id, origem, data, descricao, valor)` — a mesma chave que o painel
usa para evitar duplicar linhas ao reimportar um extrato ou fatura.
