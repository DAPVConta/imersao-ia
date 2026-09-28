import type { Regras, TipoLancamento } from './tipos'

/**
 * Classificação automática ao importar. A chave estável é o CNPJ/CPF do
 * favorecido (extrato) ou o MCC do estabelecimento (fatura): o nome muda, esses
 * códigos não. Se nada casar, cai nas palavras-chave; por último, "Outros".
 */
export const REGRAS_PADRAO: Regras = {
  cnpj: {
    '18.442.907/0001-56': { cat: 'Moradia', label: 'Imobiliária / Aluguel' },
    '07.331.204/0001-18': { cat: 'Moradia', label: 'Condomínio' },
    '02.449.992/0001-64': { cat: 'Assinaturas', label: 'Internet' },
    '31.775.610/0001-92': { cat: 'Salário', label: 'Empregador', type: 'receita' },
    '61.695.227/0001-93': { cat: 'Moradia', label: 'Energia elétrica' },
    '03.476.811/0042-07': { cat: 'Supermercado', label: 'Supermercado' },
    '60.746.948/0001-12': { cat: '__bank__', label: 'Banco (tarifa/rendimento/fatura/aplicação)' },
    '12.547.716/0088-40': { cat: 'Saúde', label: 'Academia' },
    '44.902.316/0001-77': { cat: 'Educação', label: 'Curso / escola' },
    '33.000.167/1102-83': { cat: 'Transporte', label: 'Posto de combustível' },
    '43.202.472/0001-30': { cat: 'Saúde', label: 'Plano de saúde' },
    '29.118.554/0001-05': { cat: 'Outros', label: 'Renda extra (PIX recebido)', type: 'receita' },
    '61.585.865/0221-49': { cat: 'Saúde', label: 'Farmácia' },
    '61.198.164/0001-60': { cat: 'Outros', label: 'Seguro' },
    '22.640.913/0001-24': { cat: 'Outros', label: 'Pet shop' },
  },
  mcc: {
    '5812': { cat: 'Alimentação', label: 'Restaurantes e lanchonetes' },
    '5541': { cat: 'Transporte', label: 'Postos de combustível' },
    '4899': { cat: 'Assinaturas', label: 'TV por assinatura / streaming' },
    '5912': { cat: 'Saúde', label: 'Farmácias e drogarias' },
    '5999': { cat: 'Outros', label: 'Varejo diverso' },
    '5411': { cat: 'Supermercado', label: 'Supermercados e mercearias' },
    '5735': { cat: 'Assinaturas', label: 'Música e mídia digital' },
    '4121': { cat: 'Transporte', label: 'Táxi e transporte por app' },
    '5942': { cat: 'Educação', label: 'Livrarias' },
    '5722': { cat: 'Lazer/Compras', label: 'Eletrodomésticos' },
    '5462': { cat: 'Alimentação', label: 'Padarias e confeitarias' },
    '7832': { cat: 'Lazer/Compras', label: 'Cinemas' },
    '5655': { cat: 'Lazer/Compras', label: 'Artigos esportivos' },
  },
}

const PALAVRAS_CHAVE: [RegExp, string][] = [
  [/superm|mercad|hiper|extra|carrefour|dia\b/i, 'Supermercado'],
  [/farmac|drogar|drogasil/i, 'Saúde'],
  [/posto|combust|shell|ipiranga|petrobras/i, 'Transporte'],
  [/uber|99app|taxi|transporte/i, 'Transporte'],
  [/netflix|spotify|prime|disney|hbo|icloud|apple\.com|assinatura|streaming/i, 'Assinaturas'],
  [/academia|smartfit|fitness/i, 'Saúde'],
  [/aluguel|condomin|imob/i, 'Moradia'],
  [/energia|enel|luz|cpfl|light|elektro|agua|sabesp|gas\b|internet|vivo|claro|tim|fibra/i, 'Moradia'],
  [/restaurante|lanchonete|ifood|padaria|pizzaria|hamburgu/i, 'Alimentação'],
  [/escola|curso|faculdade|cultura inglesa|colegio/i, 'Educação'],
  [/salario|folha|pagamento.*ltda|credito ted/i, 'Salário'],
  [/rendimento|cdb|aplicacao|resgate/i, 'Rendimentos'],
]

export type Classificacao = { cat: string; type: TipoLancamento | null }

/** Linha de extrato bancário. `desc` deve vir como "TIPO DESCRIÇÃO". */
export function classificarExtrato(regras: Regras, doc: string, desc: string): Classificacao {
  const regra = doc ? regras.cnpj[doc] : undefined
  if (regra) {
    if (regra.cat === '__bank__') {
      // O CNPJ do próprio banco cobre várias operações: decide pela descrição.
      if (/PAGTO FATURA/i.test(desc)) return { cat: 'Transferência', type: 'transferencia' }
      if (/TARIFA/i.test(desc)) return { cat: 'Outros', type: 'despesa' }
      if (/RENDIMENTO/i.test(desc)) return { cat: 'Rendimentos', type: 'receita' }
      if (/CONTA INVESTIMENTO|APLICACAO|RESGATE/i.test(desc)) return { cat: 'Transferência', type: 'transferencia' }
      return { cat: 'Outros', type: 'despesa' }
    }
    return { cat: regra.cat, type: regra.type ?? null }
  }
  if (/PAGTO FATURA|FATURA CARTAO/i.test(desc)) return { cat: 'Transferência', type: 'transferencia' }
  if (/CONTA INVESTIMENTO|APLICACAO CDB|RESGATE/i.test(desc)) return { cat: 'Transferência', type: 'transferencia' }
  for (const [re, cat] of PALAVRAS_CHAVE) if (re.test(desc)) return { cat, type: null }
  return { cat: 'Outros', type: null }
}

/** Linha de fatura de cartão. */
export function classificarFatura(regras: Regras, mcc: string, desc: string): string {
  if (mcc && regras.mcc[mcc]) return regras.mcc[mcc].cat
  for (const [re, cat] of PALAVRAS_CHAVE) if (re.test(desc)) return cat
  return 'Outros'
}
