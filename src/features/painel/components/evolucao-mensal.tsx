import { Card, CardTitle } from '@/components/ui/card'
import type { PontoMensal } from '@/features/financas/calculos'
import { fmtBRL, rotuloMes } from '@/lib/formato'
import { curvaSuave } from '@/lib/graficos'

const W = 760, H = 210, padX = 34, topo = 18, base = H - 30

function Serie({ dados, campo, cor, gid, px, py, mesAtual }: {
  dados: PontoMensal[]; campo: 'receitas' | 'despesas'; cor: string; gid: string
  px: (i: number) => number; py: (v: number) => number; mesAtual: string | null
}) {
  const pts = dados.map((d, i) => [px(i), py(d[campo])] as [number, number])
  const pontos = pts.map(([x, y], i) => {
    const atual = dados[i].chave === mesAtual
    return (
      <circle key={dados[i].chave} cx={x} cy={y} r={atual ? 5 : 3.5} fill={atual ? cor : 'rgb(var(--sheet))'} stroke={cor} strokeWidth="2.5">
        <title>{`${rotuloMes(dados[i].chave)} — ${campo === 'receitas' ? 'Receitas' : 'Despesas'}: ${fmtBRL(dados[i][campo])}`}</title>
      </circle>
    )
  })
  if (dados.length === 1) {
    const [x, y] = pts[0]
    return (
      <>
        <line x1={x - 30} y1={y} x2={x + 30} y2={y} stroke={cor} strokeWidth="2.5" strokeLinecap="round" />
        {pontos}
      </>
    )
  }
  const linha = curvaSuave(pts)
  const area = `${linha} L ${pts[pts.length - 1][0].toFixed(1)} ${base} L ${pts[0][0].toFixed(1)} ${base} Z`
  return (
    <>
      <path d={area} fill={`url(#${gid})`} />
      <path d={linha} fill="none" stroke={cor} strokeWidth="3" strokeLinecap="round" />
      {pontos}
    </>
  )
}

/** Receitas e despesas de todos os meses, em duas curvas. */
export function EvolucaoMensal({ serie, mesAtual }: { serie: PontoMensal[]; mesAtual: string | null }) {
  const max = Math.max(1, ...serie.map((d) => Math.max(d.receitas, d.despesas)))
  const passo = serie.length > 1 ? (W - padX * 2) / (serie.length - 1) : 0
  const px = (i: number) => (serie.length > 1 ? padX + passo * i : W / 2)
  const py = (v: number) => base - (v / max) * (base - topo)

  return (
    <Card>
      <CardTitle dica="receitas vs despesas">Evolução mensal</CardTitle>
      {!serie.length ? (
        <p className="text-[11.5px] text-ink-mute">Sem meses cadastrados.</p>
      ) : (
        <div className="pt-1">
          <div className="mb-1 flex gap-4">
            {[['Receitas', 'rgb(var(--credit))'], ['Despesas', 'rgb(var(--debit))']].map(([nome, cor]) => (
              <span key={nome} className="inline-flex items-center gap-[7px] text-[11.5px] font-bold text-ink-2">
                <span className="size-[9px] rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,.2)]" style={{ background: cor }} />
                {nome}
              </span>
            ))}
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="evolução mensal de receitas e despesas">
            <defs>
              {[['ev-rec', 'rgb(var(--credit))'], ['ev-desp', 'rgb(var(--debit))']].map(([id, cor]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cor} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={cor} stopOpacity="0.02" />
                </linearGradient>
              ))}
            </defs>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <line key={f} x1={padX} y1={py(max * f)} x2={W - padX} y2={py(max * f)} stroke="rgb(var(--rule))" strokeWidth="1" strokeDasharray="3 5" />
            ))}
            <Serie dados={serie} campo="receitas" cor="rgb(var(--credit))" gid="ev-rec" px={px} py={py} mesAtual={mesAtual} />
            <Serie dados={serie} campo="despesas" cor="rgb(var(--debit))" gid="ev-desp" px={px} py={py} mesAtual={mesAtual} />
            {serie.map((d, i) => (
              <text key={d.chave} x={px(i)} y={H - 8} textAnchor="middle" className="svg-lbl">{rotuloMes(d.chave)}</text>
            ))}
          </svg>
        </div>
      )}
    </Card>
  )
}
