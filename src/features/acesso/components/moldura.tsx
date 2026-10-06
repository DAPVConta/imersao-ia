import type { ReactNode } from 'react'
import { Logo, LogoCompleto } from '@/components/layout/logo'
import { VERSAO_APP } from '@/lib/versao'
import { Selo } from './selo'

/**
 * Página de acesso (entrar, nova senha, sem acesso). Repete a casca do app:
 * painel azul-petróleo à esquerda, como o menu, e o formulário num cartão
 * branco sobre o fundo (docs/design.md). No celular o painel vira uma faixa.
 */
export function Moldura({ titulo, dica, children }: { titulo: string; dica: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper lg:flex-row">
      <aside className="relative flex shrink-0 flex-col overflow-hidden bg-menu px-5 py-4 text-menu-foreground lg:w-[420px] lg:px-10 lg:py-10">
        <Selo className="pointer-events-none absolute -bottom-28 -right-28 hidden size-[440px] opacity-[.13] lg:block" />
        <div className="relative flex items-center gap-3">
          <Logo className="size-9 flex-none" />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold">Assistente Financeiro</div>
            <div className="text-[12px] text-menu-mute">Finanças da casa</div>
          </div>
        </div>
        <p className="relative mt-auto hidden max-w-[32ch] text-[15px] leading-relaxed text-menu-foreground/90 lg:block">
          Como o mês fechou e o que ainda vem pela frente, num lugar só.
        </p>
        <p className="relative mt-3 hidden text-[11.5px] text-menu-mute lg:block">{VERSAO_APP}</p>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
        <section aria-labelledby="titulo-acesso" className="w-full max-w-[420px] rounded-lg border border-rule bg-sheet p-6 shadow-nota sm:p-8">
          {/* -ml-2: a placa tem respiro interno; assim o desenho alinha com o título. */}
          <LogoCompleto className="-ml-2 mb-5 h-[84px]" />
          <h1 id="titulo-acesso" className="text-[24px] font-semibold leading-tight tracking-[-.015em] text-ink">
            {titulo}
          </h1>
          <p className="mb-6 mt-1.5 text-[14px] text-ink-2">{dica}</p>
          {children}
        </section>
        <p className="mt-6 text-[11.5px] text-ink-mute lg:hidden">{VERSAO_APP}</p>
      </main>
    </div>
  )
}
