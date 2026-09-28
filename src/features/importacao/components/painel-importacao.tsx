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
    <Card>
      <CardTitle>Importar / lançar dados</CardTitle>
      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">Lançamento manual</TabsTrigger>
          <TabsTrigger value="pdf">Anexar PDF (extrato/fatura)</TabsTrigger>
          <TabsTrigger value="csv">Colar CSV</TabsTrigger>
          <TabsTrigger value="demo">Exemplo Jul/2026</TabsTrigger>
          <TabsTrigger value="regras">Regras de categorização</TabsTrigger>
        </TabsList>
        <TabsContent value="manual"><FormManual /></TabsContent>
        {/* forceMount: a pré-visualização não se perde ao trocar de aba */}
        <TabsContent value="pdf" forceMount className="data-[state=inactive]:hidden"><ImportarPdf /></TabsContent>
        <TabsContent value="csv" forceMount className="data-[state=inactive]:hidden"><ImportarCsv /></TabsContent>
        <TabsContent value="demo">
          <p className="mb-2.5 text-[11.5px] text-ink-mute">
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
