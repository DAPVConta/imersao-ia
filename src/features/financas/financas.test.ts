import { describe, expect, it } from 'vitest'
import { detectarMes, serieMensal, totaisDoMes, mesVazio } from './calculos'
import { classificarExtrato, classificarFatura, REGRAS_PADRAO } from './classificacao'
import type { BaseLocal, Lancamento } from './tipos'

const lanc = (p: Partial<Lancamento>): Lancamento => ({
  id: 'x', date: '01/07/2026', desc: 'x', type: 'despesa', source: 'conta', category: 'Outros', value: 0, ...p,
})

describe('classificação', () => {
  it('usa o CNPJ quando conhecido', () => {
    expect(classificarExtrato(REGRAS_PADRAO, '31.775.610/0001-92', 'CREDITO TED SALARIO')).toEqual({ cat: 'Salário', type: 'receita' })
  })
  it('CNPJ do banco decide pela operação', () => {
    const banco = '60.746.948/0001-12'
    expect(classificarExtrato(REGRAS_PADRAO, banco, 'PAGTO FATURA CARTAO').type).toBe('transferencia')
    expect(classificarExtrato(REGRAS_PADRAO, banco, 'TARIFA PACOTE')).toEqual({ cat: 'Outros', type: 'despesa' })
    expect(classificarExtrato(REGRAS_PADRAO, banco, 'RENDIMENTO CDB')).toEqual({ cat: 'Rendimentos', type: 'receita' })
  })
  it('cai nas palavras-chave e depois em Outros', () => {
    expect(classificarExtrato(REGRAS_PADRAO, '', 'COMPRA DROGASIL').cat).toBe('Saúde')
    expect(classificarExtrato(REGRAS_PADRAO, '', 'PIX FULANO')).toEqual({ cat: 'Outros', type: null })
  })
  it('fatura usa o MCC', () => {
    expect(classificarFatura(REGRAS_PADRAO, '5812', 'QUALQUER')).toBe('Alimentação')
    expect(classificarFatura(REGRAS_PADRAO, '', 'UBER TRIP')).toBe('Transporte')
  })
})

describe('totais', () => {
  it('transferência não entra em receita nem despesa', () => {
    const mes = mesVazio()
    mes.transactions = [
      lanc({ type: 'receita', value: 1000 }),
      lanc({ type: 'despesa', value: 300, category: 'Moradia' }),
      lanc({ type: 'transferencia', value: 999 }),
    ]
    expect(totaisDoMes(mes)).toEqual({ receitas: 1000, despesas: 300, saldo: 700, porCategoria: { Moradia: 300 } })
  })
  it('mês inexistente dá zero', () => {
    expect(totaisDoMes(undefined).saldo).toBe(0)
  })
  it('série sai em ordem cronológica', () => {
    const base = { months: { '2026-08': mesVazio(), '2026-07': mesVazio() } } as unknown as BaseLocal
    expect(serieMensal(base).map((p) => p.chave)).toEqual(['2026-07', '2026-08'])
  })
})

describe('detectarMes', () => {
  it('escolhe o mês predominante e desempata pelo mais antigo', () => {
    expect(detectarMes([{ date: '30/06/2026' }, { date: '01/07/2026' }, { date: '02/07/2026' }])).toBe('2026-07')
    expect(detectarMes([{ date: '01/08/2026' }, { date: '01/07/2026' }])).toBe('2026-07')
    expect(detectarMes([{ date: 'lixo' }])).toBeNull()
  })
})
