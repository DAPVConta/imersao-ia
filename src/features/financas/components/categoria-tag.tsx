import { cn } from '@/lib/utils'
import { corDaCategoria } from '../categorias'

/** Nome da categoria com o quadradinho colorido na frente. */
export function CategoriaTag({ nome, className }: { nome: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-[7px] text-[11.5px] font-semibold tracking-[.01em] text-ink-2', className)}>
      <span
        className="size-2 shrink-0 rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,.2)]"
        style={{ background: corDaCategoria(nome) }}
      />
      {nome}
    </span>
  )
}
