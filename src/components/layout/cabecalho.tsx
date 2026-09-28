import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { criarMes, exportarBackup, importarBackup } from '@/features/financas/acoes'
import { escolherMes, useFinancas } from '@/features/financas/store'
import { useTema } from '@/hooks/use-tema'
import { rotuloMes } from '@/lib/formato'
import { Logo } from './logo'

const ROTULO_TEMA = { auto: '◐ Auto', light: '☀ Claro', dark: '☾ Escuro' } as const

export function Cabecalho() {
  const meses = useFinancas((e) => e.base.months)
  const mesAtual = useFinancas((e) => e.mesAtual)
  const { tema, alternar } = useTema()
  const arquivo = useRef<HTMLInputElement>(null)
  const [novoMesAberto, setNovoMesAberto] = useState(false)
  const [novoMes, setNovoMes] = useState('')

  const chaves = Object.keys(meses).sort()

  const confirmarNovoMes = (e: FormEvent) => {
    e.preventDefault()
    if (criarMes(novoMes)) {
      setNovoMesAberto(false)
      setNovoMes('')
    }
  }

  return (
    <header className="relative z-[2]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-[22px] pb-2 pt-5">
        <div className="flex items-center gap-[13px]">
          <Logo className="size-[46px] flex-none drop-shadow-[0_6px_14px_rgba(0,0,0,.45)]" />
          <div>
            <h1 className="m-0 text-lg font-extrabold tracking-[-.01em] text-on-navy">Assistente Financeiro</h1>
            <div className="mt-[3px] text-[10.5px] font-bold uppercase tracking-[.14em] text-on-navy-2">
              Dashboard mensal · importações salvas no banco de dados
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-[9px]">
          <Select value={mesAtual ?? undefined} onValueChange={escolherMes}>
            <SelectTrigger variant="glass" className="w-auto min-w-[128px]" aria-label="Mês">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {chaves.map((k) => (
                <SelectItem key={k} value={k}>
                  {rotuloMes(k)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="glass" onClick={() => setNovoMesAberto(true)}>
            + Novo mês
          </Button>
          <Button variant="glass-ghost" onClick={exportarBackup}>
            Exportar backup
          </Button>
          <Button variant="glass-ghost" onClick={() => arquivo.current?.click()}>
            Importar backup
          </Button>
          <Button variant="glass-ghost" onClick={alternar} title="Alternar tema (auto → claro → escuro)" aria-label="Alternar tema">
            {ROTULO_TEMA[tema]}
          </Button>
          <input
            ref={arquivo}
            type="file"
            accept="application/json"
            className="hidden"
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
              <Button type="button" variant="ghost" onClick={() => setNovoMesAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="default">
                Criar mês
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
