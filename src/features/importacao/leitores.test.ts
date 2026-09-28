import { describe, expect, it } from 'vitest'
import { REGRAS_PADRAO } from '@/features/financas/classificacao'
import {
  lancamentosDoExtrato, lerCsv, lerLinhasExtrato, lerLinhasFatura, paraNumero, resumoExtrato, resumoFatura,
} from './leitores'

describe('paraNumero', () => {
  it('entende o formato brasileiro', () => {
    expect(paraNumero('1.234,56')).toBe(1234.56)
    expect(paraNumero('-80,00')).toBe(-80)
    expect(paraNumero('')).toBeNaN()
  })
})

describe('extrato', () => {
  const linhas = [
    'Saldo anterior (01/07/2026) 3.420,55',
    'Lançamentos',
    'Data Descrição Tipo CNPJ/CPF Valor Saldo',
    '05/07/2026 CREDITO SALARIO - NOVA MIDIA LTDA CREDITO TED 31.775.610/0001-92 8.450,00 11.870,55',
    '08/07/2026 PAGTO FATURA CARTAO FINAL 4417 PAGTO FATURA 60.746.948/0001-12 -2.187,43 9.683,12',
    '11/07/2026 SAQUE TERMINAL 24H SAQUE - -200,00 9.483,12',
    'Saldo final 4.278,20',
  ]
  it('lê as linhas e classifica', () => {
    const r = lancamentosDoExtrato(REGRAS_PADRAO, lerLinhasExtrato(linhas))
    expect(r).toHaveLength(3)
    expect(r[0]).toMatchObject({ type: 'receita', category: 'Salário', value: 8450 })
    expect(r[1]).toMatchObject({ type: 'transferencia', category: 'Transferência', value: 2187.43 })
    expect(r[2]).toMatchObject({ type: 'despesa', value: 200 })
  })
  it('acha os saldos', () => {
    expect(resumoExtrato(linhas)).toEqual({ saldoAnterior: 3420.55, saldoFinal: 4278.2 })
  })
})

describe('fatura', () => {
  const linhas = [
    'Vencimento: 08/08/2026 Fechamento: 28/07/2026',
    'TOTAL DESTA FATURA 2.454,77',
    'Limite total 12.000,00',
    'Compras e lançamentos',
    'Data Descrição MCC Categoria Valor',
    '01/07/2026 IFOOD *RESTAURANTE MASSA NOSTRA 5812 Restaurantes 68,90',
    'TOTAL DAS COMPRAS 68,90',
  ]
  it('lê compras só entre o título e o total', () => {
    expect(lerLinhasFatura(linhas)).toEqual([{ date: '01/07/2026', desc: 'IFOOD *RESTAURANTE MASSA NOSTRA', mcc: '5812', value: 68.9 }])
  })
  it('acha o resumo', () => {
    expect(resumoFatura(linhas)).toMatchObject({ total: 2454.77, limiteTotal: 12000, vencimento: '08/08/2026', fechamento: '28/07/2026' })
  })
})

describe('csv', () => {
  it('lê linhas válidas, ignora as incompletas e corrige tipo desconhecido', () => {
    const r = lerCsv('05/07/2026;Salário;receita;conta;Salário;8450\n07/07/2026;Bar;xyz;cartao;Lazer/Compras;68,90\nlixo')
    expect(r).toHaveLength(2)
    expect(r[1]).toMatchObject({ type: 'despesa', source: 'cartao', value: 68.9 })
  })
})
