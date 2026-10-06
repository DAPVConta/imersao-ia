import { Contrast, Download, LogOut, Upload } from 'lucide-react'
import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useSair } from '@/features/acesso/use-sair'
import { exportarBackup, importarBackup } from '@/features/financas/acoes'
import { useSessao } from '@/hooks/use-sessao'
import { useTema } from '@/hooks/use-tema'
import { cn } from '@/lib/utils'
import { VERSAO_APP } from '@/lib/versao'
import { Logo } from './logo'
import { ITENS_MENU } from './menu'

const ROTULO_TEMA = { auto: 'Tema automático', light: 'Tema claro', dark: 'Tema escuro' } as const

/** Menu fixo à esquerda (telas largas): marca, páginas e utilidades. */
export function BarraLateral() {
  const { tema, alternar } = useTema()
  const arquivo = useRef<HTMLInputElement>(null)
  const { usuario } = useSessao()
  const { saindo, sair } = useSair()

  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col bg-menu text-menu-foreground lg:flex">
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <Logo className="size-9 flex-none" />
        <div className="leading-tight">
          <div className="text-[15px] font-semibold">Assistente Financeiro</div>
          <div className="text-[12px] text-menu-mute">Finanças da casa</div>
        </div>
      </div>

      <nav aria-label="Páginas" className="flex flex-col gap-1 px-3">
        {ITENS_MENU.map(({ rota, rotulo, icone: Icone }) => (
          <NavLink
            key={rota} to={rota} end={rota === '/'}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-credit',
                isActive
                  ? 'bg-menu-2 text-menu-foreground before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r-full before:bg-credit'
                  : 'text-menu-mute hover:bg-menu-2/70 hover:text-menu-foreground',
              )}
          >
            <Icone className="size-[18px]" />
            {rotulo}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-menu-2 px-3 py-3">
        <button
          type="button" onClick={sair} disabled={saindo} title={usuario?.email ? `Sair da conta ${usuario.email}` : 'Sair da conta'}
          className="mb-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13.5px] text-menu-mute transition-colors hover:bg-menu-2 hover:text-menu-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-credit disabled:opacity-60"
        >
          <LogOut className="size-[18px] flex-none" />
          <span className="min-w-0">
            <span className="block font-medium">{saindo ? 'Saindo…' : 'Sair'}</span>
            {usuario?.email && <span className="block truncate text-[11.5px]">{usuario.email}</span>}
          </span>
        </button>
        <div className="flex items-center gap-1">
          <button type="button" onClick={alternar} title={`${ROTULO_TEMA[tema]} (clique para trocar)`} aria-label={`${ROTULO_TEMA[tema]} — trocar`} className="rounded-md p-2 text-menu-mute hover:bg-menu-2 hover:text-menu-foreground">
            <Contrast className="size-[18px]" />
          </button>
          <button type="button" onClick={exportarBackup} title="Exportar backup (arquivo JSON)" aria-label="Exportar backup" className="rounded-md p-2 text-menu-mute hover:bg-menu-2 hover:text-menu-foreground">
            <Download className="size-[18px]" />
          </button>
          <button type="button" onClick={() => arquivo.current?.click()} title="Importar backup" aria-label="Importar backup" className="rounded-md p-2 text-menu-mute hover:bg-menu-2 hover:text-menu-foreground">
            <Upload className="size-[18px]" />
          </button>
          <span className="ml-auto pr-1 text-[11.5px] text-menu-mute">{VERSAO_APP}</span>
        </div>
        <input
          ref={arquivo} type="file" accept="application/json" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void importarBackup(f)
            e.target.value = ''
          }}
        />
      </div>
    </aside>
  )
}
