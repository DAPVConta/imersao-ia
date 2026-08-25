-- ============================================================
-- Row Level Security
-- Convenção: usuario_id nulo = dado de sistema/demonstração,
-- legível por qualquer um e gravável por ninguém via API.
-- ============================================================

alter table public.perfis               enable row level security;
alter table public.categorias           enable row level security;
alter table public.contas               enable row level security;
alter table public.cartoes              enable row level security;
alter table public.competencias         enable row level security;
alter table public.faturas              enable row level security;
alter table public.lancamentos          enable row level security;
alter table public.regras_categorizacao enable row level security;

-- ---------- perfis ----------
create policy "perfis: dono le"      on public.perfis for select to authenticated using ((select auth.uid()) = id);
create policy "perfis: dono cria"    on public.perfis for insert to authenticated with check ((select auth.uid()) = id);
create policy "perfis: dono altera"  on public.perfis for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "perfis: dono remove"  on public.perfis for delete to authenticated using ((select auth.uid()) = id);

-- ---------- tabelas com usuario_id ----------
do $do$
declare t text;
begin
  foreach t in array array[
    'categorias','contas','cartoes','competencias',
    'faturas','lancamentos','regras_categorizacao'
  ] loop
    -- leitura: dados próprios + dados de sistema/demonstração
    execute format($p$
      create policy "%1$s: leitura propria e de sistema" on public.%1$I
        for select to anon, authenticated
        using (usuario_id is null or (select auth.uid()) = usuario_id)$p$, t);

    execute format($p$
      create policy "%1$s: dono cria" on public.%1$I
        for insert to authenticated
        with check ((select auth.uid()) = usuario_id)$p$, t);

    execute format($p$
      create policy "%1$s: dono altera" on public.%1$I
        for update to authenticated
        using ((select auth.uid()) = usuario_id)
        with check ((select auth.uid()) = usuario_id)$p$, t);

    execute format($p$
      create policy "%1$s: dono remove" on public.%1$I
        for delete to authenticated
        using ((select auth.uid()) = usuario_id)$p$, t);
  end loop;
end $do$;

-- ============================================================
-- Provisionamento do perfil e das regras padrão a cada cadastro
-- ============================================================
create or replace function public.provisionar_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  insert into public.perfis (id, nome_exibicao)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$fn$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.provisionar_novo_usuario();
