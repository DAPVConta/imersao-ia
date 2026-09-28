import { cva } from 'class-variance-authority'
import { useId, type ReactNode } from 'react'
import type { Mes } from '@/features/financas/tipos'
import { fmtBRL } from '@/lib/formato'

const cartao = cva(
  'glass relative flex animate-fade-up items-center gap-3.5 overflow-hidden rounded-[16px] px-[18px] py-[15px] shadow ' +
    'transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift ' +
    "before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-[''] before:bg-gradient-to-b",
  {
    variants: {
      cor: {
        verde: 'before:from-credit before:to-credit-deep',
        vermelho: 'before:from-debit before:to-debit-deep',
        marinho: 'before:from-navy-3 before:to-navy-2',
        ouro: 'before:from-gold before:to-gold-deep',
      },
    },
  },
)

function Cartao({ cor, rotulo, valor, rodape, extra, atraso }: {
  cor: 'verde' | 'vermelho' | 'marinho' | 'ouro'; rotulo: string; valor: number | null; rodape: ReactNode; extra?: ReactNode; atraso: number
}) {
  return (
    <div className={cartao({ cor })} style={{ animationDelay: `${atraso}s` }}>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-extrabold uppercase tracking-[.11em] text-ink-mute">{rotulo}</div>
        <div className="num mt-[5px] text-xl font-extrabold tracking-[-.01em]">{valor != null ? fmtBRL(valor) : '—'}</div>
        <div className="mt-1 text-[11px] text-ink-mute">{rodape}</div>
      </div>
      {extra}
    </div>
  )
}

/** Anel com o percentual do limite do cartão usado pela fatura. */
function Anel({ pct }: { pct: number | null }) {
  const gid = useId()
  const r = 21, C = 2 * Math.PI * r
  const desloc = pct != null ? C * (1 - Math.min(pct, 100) / 100) : C
  return (
    <svg className="size-[52px] flex-none" viewBox="0 0 52 52" role="img" aria-label="limite usado">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(var(--navy-3))" />
          <stop offset="100%" stopColor="rgb(var(--credit))" />
        </linearGradient>
      </defs>
      <circle cx="26" cy="26" r={r} fill="none" strokeWidth="5" stroke="rgb(var(--rule))" />
      <circle
        cx="26" cy="26" r={r} fill="none" strokeWidth="5" stroke={`url(#${gid})`} strokeLinecap="round"
        strokeDasharray={C.toFixed(1)} strokeDashoffset={desloc.toFixed(1)} transform="rotate(-90 26 26)"
        className="transition-[stroke-dashoffset] duration-700"
      />
      <text x="26" y="30" textAnchor="middle" className="num fill-ink text-[13px] font-extrabold">
        {pct != null ? `${pct.toFixed(0)}%` : '—'}
      </text>
    </svg>
  )
}

/** Quatro cartões: saldo da conta, fatura, limite e pagamento mínimo. */
export function CartoesResumo({ mes }: { mes: Mes }) {
  const { bank, card } = mes
  const pctLimite = card.limiteTotal && card.total != null ? (card.total / card.limiteTotal) * 100 : null
  return (
    <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[15px]">
      <Cartao cor="verde" atraso={0} rotulo="Saldo bancário final" valor={bank.saldoFinal}
        rodape={`Anterior: ${bank.saldoAnterior != null ? fmtBRL(bank.saldoAnterior) : '—'}`} />
      <Cartao cor="vermelho" atraso={0.05} rotulo="Fatura do cartão" valor={card.total} rodape={`Vence ${card.vencimento || '—'}`} />
      <Cartao cor="marinho" atraso={0.1} rotulo="Limite do cartão" valor={card.limiteTotal}
        rodape={`Fatura usa ${pctLimite != null ? pctLimite.toFixed(0) + '% do limite' : '—'}`} extra={<Anel pct={pctLimite} />} />
      <Cartao cor="ouro" atraso={0.15} rotulo="Pagamento mínimo" valor={card.pagamentoMinimo} rodape={`Fechamento ${card.fechamento || '—'}`} />
    </div>
  )
}
