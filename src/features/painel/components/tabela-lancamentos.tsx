import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { excluirLancamento } from '@/features/financas/acoes'
import { NOMES_CATEGORIAS, ROTULO_ORIGEM } from '@/features/financas/categorias'
import { CategoriaTag } from '@/features/financas/components/categoria-tag'
import type { Mes } from '@/features/financas/tipos'
import { dataIso } from '@/lib/datas'
import { fmtBRL } from '@/lib/formato'
import { cn } from '@/lib/utils'

const TODOS = 'todos'
const corValor = { despesa: 'text-debit-deep', receita: 'text-credit-deep', transferencia: 'font-medium text-ink-mute' }
const sinal = { despesa: '-', receita: '+', transferencia: '' }

export function TabelaLancamentos({ chave, mes }: { chave: string; mes: Mes | undefined }) {
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState(TODOS)
  const [origem, setOrigem] = useState(TODOS)
  const [tipo, setTipo] = useState(TODOS)

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return (mes?.transactions ?? [])
      .filter((t) =>
        (!q || t.desc.toLowerCase().includes(q)) &&
        (categoria === TODOS || t.category === categoria) &&
        (origem === TODOS || t.source === origem) &&
        (tipo === TODOS || t.type === tipo))
      // Ordena pela data de verdade (DD/MM/AAAA não ordena como texto entre meses).
      .sort((a, b) => (dataIso(a.date) ?? a.date).localeCompare(dataIso(b.date) ?? b.date))
  }, [mes, busca, categoria, origem, tipo])

  return (
    <Card>
      <CardTitle>Lançamentos do mês</CardTitle>
      <div className="mb-[15px] flex flex-wrap items-center gap-[9px]">
        <Input placeholder="Buscar descrição..." value={busca} onChange={(e) => setBusca(e.target.value)} className="h-8 w-[220px] text-[12.8px]" />
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger size="sm" className="w-auto min-w-[150px]" aria-label="Filtrar por categoria"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todas categorias</SelectItem>
            {NOMES_CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={origem} onValueChange={setOrigem}>
          <SelectTrigger size="sm" className="w-auto min-w-[130px]" aria-label="Filtrar por origem"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Conta + Cartão</SelectItem>
            <SelectItem value="conta">Só conta</SelectItem>
            <SelectItem value="cartao">Só cartão</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger size="sm" className="w-auto min-w-[130px]" aria-label="Filtrar por tipo"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os tipos</SelectItem>
            <SelectItem value="receita">Receita</SelectItem>
            <SelectItem value="despesa">Despesa</SelectItem>
            <SelectItem value="transferencia">Transferência</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-[11.5px] text-ink-mute">{lista.length} lançamento(s)</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {lista.map((t) => (
            <TableRow key={t.id} className="even:stripe hover:bg-paper-2">
              <TableCell>{t.date}</TableCell>
              <TableCell>{t.desc}</TableCell>
              <TableCell><CategoriaTag nome={t.category} /></TableCell>
              <TableCell>{ROTULO_ORIGEM[t.source]}</TableCell>
              <TableCell className={cn('num whitespace-nowrap text-right font-semibold', corValor[t.type])}>
                {sinal[t.type]}{fmtBRL(t.value)}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => excluirLancamento(chave, t.id)} aria-label={`Excluir ${t.desc}`}>
                  <X />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
