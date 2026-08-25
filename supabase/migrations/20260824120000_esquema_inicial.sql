-- ============================================================
-- Esquema inicial do painel de finanças pessoais
-- Domínio: extrato de conta corrente + fatura de cartão,
-- organizados por competência mensal e categorizados por regras.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Tipos ----------
create type public.tipo_lancamento   as enum ('receita', 'despesa', 'transferencia');
create type public.origem_lancamento as enum ('conta', 'cartao');
create type public.natureza_categoria as enum ('receita', 'despesa', 'transferencia');
create type public.tipo_regra        as enum ('cnpj', 'mcc', 'palavra_chave');

-- ---------- Utilitário de auditoria ----------
create or replace function public.definir_atualizado_em()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- ============================================================
-- perfis: extensão de auth.users
-- ============================================================
create table public.perfis (
  id             uuid primary key references auth.users (id) on delete cascade,
  nome_exibicao  text,
  moeda          char(3)     not null default 'BRL',
  fuso_horario   text        not null default 'America/Sao_Paulo',
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);
comment on table public.perfis is 'Dados de perfil do usuário, espelhando auth.users.';

-- ============================================================
-- categorias: plano de contas do painel
-- usuario_id nulo = categoria de sistema (visível a todos, somente leitura)
-- ============================================================
create table public.categorias (
  id             uuid primary key default gen_random_uuid(),
  usuario_id     uuid references auth.users (id) on delete cascade,
  slug           text not null,
  nome           text not null,
  natureza       public.natureza_categoria not null default 'despesa',
  cor_token      text not null default 'var(--cat-outros)',
  ordem          smallint not null default 100,
  sistema        boolean not null default false,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  constraint categorias_slug_formato check (slug ~ '^[a-z0-9_]+$')
);
comment on table public.categorias is 'Categorias de classificação. usuario_id nulo indica categoria de sistema.';

-- Um slug por usuário; e um slug global único entre as de sistema.
create unique index categorias_usuario_slug_idx
  on public.categorias (usuario_id, slug) where usuario_id is not null;
create unique index categorias_sistema_slug_idx
  on public.categorias (slug) where usuario_id is null;

-- ============================================================
-- contas: contas correntes / poupança
-- ============================================================
create table public.contas (
  id             uuid primary key default gen_random_uuid(),
  usuario_id     uuid references auth.users (id) on delete cascade,
  apelido        text not null,
  instituicao    text,
  agencia        text,
  numero_final   text,
  ativa          boolean not null default true,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);
comment on table public.contas is 'Contas bancárias das quais o extrato é importado.';

-- ============================================================
-- cartoes: cartões de crédito
-- ============================================================
create table public.cartoes (
  id               uuid primary key default gen_random_uuid(),
  usuario_id       uuid references auth.users (id) on delete cascade,
  conta_id         uuid references public.contas (id) on delete set null,
  apelido          text not null,
  bandeira         text,
  numero_final     text,
  limite_total     numeric(14,2) check (limite_total >= 0),
  dia_fechamento   smallint check (dia_fechamento between 1 and 31),
  dia_vencimento   smallint check (dia_vencimento between 1 and 31),
  ativo            boolean not null default true,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);
comment on table public.cartoes is 'Cartões de crédito cujas faturas são importadas.';

-- ============================================================
-- competencias: o mês de referência (chave YYYY-MM do painel)
-- ============================================================
create table public.competencias (
  id                    uuid primary key default gen_random_uuid(),
  usuario_id            uuid references auth.users (id) on delete cascade,
  ano                   smallint not null check (ano between 1900 and 2200),
  mes                   smallint not null check (mes between 1 and 12),
  referencia            date generated always as (make_date(ano::int, mes::int, 1)) stored,
  saldo_conta_anterior  numeric(14,2),
  saldo_conta_final     numeric(14,2),
  observacoes           text,
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now()
);
comment on table public.competencias is 'Mês de referência que agrupa lançamentos e faturas.';

create unique index competencias_usuario_periodo_idx
  on public.competencias (usuario_id, ano, mes) where usuario_id is not null;
create unique index competencias_demo_periodo_idx
  on public.competencias (ano, mes) where usuario_id is null;

-- ============================================================
-- faturas: fechamento mensal de um cartão dentro da competência
-- ============================================================
create table public.faturas (
  id                 uuid primary key default gen_random_uuid(),
  usuario_id         uuid references auth.users (id) on delete cascade,
  competencia_id     uuid not null references public.competencias (id) on delete cascade,
  cartao_id          uuid references public.cartoes (id) on delete set null,
  data_fechamento    date,
  data_vencimento    date,
  saldo_anterior     numeric(14,2),
  pagamento          numeric(14,2),
  compras_periodo    numeric(14,2),
  total              numeric(14,2),
  limite_total       numeric(14,2) check (limite_total >= 0),
  pagamento_minimo   numeric(14,2),
  criado_em          timestamptz not null default now(),
  atualizado_em      timestamptz not null default now(),
  constraint faturas_cartao_por_competencia unique (competencia_id, cartao_id)
);
comment on table public.faturas is 'Resumo da fatura do cartão em uma competência.';

-- ============================================================
-- lancamentos: transações de extrato e de fatura
-- ============================================================
create table public.lancamentos (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid references auth.users (id) on delete cascade,
  competencia_id  uuid not null references public.competencias (id) on delete cascade,
  conta_id        uuid references public.contas (id) on delete set null,
  fatura_id       uuid references public.faturas (id) on delete set null,
  categoria_id    uuid references public.categorias (id) on delete set null,
  data            date not null,
  descricao       text not null,
  tipo            public.tipo_lancamento not null,
  origem          public.origem_lancamento not null,
  valor           numeric(14,2) not null check (valor > 0),
  documento       text,                -- CNPJ/CPF da contraparte (extrato)
  mcc             text,                -- código de categoria do estabelecimento (fatura)
  tipo_operacao   text,                -- PIX ENVIADO, DEB AUTOMATICO, TARIFA, ...
  categorizado_por public.tipo_regra,  -- regra que definiu a categoria; nulo = manual
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),
  constraint lancamentos_mcc_formato check (mcc is null or mcc ~ '^[0-9]{4}$'),
  constraint lancamentos_fatura_apenas_cartao
    check (fatura_id is null or origem = 'cartao')
);
comment on table public.lancamentos is 'Lançamentos individuais do extrato bancário e da fatura do cartão.';
comment on column public.lancamentos.valor is 'Sempre positivo; o sinal é dado por lancamentos.tipo.';

-- Evita reimportar a mesma linha do extrato/fatura (mesma chave usada pelo painel).
create unique index lancamentos_deduplicacao_idx
  on public.lancamentos (competencia_id, origem, data, descricao, valor);
create index lancamentos_competencia_data_idx on public.lancamentos (competencia_id, data);
create index lancamentos_categoria_idx        on public.lancamentos (categoria_id);
create index lancamentos_usuario_data_idx     on public.lancamentos (usuario_id, data desc);

-- ============================================================
-- regras_categorizacao: motor de classificação automática
-- ============================================================
create table public.regras_categorizacao (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid references auth.users (id) on delete cascade,
  tipo            public.tipo_regra not null,
  chave           text not null,       -- CNPJ, MCC ou expressão regular
  rotulo          text not null,
  categoria_id    uuid references public.categorias (id) on delete cascade,
  tipo_sugerido   public.tipo_lancamento,
  resolver_por_operacao boolean not null default false, -- regra do próprio banco: depende do tipo_operacao
  prioridade      smallint not null default 100,
  ativa           boolean not null default true,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),
  constraint regras_categoria_obrigatoria
    check (resolver_por_operacao or categoria_id is not null)
);
comment on table public.regras_categorizacao is
  'Regras que mapeiam CNPJ, MCC ou palavra-chave para uma categoria. A precedência é cnpj > mcc > palavra_chave, desempatada por prioridade.';

create unique index regras_usuario_chave_idx
  on public.regras_categorizacao (usuario_id, tipo, chave) where usuario_id is not null;
create unique index regras_sistema_chave_idx
  on public.regras_categorizacao (tipo, chave) where usuario_id is null;

-- ---------- Triggers de atualizado_em ----------
do $do$
declare t text;
begin
  foreach t in array array[
    'perfis','categorias','contas','cartoes','competencias',
    'faturas','lancamentos','regras_categorizacao'
  ] loop
    execute format(
      'create trigger %I_atualizado_em before update on public.%I
         for each row execute function public.definir_atualizado_em()', t, t);
  end loop;
end $do$;
