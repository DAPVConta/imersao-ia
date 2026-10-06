/** O que a função `dicas-financeiras` (Edge Function) devolve. */
export interface Dica {
  titulo: string
  explicacao: string
  /** Quanto a dica pode economizar por mês, em reais; null quando a IA não estima. */
  economia_mensal_estimada: number | null
}

export interface DicasDaIA {
  resumo: string
  dicas: Dica[]
  /** Algo que pede atenção logo (conta atrasada, mês no vermelho...). */
  alerta: string | null
  modelo: string
  /** ISO 8601 */
  gerado_em: string
}
