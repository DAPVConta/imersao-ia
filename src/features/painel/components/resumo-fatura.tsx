import { Card, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import type { ResumoCartao } from '@/features/financas/tipos'
import { fmtBRL } from '@/lib/formato'
import { cn } from '@/lib/utils'

export function ResumoFatura({ cartao }: { cartao: ResumoCartao }) {
  const vazio = cartao.total == null && cartao.comprasPeriodo == null
  const linhas: [string, number | null, boolean?][] = [
    ['Saldo da fatura anterior', cartao.saldoAnterior],
    ['Pagamento recebido', cartao.pagamento != null ? -cartao.pagamento : null],
    ['Compras do período', cartao.comprasPeriodo],
    ['TOTAL DESTA FATURA', cartao.total, true],
    ['Limite total', cartao.limiteTotal],
    ['Pagamento mínimo', cartao.pagamentoMinimo],
  ]
  return (
    <Card>
      <CardTitle>Fatura do cartão do mês</CardTitle>
      {vazio ? (
        <p className="text-[11.5px] text-ink-mute">
          Nenhuma fatura importada para este mês ainda. Use a aba "Anexar PDF" ou "Exemplo Jul/2026".
        </p>
      ) : (
        <>
          <Table contida={false}>
            <TableBody>
              {linhas.map(([rotulo, valor, total]) => (
                <TableRow key={rotulo} className={cn(total && 'stripe font-extrabold [&>td]:border-t-2 [&>td]:border-t-rule-strong')}>
                  <TableCell>{rotulo}</TableCell>
                  <TableCell className="num whitespace-nowrap text-right font-semibold">{valor != null ? fmtBRL(valor) : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-2 text-[11.5px] text-ink-mute">
            Fechamento: {cartao.fechamento || '—'} · Vencimento: <strong>{cartao.vencimento || '—'}</strong>
          </p>
        </>
      )}
    </Card>
  )
}
