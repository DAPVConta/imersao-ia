import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ITENS_MENU } from './menu'

/** No celular o menu vai para a barra de baixo, ao alcance do polegar. */
export function NavCelular() {
  return (
    <nav aria-label="Páginas" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-rule bg-sheet/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      {ITENS_MENU.map(({ rota, curto, icone: Icone }) => (
        <NavLink
          key={rota} to={rota} end={rota === '/'}
          className={({ isActive }) =>
            cn('flex flex-col items-center gap-1 py-2 text-[11px] font-medium', isActive ? 'text-accent' : 'text-ink-mute')}
        >
          <Icone className="size-5" />
          {curto}
        </NavLink>
      ))}
    </nav>
  )
}
