import { useId } from 'react'
import type { PontoMensal } from '@/features/financas/calculos'
import { fmtBRL, letraMes, rotuloMes } from '@/lib/formato'
import { curvaSuave } from '@/lib/graficos'

/** Área com a evolução de um valor (receitas ou despesas) mês a mês. */
export function MiniGrafico({
  serie, campo, cor, mesAtual,
}: { serie: PontoMensal[]; campo: 'receitas' | 'despesas'; cor: string; mesAtual: string | null }) {
  const gid = useId()
  if (!serie.length) return null
  const max = Math.max(1, ...serie.map((s) => s[campo]))
  const W = 150, H = 96, pad = 8, topo = 10, base = H - 16
  const passo = (W - pad * 2) / serie.length
  const xDe = (i: number) => pad + passo * i + passo / 2

  const rotulos = serie.map((s, i) => (
    <text key={s.chave} x={xDe(i).toFixed(1)} y={H - 3} textAnchor="middle" className="svg-lbl text-[9.5px]">
      {letraMes(s.chave)}
    </text>
  ))
  const gradiente = (
    <defs>
      <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={cor} stopOpacity="0.35" />
        <stop offset="100%" stopColor={cor} stopOpacity="0.02" />
      </linearGradient>
    </defs>
  )

  if (serie.length === 1) {
    const s = serie[0]
    const h = Math.max((s[campo] / max) * (base - topo), 2)
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="block size-full max-h-[130px] min-h-[96px]" role="img" aria-label="evolução mensal">
        {gradiente}
        <rect x={xDe(0) - 19} y={base - h} width="38" height={h} rx="6" fill={`url(#${gid})`} stroke={cor} strokeWidth="2">
          <title>{`${rotuloMes(s.chave)}: ${fmtBRL(s[campo])}`}</title>
        </rect>
        {rotulos}
      </svg>
    )
  }

  const pts = serie.map((s, i) => [xDe(i), base - (s[campo] / max) * (base - topo)] as [number, number])
  const linha = curvaSuave(pts)
  const area = `${linha} L ${pts[pts.length - 1][0].toFixed(1)} ${base} L ${pts[0][0].toFixed(1)} ${base} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block size-full max-h-[130px] min-h-[96px]" role="img" aria-label="evolução mensal">
      {gradiente}
      <path d={area} fill={`url(#${gid})`} />
      <path d={linha} fill="none" stroke={cor} strokeWidth="2.5" strokeLinecap="round" />
      {pts.map(([x, y], i) => {
        const atual = serie[i].chave === mesAtual
        return (
          <circle key={serie[i].chave} cx={x} cy={y} r={atual ? 4 : 2.5} fill={atual ? cor : 'rgb(var(--sheet))'} stroke={cor} strokeWidth="2">
            <title>{`${rotuloMes(serie[i].chave)}: ${fmtBRL(serie[i][campo])}`}</title>
          </circle>
        )
      })}
      {rotulos}
    </svg>
  )
}
