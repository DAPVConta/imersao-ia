import logoCompleto from '@/assets/marca/logo-completo.png'
import simbolo from '@/assets/marca/simbolo.png'
import { cn } from '@/lib/utils'

/**
 * Símbolo da marca (barras subindo + moeda). Vai ao lado do nome escrito,
 * por isso o texto alternativo fica vazio: o nome já está na tela.
 * Cores vivas sobre fundo transparente: funciona no menu escuro e no claro.
 */
export function Logo({ className }: { className?: string }) {
  return <img src={simbolo} alt="" width={180} height={180} className={cn('object-contain', className)} />
}

/**
 * Logotipo completo (símbolo + "Financeiro / Sistema financeiro"). O texto do
 * desenho é azul-marinho: só usar sobre fundo claro. No tema escuro ele fica
 * sobre a placa clara (`bg-placa`), para não sumir.
 */
export function LogoCompleto({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex rounded-md bg-placa p-2', className)}>
      <img src={logoCompleto} alt="Financeiro, sistema financeiro" width={327} height={240} className="h-full w-auto" />
    </span>
  )
}
