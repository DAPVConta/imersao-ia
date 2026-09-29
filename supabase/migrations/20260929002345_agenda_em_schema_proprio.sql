-- ============================================================
-- Agenda ganha um schema próprio (regra do projeto: um schema por módulo).
--
-- Os dados do módulo passam a morar em `agenda`. O schema `agenda` NÃO é
-- exposto na API (Data API) — quem conversa com o site são duas "janelas" no
-- `public`, com security_invoker (a RLS da tabela de verdade continua valendo
-- para quem consulta):
--   public.agendamentos         → ler e gravar (mesmo nome de antes, então o
--                                 site publicado continua funcionando)
--   public.vw_agenda_detalhada  → leitura com a categoria já resolvida
--
-- ALTER ... SET SCHEMA só move: dados, índices, políticas RLS, gatilho e
-- permissões vão junto com a tabela.
--
-- Novidade: parcela / total_parcelas, para agendar algo que se repete todo
-- mês (aluguel, salário, prestação) — cada mês é uma linha própria.
-- ============================================================

create schema if not exists agenda;
comment on schema agenda is
  'Módulo Agenda: pagamentos e recebimentos previstos. Não exposto na API; o site usa as visões em public.';

-- USAGE no schema só permite enxergar o que está dentro; como o schema não é
-- exposto, isso não abre nada na API. É necessário porque as visões em public
-- são security_invoker (rodam com o papel de quem consulta).
grant usage on schema agenda to anon, authenticated, service_role;

alter type public.situacao_agendamento set schema agenda;

drop view public.vw_agenda_detalhada;
alter table public.agendamentos set schema agenda;

alter table agenda.agendamentos
  add column parcela smallint,
  add column total_parcelas smallint,
  add constraint agendamentos_parcela_valida check (
    (parcela is null and total_parcelas is null)
    or (parcela between 1 and total_parcelas and total_parcelas between 2 and 120)
  );
comment on column agenda.agendamentos.parcela is
  'Em algo que se repete todo mês: qual das vezes é esta (1, 2, 3...). Nulo se não se repete.';

-- ---------- Janelas da API (public) ----------
-- Visão simples sobre uma tabela só: o Postgres a trata como atualizável
-- (insert/update/delete e upsert com on conflict passam direto para a tabela).
create view public.agendamentos
with (security_invoker = on) as
select
  id, usuario_id, competencia_id, categoria_id, lancamento_id,
  data_prevista, descricao, tipo, origem, valor, situacao, observacoes,
  parcela, total_parcelas, criado_em, atualizado_em
from agenda.agendamentos;
comment on view public.agendamentos is
  'Janela da API para agenda.agendamentos (leitura e gravação; a RLS da tabela vale).';

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
  a.parcela,
  a.total_parcelas,
  cat.slug as categoria_slug,
  cat.nome as categoria,
  cat.cor_token,
  (a.data_prevista - current_date) as dias_restantes,
  (a.situacao = 'pendente' and a.data_prevista < current_date) as atrasado,
  a.criado_em
from agenda.agendamentos a
left join public.categorias cat on cat.id = a.categoria_id;

-- O visitante lê as duas; grava só pela janela de agendamentos.
revoke all on public.agendamentos, public.vw_agenda_detalhada from anon, authenticated;
grant select, insert, update, delete on public.agendamentos to anon, authenticated;
grant select on public.vw_agenda_detalhada to anon, authenticated;
