-- Índices nas chaves estrangeiras que ainda não tinham.
--
-- Apontado pelo advisor de desempenho do Supabase (lint 0001,
-- unindexed_foreign_keys) e pela regra "schema-foreign-key-indexes" da skill
-- supabase-postgres-best-practices: o Postgres não indexa FK sozinho, e sem
-- índice todo JOIN e todo ON DELETE (cascade / set null) varre a tabela
-- inteira. As colunas usuario_id também são as que a RLS filtra
-- ((select auth.uid()) = usuario_id), então o índice serve às políticas.
--
-- Só cria índices: não muda dados nem permissões.

create index if not exists agendamentos_categoria_idx   on public.agendamentos (categoria_id);
create index if not exists agendamentos_lancamento_idx  on public.agendamentos (lancamento_id);
create index if not exists cartoes_conta_idx            on public.cartoes (conta_id);
create index if not exists cartoes_usuario_idx          on public.cartoes (usuario_id);
create index if not exists contas_usuario_idx           on public.contas (usuario_id);
create index if not exists faturas_cartao_idx           on public.faturas (cartao_id);
create index if not exists faturas_usuario_idx          on public.faturas (usuario_id);
create index if not exists lancamentos_conta_idx        on public.lancamentos (conta_id);
create index if not exists lancamentos_fatura_idx       on public.lancamentos (fatura_id);
create index if not exists regras_categorizacao_categoria_idx on public.regras_categorizacao (categoria_id);
