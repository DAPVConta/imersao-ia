/**
 * Ações da agenda. Mesmo padrão das ações do painel: muda a tela na hora,
 * grava no banco e, se o banco falhar, avisa que ficou só neste navegador.
 */
import * as bancoFinancas from '@/features/financas/banco'
import { novoId } from '@/features/financas/calculos'
import { alterarBase, financas, garantirMes } from '@/features/financas/store'
import type { LancamentoNovo } from '@/features/financas/tipos'
import { avisar } from '@/lib/avisos'
import { chaveDoMes, dataBr } from '@/lib/datas'
import { fmtBRL, rotuloMes } from '@/lib/formato'
import * as banco from './banco'
import { datasMensais } from './repeticao'
import type { Agendamento, Realizado } from './tipos'

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e))

/** Guarda aqui na hora (a tela responde já) e sobe ao banco. */
export async function agendar(itens: Agendamento[]) {
  if (!itens.length) return
  alterarBase((b) => void b.agenda.push(...itens))
  try {
    const ids = await banco.salvarAgendamentos(itens)
    alterarBase((b) => {
      for (const a of b.agenda) if (ids[a.id]) a.dbId = ids[a.id]
    })
  } catch (e) {
    avisar(`Agendado neste navegador, mas não deu para gravar no banco (${msg(e)}). Não vai aparecer nos outros aparelhos.`, 'erro')
  }
}

/**
 * Pagamento ou recebimento previsto, direto na agenda. Com `vezes` > 1, repete
 * todo mês a partir da primeira data (uma previsão por mês, cada uma
 * confirmada no seu dia).
 */
export async function agendarNovo(primeiraIso: string, vezes: number, dados: Omit<LancamentoNovo, 'date'>) {
  const datas = datasMensais(primeiraIso, vezes)
  const itens: Agendamento[] = datas.map((iso, i) => ({
    id: novoId('ag'),
    dbId: null,
    date: dataBr(iso),
    ...dados,
    ...(vezes > 1 ? { parcela: i + 1, parcelas: vezes } : {}),
  }))
  const acao = dados.type === 'receita' ? 'Recebimento' : 'Pagamento'
  avisar(
    vezes > 1
      ? `${acao} de ${fmtBRL(dados.value)} agendado todo mês, ${vezes} vezes: de ${dataBr(datas[0])} a ${dataBr(datas[datas.length - 1])}.`
      : `${acao} de ${fmtBRL(dados.value)} agendado para ${dataBr(datas[0])}.`,
  )
  await agendar(itens)
}

/**
 * "Aconteceu": sai da agenda e entra como lançamento no mês em que de fato
 * aconteceu — com a data e o valor reais, que podem ser diferentes do previsto.
 */
export async function confirmarAgendamento(id: string, realizado: Realizado) {
  const item = financas.ler().base.agenda.find((a) => a.id === id)
  const chave = chaveDoMes(realizado.data)
  if (!item || !chave) return
  const lanc: LancamentoNovo = {
    date: dataBr(realizado.data), desc: item.desc, type: item.type,
    source: item.source, category: item.category, value: realizado.valor,
  }

  alterarBase((b) => {
    const mes = garantirMes(b, chave)
    const jaExiste = mes.transactions.some(
      (t) => t.date === lanc.date && t.desc === lanc.desc && t.value === lanc.value && t.source === lanc.source,
    )
    if (!jaExiste) mes.transactions.push({ id: novoId(), ...lanc })
    b.agenda = b.agenda.filter((a) => a.id !== id)
  })
  avisar(`“${item.desc}” (${fmtBRL(lanc.value)}) entrou nos lançamentos de ${rotuloMes(chave)}.`)

  try {
    const competenciaId = await bancoFinancas.garantirCompetencia(chave, financas.ler().base.months[chave].bank)
    const lancamentoId = await bancoFinancas.salvarUmLancamento(competenciaId, lanc)
    if (item.dbId) await banco.marcarAgendamentoRealizado(item.dbId, lancamentoId, competenciaId)
  } catch (e) {
    avisar(`Confirmado neste navegador, mas o banco não recebeu (${msg(e)}). Tente de novo mais tarde.`, 'erro')
  }
}

export async function removerAgendamento(id: string) {
  const item = financas.ler().base.agenda.find((a) => a.id === id)
  if (!item) return
  alterarBase((b) => {
    b.agenda = b.agenda.filter((a) => a.id !== id)
  })
  if (!item.dbId) return
  try {
    await banco.excluirAgendamento(item.dbId)
  } catch (e) {
    avisar(`Tirado daqui, mas continua no banco (${msg(e)}).`, 'erro')
  }
}
