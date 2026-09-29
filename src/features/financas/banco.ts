/**
 * Tudo que fala com o Supabase sobre finanças fica aqui — componentes nunca
 * chamam `supabase.from(...)` direto.
 *
 * O painel usa o papel `anon` e trabalha nas linhas COMPARTILHADAS
 * (usuario_id nulo), que aceitam leitura e gravação anônimas por decisão do
 * dono (ver supabase/migrations/20260917000000_...). Toda consulta filtra
 * `usuario_id is null` para não misturar com dados de usuários logados.
 */
import { dataBr, dataIso } from '@/lib/datas'
import { erroDoBanco, supabase } from '@/lib/supabase'
import { garantirMes } from './store'
import type { BaseLocal, Lancamento, LancamentoNovo, ResumoCartao, ResumoConta } from './tipos'

const CHAVE_DEDUP_LANCAMENTOS = 'competencia_id,origem,data,descricao,valor'

const numeroOuNulo = (v: number | null | undefined) => (v == null ? null : Number(v))

/* ---------------- leitura ---------------- */

/**
 * Traz para a base local os meses do banco. Cada mês é puxado UMA vez
 * (base.sincronizados), para que uma exclusão local não reapareça ao recarregar,
 * e nunca sobrescreve um mês em que o usuário já mexeu.
 * Muta a base recebida (chame com uma cópia). Devolve quantos lançamentos vieram.
 */
export async function sincronizarMeses(base: BaseLocal): Promise<number> {
  const [competencias, faturas, lancamentos] = await Promise.all([
    supabase
      .from('competencias')
      .select('id,ano,mes,saldo_conta_anterior,saldo_conta_final')
      .is('usuario_id', null),
    supabase
      .from('faturas')
      .select('competencia_id,data_fechamento,data_vencimento,saldo_anterior,pagamento,compras_periodo,total,limite_total,pagamento_minimo')
      .is('usuario_id', null),
    supabase
      .from('vw_lancamentos_detalhados')
      .select('id,competencia_id,data,descricao,tipo,origem,valor,categoria')
      .is('usuario_id', null)
      .order('data', { ascending: true }),
  ])
  if (competencias.error) throw erroDoBanco(competencias.error, 'competencias')
  if (faturas.error) throw erroDoBanco(faturas.error, 'faturas')
  if (lancamentos.error) throw erroDoBanco(lancamentos.error, 'lançamentos')

  base.sincronizados = base.sincronizados || {}
  let importados = 0

  for (const c of competencias.data) {
    const chave = `${c.ano}-${String(c.mes).padStart(2, '0')}`
    if (base.sincronizados[chave]) continue
    base.sincronizados[chave] = true

    const m = garantirMes(base, chave)
    if (m.transactions.length || m.bank.saldoAnterior != null || m.bank.saldoFinal != null) continue

    m.bank.saldoAnterior = numeroOuNulo(c.saldo_conta_anterior)
    m.bank.saldoFinal = numeroOuNulo(c.saldo_conta_final)

    const f = faturas.data.find((f) => f.competencia_id === c.id)
    if (f) {
      m.card = {
        fechamento: dataBr(f.data_fechamento),
        vencimento: dataBr(f.data_vencimento),
        saldoAnterior: numeroOuNulo(f.saldo_anterior),
        pagamento: numeroOuNulo(f.pagamento),
        comprasPeriodo: numeroOuNulo(f.compras_periodo),
        total: numeroOuNulo(f.total),
        limiteTotal: numeroOuNulo(f.limite_total),
        pagamentoMinimo: numeroOuNulo(f.pagamento_minimo),
      }
    }

    for (const l of lancamentos.data) {
      if (l.competencia_id !== c.id || !l.tipo || !l.origem) continue
      m.transactions.push({
        id: 'tx_' + l.id,
        date: dataBr(l.data),
        desc: l.descricao ?? '',
        type: l.tipo,
        source: l.origem,
        category: l.categoria || 'Outros',
        value: Number(l.valor),
      })
      importados++
    }
  }
  return importados
}

let mapaCategorias: Record<string, string> | null = null

/** nome da categoria → id no banco (lido uma vez por sessão) */
export async function idsDasCategorias(): Promise<Record<string, string>> {
  if (mapaCategorias) return mapaCategorias
  const { data, error } = await supabase.from('categorias').select('id,nome').is('usuario_id', null)
  if (error) throw erroDoBanco(error, 'categorias')
  mapaCategorias = Object.fromEntries(data.map((c) => [c.nome, c.id]))
  return mapaCategorias
}

export const idCategoria = (cats: Record<string, string>, nome: string) => cats[nome] || cats['Outros'] || null

/* ---------------- gravação ---------------- */

/** Garante a competência (o mês) no banco e devolve o id. */
export async function garantirCompetencia(chave: string, conta?: ResumoConta): Promise<string> {
  const [ano, mes] = chave.split('-').map(Number)
  const achadas = await supabase
    .from('competencias')
    .select('id')
    .is('usuario_id', null)
    .eq('ano', ano)
    .eq('mes', mes)
  if (achadas.error) throw erroDoBanco(achadas.error, 'competencias')

  const saldos = {
    saldo_conta_anterior: conta?.saldoAnterior ?? null,
    saldo_conta_final: conta?.saldoFinal ?? null,
  }
  if (achadas.data.length) {
    const id = achadas.data[0].id
    if (saldos.saldo_conta_anterior != null || saldos.saldo_conta_final != null) {
      const { error } = await supabase.from('competencias').update(saldos).eq('id', id)
      if (error) throw erroDoBanco(error, 'competencias')
    }
    return id
  }
  const criada = await supabase.from('competencias').insert({ ano, mes, ...saldos }).select('id').single()
  if (criada.error) throw erroDoBanco(criada.error, 'competencias')
  return criada.data.id
}

/** Grava (ou atualiza) o resumo da fatura do cartão daquele mês. */
export async function salvarFatura(competenciaId: string, cartao: ResumoCartao) {
  const corpo = {
    competencia_id: competenciaId,
    data_fechamento: dataIso(cartao.fechamento),
    data_vencimento: dataIso(cartao.vencimento),
    saldo_anterior: cartao.saldoAnterior,
    pagamento: cartao.pagamento,
    compras_periodo: cartao.comprasPeriodo,
    total: cartao.total,
    limite_total: cartao.limiteTotal,
    pagamento_minimo: cartao.pagamentoMinimo,
  }
  const achadas = await supabase.from('faturas').select('id').is('usuario_id', null).eq('competencia_id', competenciaId)
  if (achadas.error) throw erroDoBanco(achadas.error, 'faturas')
  const { error } = achadas.data.length
    ? await supabase.from('faturas').update(corpo).eq('id', achadas.data[0].id)
    : await supabase.from('faturas').insert(corpo)
  if (error) throw erroDoBanco(error, 'faturas')
}

function linhaDeLancamento(competenciaId: string, cats: Record<string, string>, t: LancamentoNovo) {
  return {
    competencia_id: competenciaId,
    data: dataIso(t.date)!,
    descricao: t.desc,
    tipo: t.type,
    origem: t.source,
    valor: t.value,
    categoria_id: idCategoria(cats, t.category),
  }
}

/**
 * Envia vários lançamentos. O índice único de deduplicação do banco evita
 * duplicar quando o mesmo extrato é importado duas vezes.
 */
export async function salvarLancamentos(competenciaId: string, lancamentos: LancamentoNovo[]): Promise<number> {
  if (!lancamentos.length) return 0
  const cats = await idsDasCategorias()
  const linhas = lancamentos.filter((t) => dataIso(t.date)).map((t) => linhaDeLancamento(competenciaId, cats, t))
  const { error } = await supabase.from('lancamentos').upsert(linhas, { onConflict: CHAVE_DEDUP_LANCAMENTOS })
  if (error) throw erroDoBanco(error, 'lançamentos')
  return linhas.length
}

/** Grava um lançamento e devolve o id da linha (para amarrar um agendamento a ele). */
export async function salvarUmLancamento(competenciaId: string, t: LancamentoNovo): Promise<string | null> {
  const cats = await idsDasCategorias()
  const { data, error } = await supabase
    .from('lancamentos')
    .upsert(linhaDeLancamento(competenciaId, cats, t), { onConflict: CHAVE_DEDUP_LANCAMENTOS })
    .select('id')
  if (error) throw erroDoBanco(error, 'lançamentos')
  return data[0]?.id ?? null
}

/** Sobe tudo que acabou de ser importado num mês. */
export async function enviarImportacao(
  chave: string,
  conta: ResumoConta,
  cartao: ResumoCartao | null,
  lancamentos: Lancamento[],
): Promise<number> {
  const id = await garantirCompetencia(chave, conta)
  if (cartao) await salvarFatura(id, cartao)
  return salvarLancamentos(id, lancamentos)
}
