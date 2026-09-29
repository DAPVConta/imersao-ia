/**
 * Geometria do guilhochê (o rendilhado de segurança das cédulas).
 * Cada mês tem um desenho próprio: a "semente" muda o número de pétalas e a
 * fase, como cédulas de valores diferentes.
 */

/** Caminho SVG fechado de uma curva polar r(θ), amostrada em `passos` pontos. */
function curvaPolar(cx: number, cy: number, raio: (t: number) => number, passos = 540): string {
  let d = ''
  for (let i = 0; i <= passos; i++) {
    const t = (i / passos) * Math.PI * 2
    const r = raio(t)
    const x = cx + r * Math.cos(t)
    const y = cy + r * Math.sin(t)
    d += (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2)
  }
  return d + 'Z'
}

export type Guilloche = { rosetao: string[]; faixa: string[] }

/**
 * Rosetão central (curvas entrelaçadas) + faixa externa ondulada.
 * `semente` = número do mês (1–12).
 */
export function desenharGuilloche(cx: number, cy: number, semente: number): Guilloche {
  const petalas = 7 + (semente % 5) // 7 a 11 pétalas
  const ondas = 23 + ((semente * 3) % 9)
  const rosetao: string[] = []
  for (let j = 0; j < 14; j++) {
    const fase = (j / 14) * ((Math.PI * 2) / petalas)
    rosetao.push(
      curvaPolar(cx, cy, (t) => 62 + 17 * Math.sin(petalas * t + fase) + 4.5 * Math.sin((petalas * 3) * t - fase * 2)),
    )
  }
  const faixa: string[] = []
  for (let j = 0; j < 7; j++) {
    const fase = (j / 7) * Math.PI
    faixa.push(curvaPolar(cx, cy, (t) => 93 + 5 * Math.sin(ondas * t + fase), 900))
  }
  return { rosetao, faixa }
}
