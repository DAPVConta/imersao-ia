import { FileText } from 'lucide-react'
import { useRef, useState } from 'react'
import { RadioGroup, RadioPill } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/input'
import type { Complemento } from '@/features/financas/acoes'
import { financas } from '@/features/financas/store'
import type { LancamentoNovo } from '@/features/financas/tipos'
import { cn } from '@/lib/utils'
import {
  lancamentosDaFatura, lancamentosDoExtrato, lerLinhasExtrato, lerLinhasFatura, resumoExtrato, resumoFatura,
} from '../leitores'
import { extrairLinhasDoPdf } from '../pdf'
import { PreVisualizacao } from './pre-visualizacao'

type Previa = { linhas: LancamentoNovo[]; complemento: Complemento | null; chave: number }

export function ImportarPdf() {
  const [tipo, setTipo] = useState<'bank' | 'card'>('bank')
  const [arrastando, setArrastando] = useState(false)
  const [situacao, setSituacao] = useState('')
  const [textoBruto, setTextoBruto] = useState<string | null>(null)
  const [previa, setPrevia] = useState<Previa | null>(null)
  const arquivo = useRef<HTMLInputElement>(null)

  async function ler(f: File) {
    setSituacao('Lendo PDF...')
    setPrevia(null)
    setTextoBruto(null)
    try {
      const linhasPdf = await extrairLinhasDoPdf(f)
      const regras = financas.ler().base.rules
      let linhas: LancamentoNovo[]
      let complemento: Complemento | null = null
      if (tipo === 'bank') {
        linhas = lancamentosDoExtrato(regras, lerLinhasExtrato(linhasPdf))
        const conta = resumoExtrato(linhasPdf)
        if (conta.saldoAnterior != null || conta.saldoFinal != null) complemento = { conta }
      } else {
        linhas = lancamentosDaFatura(regras, lerLinhasFatura(linhasPdf))
        const cartao = resumoFatura(linhasPdf)
        if (Object.values(cartao).some((v) => v != null && v !== '')) complemento = { cartao }
      }
      if (!linhas.length) {
        setSituacao('Não foi possível reconhecer o formato automaticamente. Confira o texto extraído abaixo e use a aba "Colar CSV" se preferir montar os lançamentos manualmente.')
        setTextoBruto(linhasPdf.join('\n'))
        return
      }
      setSituacao(`${linhas.length} lançamento(s) encontrados. Revise antes de importar:`)
      setPrevia({ linhas, complemento, chave: Date.now() })
    } catch (e) {
      setSituacao('Erro ao ler o PDF: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  return (
    <div>
      <p className="mb-2.5 text-[11.5px] text-ink-mute">
        Funciona melhor com extratos/faturas no mesmo modelo dos documentos de exemplo (Banco Horizonte / Cartão Horizonte). Para outros
        bancos, revise a pré-visualização antes de confirmar — nada é importado sem sua confirmação.
      </p>
      <RadioGroup value={tipo} onValueChange={(v) => setTipo(v as 'bank' | 'card')} className="mb-2.5" aria-label="Tipo de documento">
        <RadioPill value="bank">Extrato bancário</RadioPill>
        <RadioPill value="card">Fatura de cartão</RadioPill>
      </RadioGroup>
      <button
        type="button"
        onClick={() => arquivo.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setArrastando(true) }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault()
          setArrastando(false)
          const f = e.dataTransfer.files[0]
          if (f) void ler(f)
        }}
        className={cn(
          'w-full rounded-[14px] border-[1.5px] border-dashed border-rule-strong bg-sheet-2 px-4 py-[34px] text-center text-ink-2',
          'transition-[border-color,background-color,transform] duration-150 hover:scale-[1.004] hover:border-navy-3 hover:stripe',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          arrastando && 'border-gold stripe',
        )}
      >
        <div className="inline-flex items-center gap-2 font-semibold"><FileText className="size-4" /> Clique ou arraste o PDF aqui</div>
        <div className="mt-1.5 text-[11.5px] text-ink-mute">O arquivo é lido inteiramente no seu navegador.</div>
      </button>
      <input
        ref={arquivo} type="file" accept="application/pdf" className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void ler(f)
          e.target.value = ''
        }}
      />
      {situacao && <div className="mt-2 text-[11.5px] text-ink-mute">{situacao}</div>}
      {textoBruto != null && <Textarea readOnly rows={8} value={textoBruto} className="mt-2" />}
      {previa && (
        <PreVisualizacao
          key={previa.chave} linhas={previa.linhas} origemTexto="PDF" complemento={previa.complemento}
          aoTerminar={() => { setPrevia(null); setSituacao('') }}
        />
      )}
    </div>
  )
}
