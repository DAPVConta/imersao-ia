import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NOMES_CATEGORIAS, ROTULO_ORIGEM, ROTULO_TIPO } from '../categorias'
import type { Origem, TipoLancamento } from '../tipos'
import { CategoriaTag } from './categoria-tag'

type Tamanho = 'default' | 'sm'

export function SeletorCategoria({
  valor, aoMudar, tamanho, id, className,
}: { valor: string; aoMudar: (v: string) => void; tamanho?: Tamanho; id?: string; className?: string }) {
  // Categoria que não está na lista (ex.: "Transferência") continua aparecendo.
  const opcoes = NOMES_CATEGORIAS.includes(valor) ? NOMES_CATEGORIAS : [...NOMES_CATEGORIAS, valor]
  return (
    <Select value={valor} onValueChange={aoMudar}>
      <SelectTrigger id={id} size={tamanho} className={className} aria-label="Categoria">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opcoes.map((c) => (
          <SelectItem key={c} value={c}>
            <CategoriaTag nome={c} className="text-[13px] text-ink" />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function SeletorTipo({
  valor, aoMudar, tamanho, id, rotuloTransferencia = 'Transferência',
}: { valor: TipoLancamento; aoMudar: (v: TipoLancamento) => void; tamanho?: Tamanho; id?: string; rotuloTransferencia?: string }) {
  return (
    <Select value={valor} onValueChange={(v) => aoMudar(v as TipoLancamento)}>
      <SelectTrigger id={id} size={tamanho} aria-label="Tipo">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="despesa">{ROTULO_TIPO.despesa}</SelectItem>
        <SelectItem value="receita">{ROTULO_TIPO.receita}</SelectItem>
        <SelectItem value="transferencia">{rotuloTransferencia}</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function SeletorOrigem({ valor, aoMudar, id }: { valor: Origem; aoMudar: (v: Origem) => void; id?: string }) {
  return (
    <Select value={valor} onValueChange={(v) => aoMudar(v as Origem)}>
      <SelectTrigger id={id} aria-label="Origem">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="conta">{ROTULO_ORIGEM.conta}</SelectItem>
        <SelectItem value="cartao">{ROTULO_ORIGEM.cartao}</SelectItem>
      </SelectContent>
    </Select>
  )
}
