-- ============================================================
-- Visões analíticas que alimentam os KPIs e gráficos do painel.
-- security_invoker = on para que a RLS do usuário continue valendo.
-- ============================================================

-- Lançamentos com a categoria já resolvida.
create view public.vw_lancamentos_detalhados
with (security_invoker = on) as
select
  l.id,
  l.usuario_id,
  l.competencia_id,
  c.ano,
  c.mes,
  c.referencia,
  l.data,
  l.descricao,
  l.tipo,
  l.origem,
  l.valor,
  case l.tipo when 'despesa' then -l.valor else l.valor end as valor_com_sinal,
  cat.slug  as categoria_slug,
  cat.nome  as categoria,
  cat.cor_token,
  l.documento,
  l.mcc,
  l.tipo_operacao
from public.lancamentos l
join public.competencias c on c.id = l.competencia_id
left join public.categorias cat on cat.id = l.categoria_id;

-- KPIs por competência: receitas, despesas, resultado e saldos.
create view public.vw_resumo_competencia
with (security_invoker = on) as
select
  c.id as competencia_id,
  c.usuario_id,
  c.ano,
  c.mes,
  c.referencia,
  c.saldo_conta_anterior,
  c.saldo_conta_final,
  coalesce(sum(l.valor) filter (where l.tipo = 'receita'), 0)                            as receitas,
  coalesce(sum(l.valor) filter (where l.tipo = 'despesa'), 0)                            as despesas,
  coalesce(sum(l.valor) filter (where l.tipo = 'receita'), 0)
    - coalesce(sum(l.valor) filter (where l.tipo = 'despesa'), 0)                        as resultado,
  coalesce(sum(l.valor) filter (where l.tipo = 'despesa' and l.origem = 'conta'), 0)     as despesas_conta,
  coalesce(sum(l.valor) filter (where l.tipo = 'despesa' and l.origem = 'cartao'), 0)    as despesas_cartao,
  coalesce(sum(l.valor) filter (where l.tipo = 'transferencia'), 0)                      as transferencias,
  count(l.id)                                                                            as qtd_lancamentos
from public.competencias c
left join public.lancamentos l on l.competencia_id = c.id
group by c.id;

-- Distribuição de despesas por categoria, com participação percentual.
create view public.vw_gastos_por_categoria
with (security_invoker = on) as
select
  c.id as competencia_id,
  c.usuario_id,
  c.ano,
  c.mes,
  cat.slug as categoria_slug,
  cat.nome as categoria,
  cat.cor_token,
  sum(l.valor) as total,
  count(*)     as qtd_lancamentos,
  round(100 * sum(l.valor) / nullif(sum(sum(l.valor)) over (partition by c.id), 0), 2) as percentual
from public.lancamentos l
join public.competencias c   on c.id = l.competencia_id
left join public.categorias cat on cat.id = l.categoria_id
where l.tipo = 'despesa'
group by c.id, cat.id, cat.slug, cat.nome, cat.cor_token;
