import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { lancarManual } from '@/features/financas/acoes'
import { SeletorCategoria, SeletorOrigem, SeletorTipo } from '@/features/financas/components/seletores'
import type { Origem, TipoLancamento } from '@/features/financas/tipos'
import { avisar } from '@/lib/avisos'
import { hojeIso } from '@/lib/datas'

/** Data de hoje ou passada → entra no mês. Data futura → vai para a agenda. */
export function FormManual() {
  // Começa em hoje: é a partir dela que o painel decide entre lançamento e agenda.
  const [data, setData] = useState(hojeIso)
  const [desc, setDesc] = useState('')
  const [tipo, setTipo] = useState<TipoLancamento>('despesa')
  const [origem, setOrigem] = useState<Origem>('conta')
  const [categoria, setCategoria] = useState('Moradia')
  const [valor, setValor] = useState('')

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const numero = parseFloat(valor.replace(',', '.'))
    if (!data || !desc.trim() || isNaN(numero) || numero <= 0) {
      avisar('Preencha data, descrição e um valor válido.', 'erro')
      return
    }
    void lancarManual(data, { desc: desc.trim(), type: tipo, source: origem, category: categoria, value: numero })
    setDesc('')
    setValor('')
  }

  return (
    <form onSubmit={enviar}>
      <div className="grid grid-cols-2 items-end gap-[11px] min-[901px]:grid-cols-6">
        <div><Label htmlFor="m-data">Data</Label><Input id="m-data" type="date" value={data} onChange={(e) => setData(e.target.value)} /></div>
        <div><Label htmlFor="m-desc">Descrição</Label><Input id="m-desc" placeholder="Ex: Mercado do bairro" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
        <div><Label htmlFor="m-tipo">Tipo</Label><SeletorTipo id="m-tipo" valor={tipo} aoMudar={setTipo} rotuloTransferencia="Transferência interna" /></div>
        <div><Label htmlFor="m-origem">Origem</Label><SeletorOrigem id="m-origem" valor={origem} aoMudar={setOrigem} /></div>
        <div><Label htmlFor="m-cat">Categoria</Label><SeletorCategoria id="m-cat" valor={categoria} aoMudar={setCategoria} /></div>
        <div><Label htmlFor="m-valor">Valor (R$)</Label><Input id="m-valor" type="number" step="0.01" min="0" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} /></div>
      </div>
      <div className="mt-2.5"><Button type="submit" variant="default">Adicionar lançamento</Button></div>
    </form>
  )
}
