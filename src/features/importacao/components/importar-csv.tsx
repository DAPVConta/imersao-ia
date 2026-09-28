import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import type { LancamentoNovo } from '@/features/financas/tipos'
import { lerCsv } from '../leitores'
import { PreVisualizacao } from './pre-visualizacao'

export function ImportarCsv() {
  const [texto, setTexto] = useState('')
  const [previa, setPrevia] = useState<{ linhas: LancamentoNovo[]; chave: number } | null>(null)

  return (
    <div>
      <p className="mb-2 text-[11.5px] text-ink-mute">
        Uma linha por lançamento: <code>data;descrição;tipo;origem;categoria;valor</code>
        <br />
        tipo = receita|despesa|transferencia · origem = conta|cartao · data = DD/MM/AAAA
      </p>
      <Textarea
        rows={6} value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Lançamentos em CSV"
        placeholder={'05/07/2026;Salário;receita;conta;Salário;8450\n07/07/2026;Restaurante;despesa;cartao;Alimentação;68.90'}
      />
      <div className="mt-2.5">
        <Button variant="default" onClick={() => texto.trim() && setPrevia({ linhas: lerCsv(texto), chave: Date.now() })}>
          Pré-visualizar CSV
        </Button>
      </div>
      {previa && (
        <PreVisualizacao key={previa.chave} linhas={previa.linhas} origemTexto="CSV" complemento={null} aoTerminar={() => setPrevia(null)} />
      )}
    </div>
  )
}
