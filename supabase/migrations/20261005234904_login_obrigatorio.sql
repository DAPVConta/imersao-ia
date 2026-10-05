-- Login obrigatório para ver e gravar os dados da casa.
--
-- Até aqui o painel falava com o banco como visitante (papel `anon`) e as
-- linhas compartilhadas (usuario_id nulo) eram legíveis e graváveis por
-- qualquer pessoa que tivesse o endereço do site — decisão registrada em
-- 20260917000000_permitir_gravacao_anonima_nos_dados_compartilhados.sql.
--
-- A pedido do dono, o painel passa a exigir login (Supabase Auth, e-mail e
-- senha). Os dados continuam compartilhados (usuario_id nulo: são da casa,
-- não de uma pessoa), mas agora só quem é MEMBRO da casa lê e grava:
--
--   * acesso.membros   lista de e-mails autorizados (schema próprio, não
--                      exposto na API; só se altera pelo painel do Supabase
--                      ou por SQL);
--   * acesso.e_membro() diz se quem está logado tem o e-mail confirmado e
--                      está na lista.
--
-- Ter uma conta não basta: alguém que se cadastre sozinho, sem estar na lista,
-- entra no site e não vê nada. O visitante sem login perde todo acesso.
--
-- Para autorizar alguém (no SQL Editor do Supabase):
--   insert into acesso.membros (email) values ('pessoa@exemplo.com');
-- Para tirar o acesso:
--   delete from acesso.membros where email = 'pessoa@exemplo.com';

-- ---------- membros ----------
create schema acesso;
grant usage on schema acesso to authenticated, service_role;

create table acesso.membros (
  email     text primary key check (email = lower(btrim(email)) and email like '%_@_%'),
  criado_em timestamptz not null default now()
);
comment on table acesso.membros is
  'E-mails que podem usar o painel (ler e gravar os dados compartilhados da casa).';

-- Ninguém lê nem grava a lista pela API: só a função abaixo a consulta.
alter table acesso.membros enable row level security;
revoke all on acesso.membros from anon, authenticated;
grant all on acesso.membros to service_role;

-- SECURITY DEFINER porque precisa ler auth.users e acesso.membros, que o
-- usuário logado não enxerga. Fica no schema `acesso` (fora da API), não
-- recebe parâmetros e só responde sobre o próprio auth.uid().
create function acesso.e_membro()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join acesso.membros m on m.email = lower(u.email)
    where u.id = (select auth.uid())
      and u.email_confirmed_at is not null
  )
$$;
revoke execute on function acesso.e_membro() from public, anon;
grant execute on function acesso.e_membro() to authenticated, service_role;

-- Janela da API para o site saber se mostra o painel ou o aviso "sem acesso".
create function public.tenho_acesso()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select acesso.e_membro()
$$;
revoke execute on function public.tenho_acesso() from public, anon;
grant execute on function public.tenho_acesso() to authenticated;

-- As políticas antigas são ALTERADAS (não apagadas e recriadas): a leitura
-- passa a exigir login de membro, e as de gravação do visitante viram as de
-- gravação do membro. As de "dono" (dados pessoais, usuario_id = auth.uid())
-- continuam como estavam.

-- ---------- leitura: só logado; compartilhado só para membro ----------
do $do$
declare
  t text;
  nome text;
begin
  foreach t in array array[
    'public.categorias', 'public.contas', 'public.cartoes', 'public.competencias',
    'public.faturas', 'public.lancamentos', 'public.regras_categorizacao',
    'agenda.agendamentos'
  ] loop
    nome := split_part(t, '.', 2);
    execute format($p$
      alter policy %I on %s
        to authenticated
        using ((usuario_id is null and (select acesso.e_membro())) or (select auth.uid()) = usuario_id)$p$,
      nome || ': leitura propria e de sistema', t);
    execute format('alter policy %I on %s rename to %I',
      nome || ': leitura propria e de sistema', t, nome || ': membro le compartilhada, dono le a propria');
  end loop;
end $do$;

-- ---------- gravação do compartilhado: de visitante para membro ----------
do $do$
declare
  t text;
  nome text;
  regra constant text := 'usuario_id is null and (select acesso.e_membro())';
begin
  foreach t in array array[
    'public.competencias', 'public.faturas', 'public.lancamentos', 'agenda.agendamentos'
  ] loop
    nome := split_part(t, '.', 2);
    execute format('alter policy %I on %s to authenticated with check (%s)',
      nome || ': visitante cria compartilhada', t, regra);
    execute format('alter policy %I on %s to authenticated using (%s) with check (%s)',
      nome || ': visitante altera compartilhada', t, regra, regra);
    execute format('alter policy %I on %s to authenticated using (%s)',
      nome || ': visitante remove compartilhada', t, regra);

    execute format('alter policy %I on %s rename to %I', nome || ': visitante cria compartilhada', t, nome || ': membro cria compartilhada');
    execute format('alter policy %I on %s rename to %I', nome || ': visitante altera compartilhada', t, nome || ': membro altera compartilhada');
    execute format('alter policy %I on %s rename to %I', nome || ': visitante remove compartilhada', t, nome || ': membro remove compartilhada');
  end loop;
end $do$;

-- ---------- o visitante não tem mais nada a fazer nas tabelas ----------
-- (Defesa em profundidade: sem política ele já não veria linha nenhuma.)
revoke all on all tables in schema public from anon;
revoke all on agenda.agendamentos from anon;
revoke usage on schema agenda from anon;
