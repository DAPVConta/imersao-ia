-- ============================================================
-- Dados de demonstração: competência julho/2026, com o extrato
-- da conta e a fatura do cartão usados pelo painel.
-- usuario_id nulo = visível a todos, somente leitura via API.
-- ============================================================

insert into public.contas (id, usuario_id, apelido, instituicao, agencia, numero_final)
values ('00000000-0000-4000-8000-000000000001', null,
        'Conta Fácil', 'Banco Demonstração', '0412', '9087')
on conflict (id) do nothing;

insert into public.cartoes
  (id, usuario_id, conta_id, apelido, bandeira, numero_final, limite_total, dia_fechamento, dia_vencimento)
values ('00000000-0000-4000-8000-000000000002', null,
        '00000000-0000-4000-8000-000000000001',
        'Cartão principal', 'Mastercard', '4417', 12000.00, 28, 8)
on conflict (id) do nothing;

insert into public.competencias
  (id, usuario_id, ano, mes, saldo_conta_anterior, saldo_conta_final, observacoes)
values ('00000000-0000-4000-8000-000000000003', null, 2026, 7, 3420.55, 4278.20,
        'Competência de demonstração distribuída com o painel.')
on conflict (id) do nothing;

insert into public.faturas
  (id, usuario_id, competencia_id, cartao_id, data_fechamento, data_vencimento,
   saldo_anterior, pagamento, compras_periodo, total, limite_total, pagamento_minimo)
values ('00000000-0000-4000-8000-000000000004', null,
        '00000000-0000-4000-8000-000000000003',
        '00000000-0000-4000-8000-000000000002',
        '2026-07-28', '2026-08-08',
        2187.43, 2187.43, 2454.77, 2454.77, 12000.00, 368.22)
on conflict (id) do nothing;

-- ---------- Extrato da conta corrente ----------
insert into public.lancamentos
  (usuario_id, competencia_id, conta_id, categoria_id, data, descricao,
   tipo, origem, valor, documento, tipo_operacao, categorizado_por)
select null,
       '00000000-0000-4000-8000-000000000003',
       '00000000-0000-4000-8000-000000000001',
       (select id from public.categorias where usuario_id is null and slug = d.slug),
       d.data::date, d.descricao,
       d.tipo::public.tipo_lancamento, 'conta'::public.origem_lancamento,
       d.valor, nullif(d.documento, ''), d.tipo_operacao,
       d.categorizado_por::public.tipo_regra
from (values
  ('2026-07-01','PIX IMOB SANTA CLARA - ALUGUEL JUL/26','despesa',2300.00,'18.442.907/0001-56','PIX ENVIADO','moradia','cnpj'),
  ('2026-07-02','DEB AUT CONDOMINIO EDIF AURORA','despesa',480.00,'07.331.204/0001-18','DEB AUTOMATICO','moradia','cnpj'),
  ('2026-07-03','DEB AUT VIVO FIBRA INTERNET 300MB','despesa',129.90,'02.449.992/0001-64','DEB AUTOMATICO','assinaturas','cnpj'),
  ('2026-07-05','CREDITO SALARIO - NOVA MIDIA LTDA','receita',8450.00,'31.775.610/0001-92','CREDITO TED','salario','cnpj'),
  ('2026-07-06','DEB AUT ENEL DISTRIBUICAO ENERGIA','despesa',187.42,'61.695.227/0001-93','DEB AUTOMATICO','moradia','cnpj'),
  ('2026-07-07','COMPRA DEBITO SUPERMERCADO DIA','despesa',142.88,'03.476.811/0042-07','COMPRA DEBITO','supermercado','cnpj'),
  ('2026-07-08','PAGTO FATURA CARTAO FINAL 4417','transferencia',2187.43,'60.746.948/0001-12','PAGTO FATURA','transferencia','cnpj'),
  ('2026-07-10','DEB AUT SMARTFIT ACADEMIA','despesa',119.90,'12.547.716/0088-40','DEB AUTOMATICO','saude','cnpj'),
  ('2026-07-11','SAQUE TERMINAL 24H AG 0412','despesa',200.00,'','SAQUE','outros',null),
  ('2026-07-14','PIX CULTURA INGLESA - MENSALIDADE','despesa',420.00,'44.902.316/0001-77','PIX ENVIADO','educacao','cnpj'),
  ('2026-07-15','COMPRA DEBITO POSTO IPIRANGA','despesa',160.00,'33.000.167/1102-83','COMPRA DEBITO','transporte','cnpj'),
  ('2026-07-17','DEB AUT UNIMED PLANO DE SAUDE','despesa',689.00,'43.202.472/0001-30','DEB AUTOMATICO','saude','cnpj'),
  ('2026-07-18','PIX RECEBIDO ESTUDIO ORBITA','receita',1200.00,'29.118.554/0001-05','PIX RECEBIDO','outros','cnpj'),
  ('2026-07-20','COMPRA DEBITO DROGASIL FL 221','despesa',73.50,'61.585.865/0221-49','COMPRA DEBITO','saude','cnpj'),
  ('2026-07-22','PIX CLEUSA M SANTOS - DIARISTA','despesa',180.00,'','PIX ENVIADO','outros',null),
  ('2026-07-24','DEB AUT PORTO SEGURO - SEG AUTO','despesa',245.60,'61.198.164/0001-60','DEB AUTOMATICO','outros','cnpj'),
  ('2026-07-25','COMPRA DEBITO PET SHOP AMIGO FIEL','despesa',134.00,'22.640.913/0001-24','COMPRA DEBITO','outros','cnpj'),
  ('2026-07-28','PIX RENATA C RIBEIRO - PRESENTE','despesa',150.00,'','PIX ENVIADO','outros',null),
  ('2026-07-29','TARIFA PACOTE DE SERVICOS CONTA FACIL','despesa',34.90,'60.746.948/0001-12','TARIFA','outros','cnpj'),
  ('2026-07-30','CREDITO RENDIMENTO CDB LIQUIDEZ DIARIA','receita',42.18,'60.746.948/0001-12','RENDIMENTO','rendimentos','cnpj'),
  ('2026-07-31','PIX CONTA INVESTIMENTO - RESERVA','transferencia',1000.00,'60.746.948/0001-12','PIX ENVIADO','transferencia','cnpj')
) as d(data, descricao, tipo, valor, documento, tipo_operacao, slug, categorizado_por)
on conflict do nothing;

-- ---------- Fatura do cartão ----------
insert into public.lancamentos
  (usuario_id, competencia_id, fatura_id, categoria_id, data, descricao,
   tipo, origem, valor, mcc, categorizado_por)
select null,
       '00000000-0000-4000-8000-000000000003',
       '00000000-0000-4000-8000-000000000004',
       (select id from public.categorias where usuario_id is null and slug = d.slug),
       d.data::date, d.descricao,
       'despesa'::public.tipo_lancamento, 'cartao'::public.origem_lancamento,
       d.valor, d.mcc, 'mcc'::public.tipo_regra
from (values
  ('2026-07-01','IFOOD *RESTAURANTE MASSA NOSTRA','5812', 68.90,'alimentacao'),
  ('2026-07-02','POSTO IPIRANGA JD PAULISTA',    '5541',210.00,'transporte'),
  ('2026-07-02','NETFLIX.COM ASSINATURA MENSAL', '4899', 44.90,'assinaturas'),
  ('2026-07-03','DROGARIA SAO PAULO FL 118',     '5912', 87.45,'saude'),
  ('2026-07-04','AMAZON BR MARKETPLACE',         '5999',156.80,'outros'),
  ('2026-07-05','SUPERMERCADO PAO DE ACUCAR 1042','5411',432.17,'supermercado'),
  ('2026-07-07','SPOTIFY BR PREMIUM',            '5735', 21.90,'assinaturas'),
  ('2026-07-09','UBER *TRIP HELP.UBER.COM',      '4121', 32.40,'transporte'),
  ('2026-07-10','OUTBACK STEAKHOUSE MORUMBI',    '5812',189.60,'alimentacao'),
  ('2026-07-12','LIVRARIA CULTURA CONJ NACIONAL','5942', 94.00,'educacao'),
  ('2026-07-13','UBER *TRIP HELP.UBER.COM',      '4121', 28.70,'transporte'),
  ('2026-07-15','MAGAZINE LUIZA PARC 1/3',       '5722',133.30,'lazer_compras'),
  ('2026-07-16','PADARIA BELLA MASSA',           '5462', 46.20,'alimentacao'),
  ('2026-07-18','POSTO SHELL SELECT PINHEIROS',  '5541',195.00,'transporte'),
  ('2026-07-20','CINEMARK SHOPPING ELDORADO',    '7832', 78.00,'lazer_compras'),
  ('2026-07-21','SUPERMERCADO EXTRA HIPER 305',  '5411',288.55,'supermercado'),
  ('2026-07-23','FARMACIA PAGUE MENOS 0871',     '5912', 62.30,'saude'),
  ('2026-07-24','APPLE.COM/BILL ICLOUD',         '5735',  9.90,'assinaturas'),
  ('2026-07-26','IFOOD *LANCHONETE DO ZE',       '5812', 54.80,'alimentacao'),
  ('2026-07-27','DECATHLON MORUMBI',             '5655',219.90,'lazer_compras')
) as d(data, descricao, mcc, valor, slug)
on conflict do nothing;
