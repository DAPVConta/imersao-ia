-- ============================================================
-- Agenda: lançamentos previstos para uma data futura.
--
-- Quando o usuário lança algo com data à frente de hoje, aquilo ainda não
-- aconteceu: não pode entrar nos totais do mês como se fosse fato consumado.
-- Fica aqui, na agenda, até o dia chegar. Quando ele confirma que aconteceu,
-- o agendamento vira um lançamento de verdade e guarda o vínculo
-- (lancamento_id) para não ser confirmado duas vezes.
-- ============================================================

create type public.situacao_agendamento as enum ('pendente', 'realizado', 'cancelado');

create table public.agendamentos (
  id              uuid primary key default gen_random_uuid(),
  usuario_id      uuid references auth.users (id) on delete cascade,
  competencia_id  uuid references public.competencias (id) on delete set null,
  categoria_id    uuid references public.categorias (id) on delete set null,
  lancamento_id   uuid references public.lancamentos (id) on delete set null,
  data_prevista   date not null,
  descricao       text not null,
  tipo            public.tipo_lancamento not null,
  origem          public.origem_lancamento not null,
  valor           numeric(14,2) not null check (valor > 0),
  situacao        public.situacao_agendamento not null default 'pendente',
  observacoes     text,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),
  -- Só um agendamento já realizado pode apontar para um lançamento.
  constraint agendamentos_vinculo_so_quando_realizado
    check (lancamento_id is null or situacao = 'realizado')
);
comment on table public.agendamentos is
  'Lançamentos previstos para o futuro. Viram lançamentos de fato quando confirmados.';
comment on column public.agendamentos.valor is
  'Sempre positivo; o sinal é dado por agendamentos.tipo, como em lancamentos.';
comment on column public.agendamentos.lancamento_id is
  'Preenchido na confirmação: o lançamento que este agendamento virou.';

-- Mesma ideia da deduplicação de lancamentos: evita agendar duas vezes a
-- mesma previsão ao reenviar o formulário. NULLS NOT DISTINCT faz o
-- usuario_id nulo dos dados compartilhados contar como um valor; sem índice
-- parcial, para que a API (PostgREST) consiga inferi-lo no on_conflict.
create unique index agendamentos_deduplicacao_idx
  on public.agendamentos (usuario_id, origem, data_prevista, descricao, valor)
  nulls not distinct;

create index agendamentos_pendentes_idx
  on public.agendamentos (data_prevista) where situacao = 'pendente';
create index agendamentos_competencia_idx on public.agendamentos (competencia_id);
create index agendamentos_usuario_data_idx on public.agendamentos (usuario_id, data_prevista);

create trigger agendamentos_atualizado_em before update on public.agendamentos
  for each row execute function public.definir_atualizado_em();

-- ---------- Visão com a categoria já resolvida ----------
-- Espelha vw_lancamentos_detalhados: o painel lê o nome da categoria direto,
-- sem precisar cruzar tabelas no navegador.
create view public.vw_agenda_detalhada
with (security_invoker = on) as
select
  a.id,
  a.usuario_id,
  a.competencia_id,
  a.data_prevista,
  a.descricao,
  a.tipo,
  a.origem,
  a.valor,
  case a.tipo when 'despesa' then -a.valor else a.valor end as valor_com_sinal,
  a.situacao,
  a.lancamento_id,
  a.observacoes,
  cat.slug as categoria_slug,
  cat.nome as categoria,
  cat.cor_token,
  (a.data_prevista - current_date) as dias_restantes,
  (a.situacao = 'pendente' and a.data_prevista < current_date) as atrasado,
  a.criado_em
from public.agendamentos a
left join public.categorias cat on cat.id = a.categoria_id;

-- ---------- RLS ----------
-- Mesmas regras já em vigor nas outras tabelas: o dono manda no que é dele e
-- o visitante (anon) lê e grava nas linhas compartilhadas (usuario_id nulo),
-- conforme a decisão registrada na migração
-- 20260917000000_permitir_gravacao_anonima_nos_dados_compartilhados.sql.
alter table public.agendamentos enable row level security;

create policy "agendamentos: leitura propria e de sistema" on public.agendamentos
  for select to anon, authenticated
  using (usuario_id is null or (select auth.uid()) = usuario_id);

create policy "agendamentos: dono cria" on public.agendamentos
  for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "agendamentos: dono altera" on public.agendamentos
  for update to authenticated
  using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "agendamentos: dono remove" on public.agendamentos
  for delete to authenticated using ((select auth.uid()) = usuario_id);

create policy "agendamentos: visitante cria compartilhada" on public.agendamentos
  for insert to anon with check (usuario_id is null);
create policy "agendamentos: visitante altera compartilhada" on public.agendamentos
  for update to anon
  using (usuario_id is null) with check (usuario_id is null);
create policy "agendamentos: visitante remove compartilhada" on public.agendamentos
  for delete to anon using (usuario_id is null);
