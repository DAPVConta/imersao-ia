import { cn } from '@/lib/utils'
import { corDaCategoria } from '../categorias'

/** Nome da categoria com o quadradinho colorido na frente. */
export function CategoriaTag({ nome, className }: { nome: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[13px] text-ink-2', className)}>
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ background: corDaCategoria(nome) }}
      />
      {nome}
    </span>
  )
}
