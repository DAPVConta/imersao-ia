/**
 * Ações do painel: o que acontece quando o usuário clica em algo.
 *
 * Padrão de todas: 1) muda a base local na hora (a tela responde já);
 * 2) sobe para o banco; 3) se o banco falhar, avisa — o dado fica salvo neste
 * navegador, mas não aparece nos outros aparelhos.
 */
import { agendar } from '@/features/agenda/acoes'
import { lerAgenda } from '@/features/agenda/banco'
import { avisar } from '@/lib/avisos'
import { diasAte, ehDataFutura, textoPrazo } from '@/lib/datas'
import { rotuloMes } from '@/lib/formato'
import * as banco from './banco'
import { novoId } from './calculos'
import { classificarExtrato, classificarFatura, REGRAS_PADRAO } from './classificacao'
import { DEMO } from './demo'
import { alterarBase, escolherMes, financas, garantirMes } from './store'
import type { BaseLocal, Lancamento, LancamentoNovo, ResumoCartao, ResumoConta } from './tipos'

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e))

/* ---------------- início ---------------- */

let iniciado = false

/** Lê o banco uma vez ao abrir o app (o StrictMode do React chama efeitos duas vezes). */
export async function iniciar() {
  if (iniciado) return
  iniciado = true
  const copia = structuredClone(financas.ler().base)
  const avisos: string[] = []
  let importados = 0
  let agendados = 0

  try {
    importados = await banco.sincronizarMeses(copia)
  } catch (e) {
    avisos.push(`não foi possível ler os lançamentos do banco (${msg(e)})`)
  }
  try {
    copia.agenda = await lerAgenda(copia.agenda)
    agendados = copia.agenda.length
  } catch (e) {
    avisos.push(`não foi possível ler a agenda (${msg(e)})`)
  }

  if (!Object.keys(copia.months).length) garantirMes(copia, '2026-07')
  // Abre no mês mais recente: é onde está o que foi importado por último.
  const meses = Object.keys(copia.months).sort()
  financas.definir((e) => ({ ...e, base: copia, mesAtual: meses[meses.length - 1], carregando: false }))

  if (avisos.length) {
    avisar(avisos.join('; ') + '. Exibindo apenas os dados deste navegador.', 'erro')
    return
  }
  const carregados: string[] = []
  if (importados) carregados.push(`${importados} lançamentos`)
  if (agendados) carregados.push(`${agendados} itens na agenda`)
  if (carregados.length) avisar(carregados.join(' e ') + ' carregados do banco.')
}

/* ---------------- meses ---------------- */

export function criarMes(chave: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(chave)) {
    avisar('Formato inválido. Use AAAA-MM.', 'erro')
    return false
  }
  alterarBase((b) => void garantirMes(b, chave))
  escolherMes(chave)
  avisar(`Mês ${rotuloMes(chave)} criado.`)
  return true
}

/* ---------------- lançamentos ---------------- */

/**
 * Lançamento manual. A DATA decide o destino: se ainda não chegou, vai para a
 * agenda (previsto, fora dos totais); se é hoje ou já passou, entra no mês
 * daquela data — não no mês aberto na tela, que pode ser outro.
 * `dataIsoForm` vem do <input type=date> (AAAA-MM-DD).
 */
export async function lancarManual(dataIsoForm: string, dados: Omit<LancamentoNovo, 'date'>) {
  const [y, m, d] = dataIsoForm.split('-')
  const date = `${d}/${m}/${y}`

  if (ehDataFutura(dataIsoForm)) {
    avisar(
      <>
        Data ainda não chegou: “{dados.desc}” foi para a <strong>agenda</strong> ({date},{' '}
        {textoPrazo(diasAte(dataIsoForm)).texto}). Não entra nos totais do mês até você confirmar que aconteceu.
      </>,
    )
    await agendar([{ id: novoId('ag'), dbId: null, date, ...dados }])
    return
  }

  const chave = `${y}-${m}`
  const lanc: Lancamento = { id: novoId(), date, ...dados }
  alterarBase((b) => void garantirMes(b, chave).transactions.push(lanc))
  escolherMes(chave)
  avisar(`Lançamento adicionado em ${rotuloMes(chave)}.`)

  try {
    const competenciaId = await banco.garantirCompetencia(chave, financas.ler().base.months[chave].bank)
    await banco.salvarUmLancamento(competenciaId, lanc)
  } catch (e) {
    avisar(`Lançado neste navegador, mas o banco não recebeu (${msg(e)}). Ele não vai aparecer nos outros aparelhos.`, 'erro')
  }
}

/** Remove só deste navegador (comportamento herdado — o banco não é alterado). */
export function excluirLancamento(chave: string, id: string) {
  alterarBase((b) => {
    const mes = b.months[chave]
    if (mes) mes.transactions = mes.transactions.filter((t) => t.id !== id)
  })
}

/* ---------------- importação ---------------- */

export type Complemento = { conta?: ResumoConta; cartao?: Partial<ResumoCartao> }

/** Confirma uma pré-visualização (PDF ou CSV) no mês escolhido e sobe ao banco. */
export async function confirmarImportacao(
  chave: string,
  linhas: LancamentoNovo[],
  origemTexto: string,
  complemento: Complemento | null,
) {
  const mesNovo = !financas.ler().base.months[chave]
  const novos: Lancamento[] = linhas.map((l) => ({ id: novoId(), ...l }))

  alterarBase((b) => {
    const mes = garantirMes(b, chave)
    mes.transactions.push(...novos)
    if (complemento?.conta) Object.assign(mes.bank, complemento.conta)
    if (complemento?.cartao) Object.assign(mes.card, complemento.cartao)
  })
  escolherMes(chave)

  const resumo = `${novos.length} lançamento(s) importado(s) via ${origemTexto} em ${rotuloMes(chave)}${mesNovo ? ' — mês criado' : ''}`
  try {
    const mes = financas.ler().base.months[chave]
    await banco.enviarImportacao(chave, mes.bank, complemento?.cartao ? mes.card : null, novos)
    avisar(`${resumo}. Salvo no banco de dados.`)
  } catch (e) {
    avisar(`${resumo}. Mas NÃO foi possível salvar no banco (${msg(e)}) — os dados estão apenas neste navegador.`, 'erro')
  }
}

/** Carrega o exemplo de julho/2026 no mês aberto (sem duplicar o que já existe). */
export function carregarDemo() {
  let chave = financas.ler().mesAtual
  if (!chave) chave = '2026-07'
  const alvo = chave
  alterarBase((b) => {
    const m = garantirMes(b, alvo)
    m.bank = { ...DEMO.conta }
    m.card = { ...DEMO.cartao }
    const existentes = new Set(m.transactions.map((t) => `${t.date}|${t.desc}|${t.value}`))
    for (const [date, desc, tipo, doc, value] of DEMO.extrato) {
      if (existentes.has(`${date}|${desc}|${value}`)) continue
      const cls = classificarExtrato(b.rules, doc, `${tipo} ${desc}`)
      if (cls.cat === 'Transferência') {
        m.transactions.push({ id: novoId(), date, desc, type: 'transferencia', source: 'conta', category: 'Transferência', value })
        continue
      }
      const type = cls.type ?? (/RECEBIDO|CREDITO/i.test(tipo) ? 'receita' : 'despesa')
      m.transactions.push({ id: novoId(), date, desc, type, source: 'conta', category: cls.cat, value })
    }
    for (const [date, desc, mcc, value] of DEMO.fatura) {
      if (existentes.has(`${date}|${desc}|${value}`)) continue
      m.transactions.push({
        id: novoId(), date, desc, type: 'despesa', source: 'cartao', category: classificarFatura(b.rules, mcc, desc), value,
      })
    }
  })
  escolherMes(alvo)
  avisar(`Exemplo de julho/2026 carregado em ${rotuloMes(alvo)}.`)
}

/* ---------------- regras ---------------- */

export function mudarCategoriaDaRegra(grupo: 'cnpj' | 'mcc', chave: string, categoria: string) {
  alterarBase((b) => {
    if (b.rules[grupo][chave]) b.rules[grupo][chave].cat = categoria
  })
}

export function excluirRegra(grupo: 'cnpj' | 'mcc', chave: string) {
  alterarBase((b) => void delete b.rules[grupo][chave])
}

/* ---------------- backup ---------------- */

export function exportarBackup() {
  const blob = new Blob([JSON.stringify(financas.ler().base, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'assistente-financeiro-backup.json'
  a.click()
  URL.revokeObjectURL(a.href)
}

export async function importarBackup(arquivo: File) {
  try {
    const lido = JSON.parse(await arquivo.text()) as BaseLocal
    if (!lido.months) throw new Error('formato inesperado')
    if (!Array.isArray(lido.agenda)) lido.agenda = []
    if (!lido.rules) lido.rules = structuredClone(REGRAS_PADRAO)
    const meses = Object.keys(lido.months).sort()
    financas.definir((e) => ({ ...e, base: lido, mesAtual: meses[meses.length - 1] ?? null }))
    avisar('Backup importado com sucesso.')
  } catch (e) {
    avisar(`Falha ao importar backup: ${msg(e)}`, 'erro')
  }
}
