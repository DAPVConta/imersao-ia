import type { ReactNode } from 'react'
import { Logo } from '@/components/layout/logo'
import { VERSAO_APP } from '@/lib/versao'
import { Selo } from './selo'

/** Página de acesso (entrar, nova senha, sem acesso): formulário à esquerda, selo à direita. */
export function Moldura({ titulo, dica, children }: { titulo: string; dica: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <main className="mx-auto grid w-full max-w-[1180px] flex-1 items-center gap-10 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,400px)_1fr] md:gap-16">
        <section aria-labelledby="titulo-acesso" className="w-full max-w-[400px]">
          <div className="mb-10 flex items-center gap-2.5">
            <Logo className="size-9 flex-none" />
            <span className="text-[15px] font-semibold tracking-[-.01em]">Assistente Financeiro</span>
          </div>
          <h1 id="titulo-acesso" className="text-[28px] font-semibold leading-tight tracking-[-.015em] text-ink">
            {titulo}
          </h1>
          <p className="mb-7 mt-2 text-[14px] text-ink-2">{dica}</p>
          {children}
        </section>
        <Selo className="hidden w-full max-w-[360px] justify-self-center md:block" />
      </main>
      <footer className="mx-auto w-full max-w-[1180px] px-4 pb-6 text-[12.5px] text-ink-mute sm:px-6">
        Versão {VERSAO_APP}
      </footer>
    </div>
  )
}
