/**
 * Transforma as linhas de texto de um extrato/fatura em lançamentos.
 * Feito para o modelo dos documentos de exemplo (Banco Horizonte / Cartão
 * Horizonte); outros bancos passam pela regra "solta" e pela revisão manual.
 */
import { classificarExtrato, classificarFatura } from '@/features/financas/classificacao'
import type { LancamentoNovo, Regras, ResumoCartao, ResumoConta, TipoLancamento } from '@/features/financas/tipos'

/** '1.234,56' → 1234.56 ; '-80,00' → -80 */
export function paraNumero(texto: string | undefined): number {
  if (!texto) return NaN
  const negativo = /^-/.test(texto.trim())
  const n = parseFloat(texto.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'))
  return isNaN(n) ? NaN : negativo ? -Math.abs(n) : n
}

const TIPOS_EXTRATO = [
  'PIX ENVIADO', 'PIX RECEBIDO', 'DEB AUTOMATICO', 'DEBITO AUTOMATICO', 'COMPRA DEBITO', 'COMPRA CARTAO DEBITO',
  'CREDITO TED', 'CREDITO PIX', 'TED', 'DOC', 'PAGTO FATURA', 'PAGAMENTO FATURA', 'SAQUE', 'TARIFA',
  'TARIFA BANCARIA', 'RENDIMENTO', 'ESTORNO', 'TRANSFERENCIA',
]

export type LinhaExtrato = { date: string; desc: string; tipo: string; doc: string; value: number }
export type LinhaFatura = { date: string; desc: string; mcc: string; value: number }

export function lerLinhasExtrato(linhas: string[]): LinhaExtrato[] {
  const tipos = TIPOS_EXTRATO.join('|')
  // Linha completa: DATA DESCRIÇÃO TIPO [CNPJ/CPF|-] VALOR SALDO
  const completa = new RegExp(`^(\\d{2}\\/\\d{2}\\/\\d{4})\\s+(.+)\\s+(${tipos})\\s+(.*?)\\s*(-?[\\d.,]+)\\s+(-?[\\d.,]+)$`, 'i')
  // Linha solta: DATA DESCRIÇÃO ... VALOR
  const solta = /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?[\d.,]+)$/
  const saida: LinhaExtrato[] = []
  const inicio = linhas.findIndex((l) => /^Lan[cç]amentos$/i.test(l))
  for (const linha of inicio >= 0 ? linhas.slice(inicio) : linhas) {
    if (/Totais por tipo|SALDO ANTERIOR$/i.test(linha)) continue
    let m = linha.match(completa)
    if (m) {
      const doc = (m[4] || '').trim()
      saida.push({ date: m[1], desc: m[2].trim(), tipo: m[3], doc: doc === '-' ? '' : doc, value: paraNumero(m[5]) })
      continue
    }
    m = linha.match(solta)
    if (m && !/^Data\s/i.test(linha) && !/^SALDO ANTERIOR$/i.test(m[2].trim())) {
      saida.push({ date: m[1], desc: m[2].trim(), tipo: '', doc: '', value: paraNumero(m[3]) })
    }
  }
  return saida
}

export function lerLinhasFatura(linhas: string[]): LinhaFatura[] {
  const completa = /^(\d{2}\/\d{2}\/\d{4})\s+(.+)\s+(\d{4})\s+.+?\s+([\d.,]+)$/
  const solta = /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d.,]+)$/
  const saida: LinhaFatura[] = []
  const inicio = linhas.findIndex((l) => /Compras e lan[cç]amentos/i.test(l))
  const fim = linhas.findIndex((l) => /^TOTAL DAS COMPRAS/i.test(l))
  const trecho = inicio >= 0 ? linhas.slice(inicio + 1, fim >= 0 ? fim : undefined) : linhas
  for (const linha of trecho) {
    if (/^Data\s/i.test(linha)) continue
    let m = linha.match(completa)
    if (m) {
      saida.push({ date: m[1], desc: m[2].trim(), mcc: m[3], value: paraNumero(m[4]) })
      continue
    }
    m = linha.match(solta)
    if (m) saida.push({ date: m[1], desc: m[2].trim(), mcc: '', value: paraNumero(m[3]) })
  }
  return saida
}

const casar = (texto: string, re: RegExp) => {
  const m = texto.match(re)
  return m ? paraNumero(m[1]) : null
}
/** Tira datas e percentuais que atrapalham achar os valores do resumo. */
const limparResumo = (bruto: string) =>
  bruto
    .replace(/\(\d{2}\/\d{2}\/\d{4}\)/g, '')
    .replace(/em\s*\d{2}\/\d{2}\/\d{4}/gi, '')
    .replace(/\(\d+(?:[.,]\d+)?%\)/g, '')

export function resumoExtrato(linhas: string[]): ResumoConta {
  const t = limparResumo(linhas.join('\n'))
  return {
    saldoAnterior: casar(t, /Saldo anterior[^\d-]*(-?[\d.,]+)/i),
    saldoFinal: casar(t, /Saldo final[^\d-]*(-?[\d.,]+)/i),
  }
}

export function resumoFatura(linhas: string[]): ResumoCartao {
  const t = limparResumo(linhas.join('\n'))
  const abs = (v: number | null) => (v == null ? null : Math.abs(v))
  return {
    saldoAnterior: abs(casar(t, /Saldo da fatura anterior\s+(-?[\d.,]+)/i)),
    total: abs(casar(t, /TOTAL DESTA FATURA\s+(-?[\d.,]+)/i)),
    comprasPeriodo: abs(casar(t, /Compras do per[ií]odo\s+(-?[\d.,]+)/i)),
    limiteTotal: abs(casar(t, /Limite total\s+(-?[\d.,]+)/i)),
    pagamentoMinimo: abs(casar(t, /Pagamento m[ií]nimo[^\d-]*(-?[\d.,]+)/i)),
    pagamento: abs(casar(t, /Pagamento recebido[^\d-]*(-?[\d.,]+)/i)),
    vencimento: t.match(/Vencimento:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1] ?? '',
    fechamento: t.match(/Fechamento:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1] ?? '',
  }
}

/** Extrato → lançamentos já classificados. */
export function lancamentosDoExtrato(regras: Regras, linhas: LinhaExtrato[]): LancamentoNovo[] {
  return linhas.map((r) => {
    const cls = classificarExtrato(regras, r.doc, `${r.tipo} ${r.desc}`)
    const type: TipoLancamento = cls.type ?? (r.value >= 0 ? 'receita' : 'despesa')
    return {
      date: r.date, desc: r.desc, type, source: 'conta',
      category: type === 'transferencia' ? 'Transferência' : cls.cat, value: Math.abs(r.value),
    }
  })
}

/** Fatura → lançamentos (sempre despesas no cartão). */
export function lancamentosDaFatura(regras: Regras, linhas: LinhaFatura[]): LancamentoNovo[] {
  return linhas.map((r) => ({
    date: r.date, desc: r.desc, type: 'despesa', source: 'cartao',
    category: classificarFatura(regras, r.mcc, r.desc), value: Math.abs(r.value),
  }))
}

const TIPOS: TipoLancamento[] = ['receita', 'despesa', 'transferencia']
/** Tipo desconhecido vira despesa (é o que a pré-visualização mostraria). */
const paraTipo = (t: string | undefined): TipoLancamento => {
  const minusculo = (t || '').toLowerCase() as TipoLancamento
  return TIPOS.includes(minusculo) ? minusculo : 'despesa'
}

/**
 * CSV colado: uma linha por lançamento, separada por ponto e vírgula.
 * data;descrição;tipo;origem;categoria;valor
 */
export function lerCsv(texto: string): LancamentoNovo[] {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linha) => {
      const [date, desc, tipo, origem, categoria, valor] = linha.split(';').map((s) => s.trim())
      return {
        date,
        desc,
        type: paraTipo(tipo),
        source: ((origem || 'conta').toLowerCase() === 'cartao' ? 'cartao' : 'conta') as LancamentoNovo['source'],
        category: categoria || 'Outros',
        value: parseFloat((valor || '0').replace(',', '.')),
      }
    })
    .filter((r) => r.date && r.desc && !isNaN(r.value))
}
