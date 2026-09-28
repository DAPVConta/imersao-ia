import { describe, expect, it } from 'vitest'
import type { Agendamento } from '@/features/financas/tipos'
import { textoPrazo } from '@/lib/datas'
import { filtrarAgenda, resumirAgenda } from './resumo'

const hoje = new Date(2026, 8, 28) // 28/09/2026
const ag = (date: string, type: Agendamento['type'], value: number): Agendamento => ({
  id: date + type, dbId: null, date, desc: 'x', type, source: 'conta', category: 'Outros', value,
})

describe('agenda', () => {
  const itens = [ag('20/09/2026', 'despesa', 50), ag('05/10/2026', 'despesa', 100), ag('10/10/2026', 'receita', 300), ag('30/12/2026', 'despesa', 999)]

  it('resume a pagar, a receber, atrasados e o previsto do mês', () => {
    expect(resumirAgenda(itens, '2026-10', 1000, hoje)).toEqual({
      aPagar30: 150, aReceber30: 300, atrasados: 1, valorAtrasado: 50, saldoPrevisto: 1200,
    })
  })
  it('filtra por 30 dias e por mês', () => {
    expect(filtrarAgenda(itens, '30', null, hoje)).toHaveLength(3)
    expect(filtrarAgenda(itens, 'mes', '2026-12', hoje)).toHaveLength(1)
    expect(filtrarAgenda(itens, 'todos', null, hoje)).toHaveLength(4)
  })
  it('descreve o prazo', () => {
    expect(textoPrazo(0).texto).toBe('é hoje')
    expect(textoPrazo(-3)).toEqual({ texto: 'passou há 3 dias', tom: 'venceu' })
  })
})
