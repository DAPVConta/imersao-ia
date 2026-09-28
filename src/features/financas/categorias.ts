/**
 * Categorias do painel. O `id` é o NOME exibido e é também o que liga ao banco
 * (categorias.nome). A cor é um token CSS definido em src/index.css.
 */
export const CATEGORIAS = [
  { id: 'Moradia', cor: 'var(--cat-moradia)' },
  { id: 'Alimentação', cor: 'var(--cat-alimentacao)' },
  { id: 'Supermercado', cor: 'var(--cat-mercado)' },
  { id: 'Transporte', cor: 'var(--cat-transporte)' },
  { id: 'Saúde', cor: 'var(--cat-saude)' },
  { id: 'Assinaturas', cor: 'var(--cat-assinaturas)' },
  { id: 'Lazer/Compras', cor: 'var(--cat-lazer)' },
  { id: 'Educação', cor: 'var(--cat-educacao)' },
  { id: 'Salário', cor: 'var(--cat-moradia)' },
  { id: 'Rendimentos', cor: 'var(--cat-mercado)' },
  { id: 'Outros', cor: 'var(--cat-outros)' },
] as const

export const NOMES_CATEGORIAS: string[] = CATEGORIAS.map((c) => c.id)

export function corDaCategoria(id: string): string {
  return CATEGORIAS.find((c) => c.id === id)?.cor ?? 'var(--cat-outros)'
}

export const ROTULO_TIPO = {
  despesa: 'Despesa',
  receita: 'Receita',
  transferencia: 'Transferência',
} as const

export const ROTULO_ORIGEM = { conta: 'Conta', cartao: 'Cartão' } as const
