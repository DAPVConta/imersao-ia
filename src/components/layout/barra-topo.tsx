import { ChevronLeft, ChevronRight, LogOut, Plus } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSair } from '@/features/acesso/use-sair'
import { criarMes } from '@/features/financas/acoes'
import { irParaMes, vizinhos } from '@/features/financas/navegacao'
import { useFinancas } from '@/features/financas/store'
import { mesPorExtenso } from '@/lib/formato-mes'
import { Logo } from './logo'

/** Barra do topo: o mês aberto (vale para todas as páginas) e o botão de lançar. */
export function BarraTopo() {
  const meses = useFinancas((e) => e.base.months)
  const mesAtual = useFinancas((e) => e.mesAtual)
  const navegar = useNavigate()
  const { saindo, sair } = useSair()
  const [novoMesAberto, setNovoMesAberto] = useState(false)
  const [novoMes, setNovoMes] = useState('')

  const chaves = Object.keys(meses).sort()
  const { anterior, proximo } = vizinhos()

  // Setas ← → trocam de mês (fora de campos de texto e de listas abertas).
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const alvo = e.target as HTMLElement
      if (alvo.closest('input, textarea, select, [role="listbox"], [role="dialog"], [role="tablist"]')) return
      const v = vizinhos()
      if (e.key === 'ArrowLeft' && v.anterior) irParaMes(v.anterior)
      if (e.key === 'ArrowRight' && v.proximo) irParaMes(v.proximo)
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [])

  /** Leva ao formulário de lançamento e põe o cursor na descrição. */
  const irParaLancamento = () => {
    navegar('/importar')
    setTimeout(() => {
      document.querySelector<HTMLButtonElement>('[data-aba="manual"]')?.click()
      document.getElementById('m-desc')?.focus()
    }, 80)
  }

  const confirmarNovoMes = (e: FormEvent) => {
    e.preventDefault()
    if (criarMes(novoMes)) {
      setNovoMesAberto(false)
      setNovoMes('')
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-sheet/90 backdrop-blur">
      <div className="flex items-center gap-2 px-4 py-2 sm:px-6">
        <Logo className="size-8 flex-none lg:hidden" />

        <nav aria-label="Mês" className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" disabled={!anterior} onClick={() => irParaMes(anterior)} aria-label="Mês anterior" title="Mês anterior (←)">
            <ChevronLeft />
          </Button>
          <Select value={mesAtual ?? undefined} onValueChange={irParaMes}>
            <SelectTrigger variant="titulo" className="w-auto" aria-label="Mês">
              <SelectValue placeholder="Escolha o mês">{mesAtual && mesPorExtenso(mesAtual)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {chaves.map((k) => <SelectItem key={k} value={k}>{mesPorExtenso(k)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" disabled={!proximo} onClick={() => irParaMes(proximo)} aria-label="Próximo mês" title="Próximo mês (→)">
            <ChevronRight />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setNovoMesAberto(true)} className="hidden text-ink-mute sm:inline-flex">
            Novo mês
          </Button>
        </nav>

        <Button variant="default" onClick={irParaLancamento} className="ml-auto max-sm:size-9 max-sm:px-0" aria-label="Lançar">
          <Plus /> <span className="max-sm:sr-only">Lançar</span>
        </Button>
        {/* No celular o menu lateral some; o Sair fica aqui, só com o ícone. */}
        <Button variant="ghost" size="icon" onClick={sair} disabled={saindo} aria-label="Sair da conta" title="Sair da conta" className="lg:hidden">
          <LogOut />
        </Button>
      </div>

      <Dialog open={novoMesAberto} onOpenChange={setNovoMesAberto}>
        <DialogContent>
          <form onSubmit={confirmarNovoMes} className="grid gap-4">
            <DialogTitle>Novo mês</DialogTitle>
            <DialogDescription>Escolha o mês que você quer começar a preencher.</DialogDescription>
            <div>
              <Label htmlFor="novo-mes">Mês</Label>
              <Input id="novo-mes" type="month" placeholder="AAAA-MM" required value={novoMes} onChange={(e) => setNovoMes(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setNovoMesAberto(false)}>Cancelar</Button>
              <Button type="submit" variant="default">Criar mês</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
