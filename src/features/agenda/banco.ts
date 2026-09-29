/**
 * Tudo que fala com o Supabase sobre a agenda fica aqui.
 *
 * Os dados moram no schema `agenda` (um schema por módulo), que não é exposto
 * na API. O site conversa com ele por duas janelas em `public`, criadas na
 * migração 20260929002345_agenda_em_schema_proprio.sql:
 *   `agendamentos`         → ler e gravar
 *   `vw_agenda_detalhada`  → ler, com o nome da categoria já resolvido
 * Como no resto do painel, trabalha nas linhas compartilhadas (usuario_id nulo).
 */
import { idCategoria, idsDasCategorias } from '@/features/financas/banco'
import { dataBr, dataIso } from '@/lib/datas'
import { erroDoBanco, supabase } from '@/lib/supabase'
import type { Agendamento } from './tipos'

const CHAVE_DEDUP = 'usuario_id,origem,data_prevista,descricao,valor'

/** Mesma identidade do índice de deduplicação — serve para achar a linha que voltou do banco. */
const chaveDoItem = (dataPrevista: string, descricao: string, valor: number, origem: string) =>
  `${dataPrevista}|${descricao}|${Number(valor).toFixed(2)}|${origem}`

/**
 * Agenda pendente do banco. Aqui o banco manda (a agenda precisa ser igual em
 * todos os aparelhos); só o que ainda não subiu (dbId nulo) é preservado.
 */
export async function lerAgenda(locais: Agendamento[]): Promise<Agendamento[]> {
  const { data, error } = await supabase
    .from('vw_agenda_detalhada')
    .select('id,data_prevista,descricao,tipo,origem,valor,categoria,parcela,total_parcelas')
    .is('usuario_id', null)
    .eq('situacao', 'pendente')
    .order('data_prevista', { ascending: true })
  if (error) throw erroDoBanco(error, 'agenda')

  const doBanco: Agendamento[] = data
    .filter((l) => l.id && l.data_prevista && l.tipo && l.origem)
    .map((l) => ({
      id: 'ag_' + l.id,
      dbId: l.id,
      date: dataBr(l.data_prevista),
      desc: l.descricao ?? '',
      type: l.tipo!,
      source: l.origem!,
      category: l.categoria || 'Outros',
      value: Number(l.valor),
      ...(l.parcela && l.total_parcelas ? { parcela: l.parcela, parcelas: l.total_parcelas } : {}),
    }))
  return doBanco.concat(locais.filter((a) => !a.dbId))
}

/**
 * Grava previsões (uma ou várias, como as de algo que se repete todo mês) e
 * devolve o id de cada uma no banco, pelo `id` local. O índice de
 * deduplicação impede duplicar num clique em dobro.
 */
export async function salvarAgendamentos(itens: Agendamento[]): Promise<Record<string, string>> {
  if (!itens.length) return {}
  const cats = await idsDasCategorias()
  const linhas = itens.map((a) => ({
    data_prevista: dataIso(a.date)!,
    descricao: a.desc,
    tipo: a.type,
    origem: a.source,
    valor: a.value,
    categoria_id: idCategoria(cats, a.category),
    parcela: a.parcela ?? null,
    total_parcelas: a.parcelas ?? null,
  }))
  const { data, error } = await supabase
    .from('agendamentos')
    .upsert(linhas, { onConflict: CHAVE_DEDUP })
    .select('id,data_prevista,descricao,valor,origem')
  if (error) throw erroDoBanco(error, 'agendamentos')

  const porChave = new Map(
    data.filter((l) => l.id).map((l) => [chaveDoItem(l.data_prevista ?? '', l.descricao ?? '', l.valor ?? 0, l.origem ?? ''), l.id!]),
  )
  const ids: Record<string, string> = {}
  for (const a of itens) {
    const id = porChave.get(chaveDoItem(dataIso(a.date)!, a.desc, a.value, a.source))
    if (id) ids[a.id] = id
  }
  return ids
}

export async function marcarAgendamentoRealizado(dbId: string, lancamentoId: string | null, competenciaId: string) {
  const { error } = await supabase
    .from('agendamentos')
    .update({ situacao: 'realizado', lancamento_id: lancamentoId, competencia_id: competenciaId })
    .eq('id', dbId)
  if (error) throw erroDoBanco(error, 'agendamentos')
}

export async function excluirAgendamento(dbId: string) {
  const { error } = await supabase.from('agendamentos').delete().eq('id', dbId)
  if (error) throw erroDoBanco(error, 'agendamentos')
}
