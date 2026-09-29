import type { ReactNode } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import type { Mes } from '@/features/financas/tipos'
import { fmtBRL } from '@/lib/formato'
import { cn } from '@/lib/utils'

const valor = (v: number | null) => (v != null ? fmtBRL(v) : '—')

function Linha({ rotulo, children, forte }: { rotulo: string; children: ReactNode; forte?: boolean }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4 border-b border-rule py-2 last:border-0', forte && 'py-3')}>
      <dt className="text-[14px] text-ink-2">{rotulo}</dt>
      <dd className={cn('num text-right', forte ? 'text-[20px] font-semibold' : 'text-[14px] font-medium')}>{children}</dd>
    </div>
  )
}

/** Saldo da conta e fatura do cartão do mês. */
export function ContaECartao({ mes }: { mes: Mes }) {
  const { bank, card } = mes
  const temFatura = card.total != null || card.comprasPeriodo != null
  const usoLimite = card.limiteTotal && card.total != null ? (card.total / card.limiteTotal) * 100 : null

  return (
    <Card className="lg:border-t-0 lg:pt-0">
      <CardTitle>Conta e cartão</CardTitle>

      <h3 className="text-[13px] font-medium text-ink-mute">Conta corrente</h3>
      <dl className="mb-6">
        <Linha rotulo="Saldo no fim do mês" forte>{valor(bank.saldoFinal)}</Linha>
        <Linha rotulo="Saldo no começo do mês">{valor(bank.saldoAnterior)}</Linha>
      </dl>

      <h3 className="text-[13px] font-medium text-ink-mute">Fatura do cartão</h3>
      {!temFatura ? (
        <p className="mt-2 text-[14px] text-ink-mute">
          Nenhuma fatura neste mês. Anexe o PDF da fatura em “Trazer lançamentos”.
        </p>
      ) : (
        <>
          <dl>
            <Linha rotulo={card.vencimento ? `Total, vence em ${card.vencimento}` : 'Total da fatura'} forte>{valor(card.total)}</Linha>
            <Linha rotulo="Compras do período">{valor(card.comprasPeriodo)}</Linha>
            <Linha rotulo="Fatura anterior">{valor(card.saldoAnterior)}</Linha>
            <Linha rotulo="Pagamento recebido">{card.pagamento != null ? fmtBRL(-card.pagamento) : '—'}</Linha>
            <Linha rotulo="Pagamento mínimo">{valor(card.pagamentoMinimo)}</Linha>
          </dl>
          {usoLimite != null && (
            <div className="mt-4">
              <div className="flex justify-between text-[13px] text-ink-2">
                <span>Usa {usoLimite.toFixed(0)}% do limite</span>
                <span className="num">{fmtBRL(card.limiteTotal)}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-2" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(usoLimite)} aria-label="Uso do limite do cartão">
                <div className={cn('h-full rounded-full', usoLimite > 80 ? 'bg-debit' : usoLimite > 50 ? 'bg-gold' : 'bg-accent')} style={{ width: `${Math.min(usoLimite, 100)}%` }} />
              </div>
            </div>
          )}
          {card.fechamento && <p className="mt-3 text-[13px] text-ink-mute">A fatura fechou em {card.fechamento}.</p>}
        </>
      )}
    </Card>
  )
}
