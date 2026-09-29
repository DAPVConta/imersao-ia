import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioPill } from '@/components/ui/radio-group'
import { SeletorCategoria, SeletorOrigem } from '@/features/financas/components/seletores'
import type { Origem } from '@/features/financas/tipos'
import { avisar } from '@/lib/avisos'
import { dataBr, hojeIso } from '@/lib/datas'
import { fmtBRL } from '@/lib/formato'
import { agendarNovo } from '../acoes'
import { datasMensais } from '../repeticao'

type Sentido = 'despesa' | 'receita'

/** Amanhã em AAAA-MM-DD: o que se agenda ainda não aconteceu. */
function amanhaIso() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return hojeIso(d)
}

/**
 * Agendar um pagamento ou recebimento que ainda vai acontecer, uma vez ou
 * todo mês. Fica na agenda, fora dos totais, até o dono confirmar.
 */
export function FormAgendar({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const [sentido, setSentido] = useState<Sentido>('despesa')
  const [desc, setDesc] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState(amanhaIso)
  const [categoria, setCategoria] = useState('Moradia')
  const [origem, setOrigem] = useState<Origem>('conta')
  const [repete, setRepete] = useState<'uma' | 'mensal'>('uma')
  const [meses, setMeses] = useState('12')

  const numero = parseFloat(valor.replace(',', '.'))
  const vezes = repete === 'mensal' ? Math.trunc(Number(meses)) : 1
  const vezesValidas = vezes >= 1 && vezes <= 120 && (repete === 'uma' || vezes >= 2)
  const datas = useMemo(() => (data && vezesValidas ? datasMensais(data, vezes) : []), [data, vezes, vezesValidas])

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (!data || !desc.trim() || isNaN(numero) || numero <= 0) {
      avisar('Preencha descrição, valor e data para agendar.', 'erro')
      return
    }
    if (!vezesValidas) {
      avisar('Para repetir todo mês, escolha de 2 a 120 meses.', 'erro')
      return
    }
    void agendarNovo(data, vezes, { desc: desc.trim(), type: sentido, source: origem, category: categoria, value: numero })
    setDesc('')
    setValor('')
    aoFechar()
  }

  const pagar = sentido === 'despesa'

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={enviar} className="grid gap-4">
          <DialogTitle>Agendar</DialogTitle>
          <DialogDescription>
            Fica na agenda e não entra nos totais do mês até você marcar que aconteceu.
          </DialogDescription>

          <RadioGroup value={sentido} onValueChange={(v) => setSentido(v as Sentido)} aria-label="Pagar ou receber">
            <RadioPill value="despesa">Vou pagar</RadioPill>
            <RadioPill value="receita">Vou receber</RadioPill>
          </RadioGroup>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="ag-desc">Descrição</Label>
              <Input id="ag-desc" placeholder={pagar ? 'Ex: Aluguel' : 'Ex: Salário'} value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ag-valor">Valor (R$)</Label>
              <Input id="ag-valor" type="number" inputMode="decimal" step="0.01" min="0" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ag-data">{repete === 'mensal' ? 'Primeira data' : 'Data'}</Label>
              <Input id="ag-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ag-cat">Categoria</Label>
              <SeletorCategoria id="ag-cat" valor={categoria} aoMudar={setCategoria} />
            </div>
            <div>
              <Label htmlFor="ag-origem">{pagar ? 'Sai de' : 'Entra em'}</Label>
              <SeletorOrigem id="ag-origem" valor={origem} aoMudar={setOrigem} />
            </div>
          </div>

          <div className="grid gap-3">
            <RadioGroup value={repete} onValueChange={(v) => setRepete(v as 'uma' | 'mensal')} aria-label="Repetição">
              <RadioPill value="uma">Só uma vez</RadioPill>
              <RadioPill value="mensal">Todo mês</RadioPill>
            </RadioGroup>
            {repete === 'mensal' && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Label htmlFor="ag-meses" className="mb-0">Por quantos meses</Label>
                <Input id="ag-meses" type="number" min="2" max="120" step="1" className="w-[90px]" value={meses} onChange={(e) => setMeses(e.target.value)} />
              </div>
            )}
            {repete === 'mensal' && datas.length > 1 && (
              <p className="text-[13px] text-ink-mute">
                {datas.length} previsões, de {dataBr(datas[0])} a {dataBr(datas[datas.length - 1])}
                {numero > 0 && <>, somando <span className="num font-semibold text-ink">{fmtBRL(numero * datas.length)}</span></>}.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={aoFechar}>Cancelar</Button>
            <Button type="submit" variant="default">{pagar ? 'Agendar pagamento' : 'Agendar recebimento'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
