import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { carregarDemo } from '@/features/financas/acoes'
import { FormManual } from './form-manual'
import { ImportarCsv } from './importar-csv'
import { ImportarPdf } from './importar-pdf'
import { TabelaRegras } from './tabela-regras'

export function PainelImportacao() {
  return (
    <Card id="trazer-lancamentos" className="scroll-mt-20">
      <CardTitle dica="Nada entra sem você revisar. Reimportar o mesmo extrato não duplica lançamentos.">Trazer lançamentos</CardTitle>
      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual" data-aba="manual">Lançar à mão</TabsTrigger>
          <TabsTrigger value="pdf">PDF do extrato ou da fatura</TabsTrigger>
          <TabsTrigger value="csv">Colar planilha (CSV)</TabsTrigger>
          <TabsTrigger value="demo">Dados de exemplo</TabsTrigger>
          <TabsTrigger value="regras">Regras de categoria</TabsTrigger>
        </TabsList>
        <TabsContent value="manual"><FormManual /></TabsContent>
        {/* forceMount: a pré-visualização não se perde ao trocar de aba */}
        <TabsContent value="pdf" forceMount className="data-[state=inactive]:hidden"><ImportarPdf /></TabsContent>
        <TabsContent value="csv" forceMount className="data-[state=inactive]:hidden"><ImportarCsv /></TabsContent>
        <TabsContent value="demo">
          <p className="mb-4 max-w-[70ch] text-[13.5px] text-ink-mute">
            Carrega os lançamentos já extraídos do extrato bancário e da fatura de cartão de <strong>julho/2026</strong> (dados fictícios do
            curso), no mês selecionado atualmente.
          </p>
          <Button variant="default" onClick={carregarDemo}>Carregar exemplo Julho/2026</Button>
        </TabsContent>
        <TabsContent value="regras"><TabelaRegras /></TabsContent>
      </Tabs>
    </Card>
  )
}
