import { ChevronLeft, ChevronRight, Contrast, Download, Plus, Upload } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { criarMes, exportarBackup, importarBackup } from '@/features/financas/acoes'
import { irParaMes, vizinhos } from '@/features/financas/navegacao'
import { useFinancas } from '@/features/financas/store'
import { useTema } from '@/hooks/use-tema'
import { mesPorExtenso } from '@/lib/formato-mes'
import { Logo } from './logo'

const ROTULO_TEMA = { auto: 'Tema automático', light: 'Tema claro', dark: 'Tema escuro' } as const

/** Leva ao formulário de lançamento e põe o cursor na descrição. */
function irParaLancamento() {
  const campo = document.getElementById('m-desc') as HTMLInputElement | null
  document.getElementById('trazer-lancamentos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  document.querySelector<HTMLButtonElement>('[data-aba="manual"]')?.click()
  setTimeout(() => campo?.focus({ preventScroll: true }), 350)
}

export function Cabecalho() {
  const meses = useFinancas((e) => e.base.months)
  const mesAtual = useFinancas((e) => e.mesAtual)
  const { tema, alternar } = useTema()
  const arquivo = useRef<HTMLInputElement>(null)
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

  const confirmarNovoMes = (e: FormEvent) => {
    e.preventDefault()
    if (criarMes(novoMes)) {
      setNovoMesAberto(false)
      setNovoMes('')
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 sm:px-6">
        <a href="/" className="flex items-center gap-2.5 rounded-sm">
          <Logo className="size-8 flex-none" />
          <span className="text-[15px] font-semibold tracking-[-.01em]">Assistente Financeiro</span>
        </a>

        <nav aria-label="Mês" className="order-3 flex w-full items-center gap-1 sm:order-none sm:w-auto">
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
          <Button variant="ghost" size="sm" onClick={() => setNovoMesAberto(true)} className="ml-1 text-ink-mute">
            Novo mês
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={exportarBackup} aria-label="Exportar backup" title="Exportar backup (arquivo JSON)">
            <Download />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => arquivo.current?.click()} aria-label="Importar backup" title="Importar backup">
            <Upload />
          </Button>
          <Button variant="ghost" size="icon" onClick={alternar} aria-label={`${ROTULO_TEMA[tema]} — trocar`} title={`${ROTULO_TEMA[tema]} (clique para trocar)`}>
            <Contrast />
          </Button>
          <Button variant="default" onClick={irParaLancamento} className="ml-2">
            <Plus /> Lançar
          </Button>
          <input
            ref={arquivo} type="file" accept="application/json" className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void importarBackup(f)
              e.target.value = ''
            }}
          />
        </div>
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
