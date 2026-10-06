import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina'
import { PainelImportacao } from '@/features/importacao/components/painel-importacao'

/** Lançar à mão, anexar PDF, colar CSV, exemplo e regras de categoria. */
export function PaginaImportar() {
  return (
    <>
      <CabecalhoPagina titulo="Trazer lançamentos" contexto="Nada entra sem você revisar. Reimportar o mesmo extrato não duplica." />
      <PainelImportacao />
    </>
  )
}
