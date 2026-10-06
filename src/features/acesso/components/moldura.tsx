import type { ReactNode } from 'react'
import { LogoCompleto } from '@/components/layout/logo'
import { VERSAO_APP } from '@/lib/versao'
import { Selo } from './selo'

/**
 * Página de acesso (entrar, nova senha, sem acesso). Painel azul-petróleo à
 * esquerda, como o menu do app, e o formulário num cartão branco. A marca
 * aparece UMA vez: o logotipo completo, grande e centralizado no cartão.
 * No celular o painel some e fica só o cartão.
 */
export function Moldura({ titulo, dica, children }: { titulo: string; dica: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-paper">
      <aside className="relative hidden w-[420px] shrink-0 flex-col justify-end overflow-hidden bg-menu px-10 py-10 text-menu-foreground lg:flex">
        <Selo className="pointer-events-none absolute -right-24 top-1/2 size-[520px] -translate-y-1/2 opacity-[.13]" />
        <p className="relative max-w-[30ch] text-[17px] leading-relaxed text-menu-foreground/90">
          Como o mês fechou e o que ainda vem pela frente, num lugar só.
        </p>
        <p className="relative mt-3 text-[11.5px] text-menu-mute">{VERSAO_APP}</p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <section aria-labelledby="titulo-acesso" className="w-full max-w-[440px] rounded-lg border border-rule bg-sheet px-6 pb-8 pt-7 shadow-nota sm:px-10 sm:pb-10 sm:pt-9">
          <div className="mb-7 flex justify-center">
            <LogoCompleto className="h-[136px] sm:h-[152px]" />
          </div>
          <h1 id="titulo-acesso" className="text-center text-[22px] font-semibold leading-tight tracking-[-.015em] text-ink sm:text-[24px]">
            {titulo}
          </h1>
          <p className="mx-auto mb-7 mt-2 max-w-[36ch] text-center text-[14px] text-ink-2">{dica}</p>
          {children}
        </section>
        <p className="mt-6 text-[11.5px] text-ink-mute lg:hidden">{VERSAO_APP}</p>
      </main>
    </div>
  )
}
