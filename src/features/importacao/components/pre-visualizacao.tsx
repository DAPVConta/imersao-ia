import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Superficie } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { confirmarImportacao, type Complemento } from '@/features/financas/acoes'
import { detectarMes } from '@/features/financas/calculos'
import { SeletorCategoria, SeletorTipo } from '@/features/financas/components/seletores'
import { useFinancas } from '@/features/financas/store'
import type { LancamentoNovo } from '@/features/financas/tipos'
import { chaveDoMesBr } from '@/lib/datas'
import { fmtBRL, rotuloMes } from '@/lib/formato'

/**
 * Revisão antes de importar: nada entra sem o usuário confirmar. Dá para
 * desmarcar linhas, trocar tipo e categoria, e escolher o mês de destino
 * (sugerido pelas datas dos próprios lançamentos).
 */
export function PreVisualizacao({
  linhas: iniciais, origemTexto, complemento, aoTerminar,
}: { linhas: LancamentoNovo[]; origemTexto: string; complemento: Complemento | null; aoTerminar: () => void }) {
  const meses = useFinancas((e) => e.base.months)
  const mesAtual = useFinancas((e) => e.mesAtual)
  const [linhas, setLinhas] = useState(iniciais)
  const [marcadas, setMarcadas] = useState(() => iniciais.map(() => true))
  const [destino, setDestino] = useState(() => detectarMes(iniciais) ?? mesAtual ?? '')
  const [salvando, setSalvando] = useState(false)

  const opcoesMes = useMemo(() => [...new Set([...Object.keys(meses), destino].filter(Boolean))].sort(), [meses, destino])
  const periodo = useMemo(() => [...new Set(iniciais.map((r) => chaveDoMesBr(r.date)).filter(Boolean) as string[])].sort(), [iniciais])
  const todas = marcadas.every(Boolean)

  const mudar = (i: number, parte: Partial<LancamentoNovo>) =>
    setLinhas((ls) => ls.map((l, j) => (j === i ? { ...l, ...parte } : l)))

  if (!linhas.length) return <p className="text-[13.5px] text-ink-mute">Nenhum lançamento reconhecido.</p>

  const confirmar = async () => {
    setSalvando(true)
    await confirmarImportacao(destino, linhas.filter((_, i) => marcadas[i]), origemTexto, complemento)
    aoTerminar()
  }

  return (
    <div>
      <div className="mb-1.5 mt-3.5 flex flex-wrap items-center gap-[9px]">
        <Label htmlFor="mes-destino" className="mb-0 text-[14px] font-semibold text-ink">
          Importar em
        </Label>
        <Select value={destino} onValueChange={setDestino}>
          <SelectTrigger id="mes-destino" className="w-auto min-w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {opcoesMes.map((k) => (
              <SelectItem key={k} value={k}>{rotuloMes(k)}{meses[k] ? '' : ' (novo)'}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!meses[destino] && (
          <span className="text-[13.5px] text-accent">
            Mês novo: será criado ao confirmar
          </span>
        )}
      </div>
      {periodo.length > 1 && (
        <p className="text-[13.5px] text-ink-mute">
          Os lançamentos vão de {rotuloMes(periodo[0])} a {rotuloMes(periodo[periodo.length - 1])} — todos entram no mês escolhido acima.
        </p>
      )}
      <Superficie className="mt-3 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox checked={todas} onCheckedChange={(v) => setMarcadas(marcadas.map(() => v === true))} aria-label="Marcar todos" />
              </TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((l, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Checkbox
                    checked={marcadas[i]}
                    onCheckedChange={(v) => setMarcadas((m) => m.map((x, j) => (j === i ? v === true : x)))}
                    aria-label={`Importar ${l.desc}`}
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">{l.date}</TableCell>
                <TableCell>{l.desc}</TableCell>
                <TableCell className="min-w-[140px]"><SeletorTipo tamanho="sm" valor={l.type} aoMudar={(type) => mudar(i, { type })} /></TableCell>
                <TableCell className="min-w-[170px]"><SeletorCategoria tamanho="sm" valor={l.category} aoMudar={(category) => mudar(i, { category })} /></TableCell>
                <TableCell className="num whitespace-nowrap text-right font-semibold">{fmtBRL(l.value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Superficie>
      <div className="mt-4 flex flex-wrap items-center gap-[9px]">
        <Button variant="default" onClick={confirmar} disabled={salvando || !destino}>
          {salvando ? 'Salvando no banco...' : 'Confirmar importação'}
        </Button>
        <span className="text-[13.5px] text-ink-mute">Os itens desmarcados não serão importados.</span>
      </div>
    </div>
  )
}
