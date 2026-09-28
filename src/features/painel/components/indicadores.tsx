import { cva } from 'class-variance-authority'
import type { ReactNode } from 'react'
import type { PontoMensal } from '@/features/financas/calculos'
import type { Totais } from '@/features/financas/tipos'
import { useContagem } from '@/hooks/use-contagem'
import { fmtBRL, rotuloMes } from '@/lib/formato'
import { MiniGrafico } from './mini-grafico'

const bloco = 'rounded-lg shadow transition-[transform,box-shadow] duration-200 hover:-translate-y-[3px] hover:shadow-lift'

const destaque = cva(
  `${bloco} relative flex min-h-[128px] flex-col justify-between overflow-hidden px-5 pb-4 pt-[18px] text-white ` +
    'shadow-[inset_0_1px_0_rgba(255,255,255,.24),var(--shadow)] ' +
    "before:pointer-events-none before:absolute before:inset-0 before:content-[''] " +
    'before:bg-[radial-gradient(220px_130px_at_88%_-20%,rgba(255,255,255,.22),transparent_62%)]',
  {
    variants: {
      cor: {
        verde: 'bg-gradient-to-br from-credit to-credit-deep',
        vermelho: 'bg-gradient-to-br from-debit to-debit-deep',
        marinho: 'bg-gradient-to-br from-navy-3 to-navy-2',
      },
    },
  },
)

function Destaque({ cor, rotulo, valor, selo }: { cor: 'verde' | 'vermelho' | 'marinho'; rotulo: string; valor: number; selo: ReactNode }) {
  const animado = useContagem(valor)
  return (
    <div className={destaque({ cor })}>
      <div className="text-[10.5px] font-extrabold uppercase tracking-[.13em] opacity-85">{rotulo}</div>
      <div className="num mt-[7px] text-[27px] font-extrabold leading-[1.12] tracking-[-.02em] [text-shadow:0_1px_2px_rgba(0,0,0,.18)]">
        {fmtBRL(animado)}
      </div>
      <div className="mt-[11px] inline-flex self-start rounded-full bg-white/[.16] px-[11px] py-[3px] text-[11px] font-semibold backdrop-blur-sm">
        {selo}
      </div>
    </div>
  )
}

const grupo = 'grid animate-fade-up grid-cols-1 gap-[13px] min-[481px]:grid-cols-[minmax(180px,230px)_1fr]'

/** Três grandes números do mês (receitas, despesas, resultado) sobre a faixa escura. */
export function Indicadores({ totais, serie, mesAtual }: { totais: Totais; serie: PontoMensal[]; mesAtual: string }) {
  const idx = serie.findIndex((s) => s.chave === mesAtual)
  const anterior = idx > 0 ? serie[idx - 1] : null
  const variacao = anterior && anterior.receitas > 0 ? (totais.receitas / anterior.receitas - 1) * 100 : null
  const pctDespesa = totais.receitas > 0 ? (totais.despesas / totais.receitas) * 100 : null
  const poupanca = totais.receitas > 0 ? (totais.saldo / totais.receitas) * 100 : 0

  return (
    <div className="mb-[18px] grid grid-cols-1 gap-[18px] min-[1021px]:grid-cols-3">
      <div className={grupo}>
        <Destaque
          cor="verde"
          rotulo="Receitas"
          valor={totais.receitas}
          selo={variacao == null ? 'primeiro mês registrado' : `${variacao >= 0 ? '▲ +' : '▼ '}${variacao.toFixed(0)}% vs mês anterior`}
        />
        <div className={`${bloco} glass flex items-end px-3.5 pb-2 pt-3`}>
          <MiniGrafico serie={serie} campo="receitas" cor="rgb(var(--credit))" mesAtual={mesAtual} />
        </div>
      </div>
      <div className={grupo} style={{ animationDelay: '.07s' }}>
        <Destaque
          cor="vermelho"
          rotulo="Despesas"
          valor={totais.despesas}
          selo={pctDespesa == null ? '—' : `${pctDespesa.toFixed(0)}% da receita do mês`}
        />
        <div className={`${bloco} glass flex items-end px-3.5 pb-2 pt-3`}>
          <MiniGrafico serie={serie} campo="despesas" cor="rgb(var(--debit))" mesAtual={mesAtual} />
        </div>
      </div>
      <div className={grupo} style={{ animationDelay: '.14s' }}>
        <Destaque cor="marinho" rotulo="Resultado" valor={totais.saldo} selo={rotuloMes(mesAtual)} />
        <div
          className={`${bloco} flex flex-col items-center justify-center gap-0.5 bg-gradient-to-br from-gold to-gold-deep px-[18px] py-4 text-gold-ink shadow-[inset_0_1px_0_rgba(255,255,255,.45),var(--shadow)]`}
        >
          <div className="num text-[32px] font-extrabold tracking-[-.02em]">{poupanca.toFixed(0)}%</div>
          <div className="text-[10px] font-extrabold uppercase tracking-[.14em] opacity-75">poupança</div>
        </div>
      </div>
    </div>
  )
}
