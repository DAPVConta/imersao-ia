import { Check, X } from 'lucide-react'
import { Fragment, useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { confirmarAgendamento, removerAgendamento } from '@/features/financas/acoes'
import { ROTULO_ORIGEM } from '@/features/financas/categorias'
import { CategoriaTag } from '@/features/financas/components/categoria-tag'
import type { Agendamento } from '@/features/financas/tipos'
import { chaveDoMes, dataIso, diasAte, textoPrazo } from '@/lib/datas'
import { fmtBRL, mesAbreviado, rotuloMes } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { filtrarAgenda, ordenarAgenda, resumirAgenda, type FiltroAgenda } from '../resumo'

function Numero({ rotulo, valor, rodape, tom }: { rotulo: string; valor: ReactNode; rodape: ReactNode; tom?: 'bom' | 'ruim' }) {
  return (
    <div className="hairline flex min-w-[150px] flex-col gap-[3px] rounded-md bg-sheet-2 px-[15px] py-[9px]">
      <div className="text-[9.5px] font-extrabold uppercase tracking-[.12em] text-ink-mute">{rotulo}</div>
      <div className={cn('num text-[17px] font-extrabold tracking-[-.01em]', tom === 'bom' && 'text-credit-deep', tom === 'ruim' && 'text-debit-deep')}>
        {valor}
      </div>
      <div className="text-[10.5px] text-ink-mute">{rodape}</div>
    </div>
  )
}

const corValor = { despesa: 'text-debit-deep', receita: 'text-credit-deep', transferencia: 'text-ink-mute' }
const sinal = { despesa: '-', receita: '+', transferencia: '' }
const corPrazo = { venceu: 'text-debit-deep', perto: 'text-gold-deep', normal: 'text-ink-mute' }

function Item({ a, aoRemover }: { a: Agendamento; aoRemover: (a: Agendamento) => void }) {
  const [confirmando, setConfirmando] = useState(false)
  const iso = dataIso(a.date)!
  const dias = diasAte(iso)
  const prazo = textoPrazo(dias)
  return (
    <div
      className={cn(
        'hairline mb-[7px] grid items-center gap-x-[13px] gap-y-[9px] rounded-md bg-sheet px-3.5 py-2.5 transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-navy-3',
        'grid-cols-[52px_1fr] [grid-template-areas:"dia_desc""valor_acoes"] min-[701px]:grid-cols-[58px_1fr_auto_auto] min-[701px]:[grid-template-areas:"dia_desc_valor_acoes"]',
        dias < 0 && 'border-debit bg-debit/[.055]',
      )}
    >
      <div className="text-center leading-[1.15] [grid-area:dia]">
        <div className="num text-lg font-extrabold">{iso.slice(8, 10)}</div>
        <div className="text-[9.5px] font-extrabold uppercase tracking-[.08em] text-ink-mute">{mesAbreviado(iso)}</div>
      </div>
      <div className="min-w-0 [grid-area:desc]">
        <div className="truncate text-[13px] font-bold" title={a.desc}>{a.desc}</div>
        <div className="mt-[3px] flex flex-wrap items-center gap-[11px]">
          <CategoriaTag nome={a.category} />
          <span className="text-[11.5px] text-ink-mute">{ROTULO_ORIGEM[a.source]}</span>
          <span className={cn('text-[10.5px] font-bold', corPrazo[prazo.tom])}>{prazo.texto}</span>
        </div>
      </div>
      <div className={cn('num whitespace-nowrap text-left text-sm font-extrabold [grid-area:valor] min-[701px]:text-right', corValor[a.type])}>
        {sinal[a.type]}{fmtBRL(a.value)}
      </div>
      <div className="flex justify-end gap-1.5 [grid-area:acoes]">
        <Button
          size="sm" disabled={confirmando} title="Já aconteceu: vira lançamento do mês"
          onClick={() => { setConfirmando(true); void confirmarAgendamento(a.id) }}
        >
          <Check /> {confirmando ? 'Confirmando...' : 'Aconteceu'}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Remover da agenda" aria-label={`Remover ${a.desc} da agenda`} onClick={() => aoRemover(a)}>
          <X />
        </Button>
      </div>
    </div>
  )
}

/**
 * Agenda: o que ainda não aconteceu. Lançamento com data futura entra aqui e
 * fica fora dos totais do mês até o dono clicar em "Aconteceu".
 */
export function Agenda({ agenda, mesAtual, saldoDoMes }: { agenda: Agendamento[]; mesAtual: string | null; saldoDoMes: number }) {
  const [filtro, setFiltro] = useState<FiltroAgenda>('30')
  const [removendo, setRemovendo] = useState<Agendamento | null>(null)

  const itens = useMemo(() => ordenarAgenda(agenda), [agenda])
  const resumo = useMemo(() => resumirAgenda(itens, mesAtual, saldoDoMes), [itens, mesAtual, saldoDoMes])
  const visiveis = useMemo(() => filtrarAgenda(itens, filtro, mesAtual), [itens, filtro, mesAtual])

  return (
    <Card>
      <CardTitle dica="o que ainda não aconteceu: todo lançamento com data futura entra aqui">Agenda</CardTitle>

      <div className="mb-[15px] flex flex-wrap gap-2.5">
        <Numero rotulo="A pagar" valor={fmtBRL(resumo.aPagar30)} rodape="nos próximos 30 dias" tom="ruim" />
        <Numero rotulo="A receber" valor={fmtBRL(resumo.aReceber30)} rodape="nos próximos 30 dias" tom="bom" />
        <Numero
          rotulo="Passou da data" valor={resumo.atrasados} tom={resumo.atrasados ? 'ruim' : undefined}
          rodape={resumo.atrasados ? `${fmtBRL(resumo.valorAtrasado)} esperando confirmação` : 'nada atrasado'}
        />
        <Numero
          rotulo="Resultado previsto" valor={fmtBRL(resumo.saldoPrevisto)} tom={resumo.saldoPrevisto < 0 ? 'ruim' : 'bom'}
          rodape={mesAtual ? `${rotuloMes(mesAtual)}, já contando a agenda` : '—'}
        />
      </div>

      <div className="mb-[15px] flex flex-wrap items-center gap-[9px]">
        <Select value={filtro} onValueChange={(v) => setFiltro(v as FiltroAgenda)}>
          <SelectTrigger size="sm" className="w-auto min-w-[190px]" aria-label="Filtro da agenda"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Próximos 30 dias</SelectItem>
            <SelectItem value="todos">Tudo que está previsto</SelectItem>
            <SelectItem value="mes">Só do mês selecionado</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-[11.5px] text-ink-mute">{visiveis.length} de {itens.length} previsto(s)</span>
      </div>

      {!visiveis.length ? (
        <div className="py-5 text-center text-[12.5px] text-ink-mute">
          {itens.length
            ? 'Nada previsto nesse recorte — troque o filtro acima para ver o resto.'
            : 'Nada agendado. Lance algo com data futura em “Lançamento manual” e ele aparece aqui.'}
        </div>
      ) : (
        visiveis.map((a, i) => {
          const chave = chaveDoMes(dataIso(a.date))!
          const novoMes = i === 0 || chave !== chaveDoMes(dataIso(visiveis[i - 1].date))
          return (
            <Fragment key={a.id}>
              {novoMes && (
                <div className={cn('mb-2 border-b border-rule pb-[5px] text-[10px] font-extrabold uppercase tracking-[.12em] text-ink-mute', i > 0 && 'mt-4')}>
                  {rotuloMes(chave)}
                </div>
              )}
              <Item a={a} aoRemover={setRemovendo} />
            </Fragment>
          )
        })
      )}

      <Dialog open={!!removendo} onOpenChange={(aberto) => !aberto && setRemovendo(null)}>
        <DialogContent>
          <DialogTitle>Tirar da agenda?</DialogTitle>
          <DialogDescription>“{removendo?.desc}” deixa de aparecer como previsto, aqui e nos outros aparelhos.</DialogDescription>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemovendo(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (removendo) void removerAgendamento(removendo.id)
                setRemovendo(null)
              }}
            >
              Tirar da agenda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
