import { describe, expect, it } from 'vitest'
import { datasMensais } from './repeticao'

describe('datasMensais', () => {
  it('repete no mesmo dia, virando o ano', () => {
    expect(datasMensais('2026-11-10', 3)).toEqual(['2026-11-10', '2026-12-10', '2027-01-10'])
  })
  it('dia 31 cai no último dia dos meses curtos e volta ao 31 depois', () => {
    expect(datasMensais('2027-01-31', 4)).toEqual(['2027-01-31', '2027-02-28', '2027-03-31', '2027-04-30'])
  })
  it('respeita ano bissexto', () => {
    expect(datasMensais('2028-01-30', 2)).toEqual(['2028-01-30', '2028-02-29'])
  })
  it('uma vez só devolve só a própria data', () => {
    expect(datasMensais('2026-10-05', 1)).toEqual(['2026-10-05'])
  })
})
