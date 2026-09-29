import type { ReactNode } from 'react'

/** Título da página, com uma linha de contexto e (opcional) uma ação à direita. */
export function CabecalhoPagina({ titulo, contexto, acao }: { titulo: string; contexto?: ReactNode; acao?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[24px] font-semibold leading-tight tracking-[-.015em] text-ink">{titulo}</h1>
        {contexto && <p className="mt-1 text-[13.5px] text-ink-mute">{contexto}</p>}
      </div>
      {acao}
    </div>
  )
}
