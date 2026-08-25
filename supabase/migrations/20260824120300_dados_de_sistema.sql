-- ============================================================
-- Dados de sistema: plano de categorias e regras de
-- categorização padrão (usuario_id nulo = compartilhado).
-- ============================================================

insert into public.categorias (usuario_id, slug, nome, natureza, cor_token, ordem, sistema) values
  (null, 'moradia',       'Moradia',        'despesa',       'var(--cat-moradia)',      10, true),
  (null, 'alimentacao',   'Alimentação',    'despesa',       'var(--cat-alimentacao)',  20, true),
  (null, 'supermercado',  'Supermercado',   'despesa',       'var(--cat-mercado)',      30, true),
  (null, 'transporte',    'Transporte',     'despesa',       'var(--cat-transporte)',   40, true),
  (null, 'saude',         'Saúde',          'despesa',       'var(--cat-saude)',        50, true),
  (null, 'assinaturas',   'Assinaturas',    'despesa',       'var(--cat-assinaturas)',  60, true),
  (null, 'lazer_compras', 'Lazer/Compras',  'despesa',       'var(--cat-lazer)',        70, true),
  (null, 'educacao',      'Educação',       'despesa',       'var(--cat-educacao)',     80, true),
  (null, 'outros',        'Outros',         'despesa',       'var(--cat-outros)',       90, true),
  (null, 'salario',       'Salário',        'receita',       'var(--cat-moradia)',     100, true),
  (null, 'rendimentos',   'Rendimentos',    'receita',       'var(--cat-mercado)',     110, true),
  (null, 'transferencia', 'Transferência',  'transferencia', 'var(--cat-outros)',      120, true)
on conflict do nothing;

-- ---------- Regras por CNPJ (extrato bancário) ----------
insert into public.regras_categorizacao
  (usuario_id, tipo, chave, rotulo, categoria_id, tipo_sugerido, resolver_por_operacao, prioridade)
select null, 'cnpj', d.chave, d.rotulo,
       (select id from public.categorias where usuario_id is null and slug = d.slug),
       d.tipo_sugerido::public.tipo_lancamento, d.por_operacao, 10
from (values
  ('18.442.907/0001-56', 'Imobiliária / Aluguel',        'moradia',      null,      false),
  ('07.331.204/0001-18', 'Condomínio',                   'moradia',      null,      false),
  ('02.449.992/0001-64', 'Internet',                     'assinaturas',  null,      false),
  ('31.775.610/0001-92', 'Empregador',                   'salario',      'receita', false),
  ('61.695.227/0001-93', 'Energia elétrica',             'moradia',      null,      false),
  ('03.476.811/0042-07', 'Supermercado',                 'supermercado', null,      false),
  ('12.547.716/0088-40', 'Academia',                     'saude',        null,      false),
  ('44.902.316/0001-77', 'Curso / escola',               'educacao',     null,      false),
  ('33.000.167/1102-83', 'Posto de combustível',         'transporte',   null,      false),
  ('43.202.472/0001-30', 'Plano de saúde',               'saude',        null,      false),
  ('29.118.554/0001-05', 'Renda extra (PIX recebido)',   'outros',       'receita', false),
  ('61.585.865/0221-49', 'Farmácia',                     'saude',        null,      false),
  ('61.198.164/0001-60', 'Seguro',                       'outros',       null,      false),
  ('22.640.913/0001-24', 'Pet shop',                     'outros',       null,      false),
  ('60.746.948/0001-12', 'Banco (tarifa, rendimento, fatura, aplicação)', null, null, true)
) as d(chave, rotulo, slug, tipo_sugerido, por_operacao)
on conflict do nothing;

-- ---------- Regras por MCC (fatura do cartão) ----------
insert into public.regras_categorizacao
  (usuario_id, tipo, chave, rotulo, categoria_id, prioridade)
select null, 'mcc', d.chave, d.rotulo,
       (select id from public.categorias where usuario_id is null and slug = d.slug), 20
from (values
  ('5812', 'Restaurantes e lanchonetes',   'alimentacao'),
  ('5541', 'Postos de combustível',        'transporte'),
  ('4899', 'TV por assinatura / streaming','assinaturas'),
  ('5912', 'Farmácias e drogarias',        'saude'),
  ('5999', 'Varejo diverso',               'outros'),
  ('5411', 'Supermercados e mercearias',   'supermercado'),
  ('5735', 'Música e mídia digital',       'assinaturas'),
  ('4121', 'Táxi e transporte por app',    'transporte'),
  ('5942', 'Livrarias',                    'educacao'),
  ('5722', 'Eletrodomésticos',             'lazer_compras'),
  ('5462', 'Padarias e confeitarias',      'alimentacao'),
  ('7832', 'Cinemas',                      'lazer_compras'),
  ('5655', 'Artigos esportivos',           'lazer_compras')
) as d(chave, rotulo, slug)
on conflict do nothing;

-- ---------- Regras por palavra-chave (último recurso) ----------
-- A chave é uma expressão regular aplicada com ~* sobre a descrição.
insert into public.regras_categorizacao
  (usuario_id, tipo, chave, rotulo, categoria_id, tipo_sugerido, prioridade)
select null, 'palavra_chave', d.chave, d.rotulo,
       (select id from public.categorias where usuario_id is null and slug = d.slug),
       d.tipo_sugerido::public.tipo_lancamento, d.prioridade
from (values
  ('superm|mercad|hiper|extra|carrefour|dia\y',                    'Supermercado',            'supermercado', null,      31),
  ('farmac|drogar|drogasil',                                       'Farmácia',                'saude',        null,      32),
  ('posto|combust|shell|ipiranga|petrobras',                       'Combustível',             'transporte',   null,      33),
  ('uber|99app|taxi|transporte',                                   'Transporte por app',      'transporte',   null,      34),
  ('netflix|spotify|prime|disney|hbo|icloud|apple\.com|assinatura|streaming',
                                                                   'Streaming / assinatura',  'assinaturas',  null,      35),
  ('academia|smartfit|fitness',                                    'Academia',                'saude',        null,      36),
  ('aluguel|condomin|imob',                                        'Aluguel / condomínio',    'moradia',      null,      37),
  ('energia|enel|luz|cpfl|light|elektro|agua|sabesp|gas\y|internet|vivo|claro|tim|fibra',
                                                                   'Utilidades da moradia',   'moradia',      null,      38),
  ('restaurante|lanchonete|ifood|padaria|pizzaria|hamburgu',       'Alimentação fora de casa','alimentacao',  null,      39),
  ('escola|curso|faculdade|cultura inglesa|colegio',               'Educação',                'educacao',     null,      40),
  ('salario|folha|pagamento.*ltda|credito ted',                    'Salário',                 'salario',      'receita', 41),
  ('rendimento|cdb|aplicacao|resgate',                             'Rendimentos',             'rendimentos',  'receita', 42)
) as d(chave, rotulo, slug, tipo_sugerido, prioridade)
on conflict do nothing;
