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
import { mesPorExtenso } from '@/lib/formato-mes'
import { cn } from '@/lib/utils'
import { filtrarAgenda, ordenarAgenda, resumirAgenda, type FiltroAgenda } from '../resumo'

function Numero({ rotulo, valor, rodape, tom }: { rotulo: string; valor: ReactNode; rodape: ReactNode; tom?: 'bom' | 'ruim' }) {
  return (
    <div className="min-w-[140px]">
      <dt className="text-[13px] text-ink-mute">{rotulo}</dt>
      <dd className={cn('num text-[20px] font-semibold', tom === 'bom' && 'text-credit-deep', tom === 'ruim' && 'text-debit-deep')}>{valor}</dd>
      <dd className="text-[12.5px] text-ink-mute">{rodape}</dd>
    </div>
  )
}

const corValor = { despesa: 'text-debit-deep', receita: 'text-credit-deep', transferencia: 'text-ink-mute' }
const sinal = { despesa: '-', receita: '+', transferencia: '' }
const corPrazo = { venceu: 'text-debit-deep font-semibold', perto: 'text-gold font-semibold', normal: 'text-ink-mute' }

function Item({ a, aoRemover }: { a: Agendamento; aoRemover: (a: Agendamento) => void }) {
  const [confirmando, setConfirmando] = useState(false)
  const iso = dataIso(a.date)!
  const dias = diasAte(iso)
  const prazo = textoPrazo(dias)
  return (
    <div
      className={cn(
        'grid items-center gap-x-4 gap-y-2 border-b border-rule px-1 py-3 last:border-0',
        'grid-cols-[52px_1fr] [grid-template-areas:"dia_desc""valor_acoes"] min-[701px]:grid-cols-[58px_1fr_auto_auto] min-[701px]:[grid-template-areas:"dia_desc_valor_acoes"]',
        dias < 0 && 'relative before:absolute before:inset-y-2 before:-left-3 before:w-[3px] before:rounded-full before:bg-debit',
      )}
    >
      <div className="text-center leading-[1.15] [grid-area:dia]">
        <div className="num text-[22px] font-semibold leading-none">{iso.slice(8, 10)}</div>
        <div className="text-[12px] text-ink-mute">{mesAbreviado(iso)}</div>
      </div>
      <div className="min-w-0 [grid-area:desc]">
        <div className="truncate text-[14.5px] font-medium" title={a.desc}>{a.desc}</div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <CategoriaTag nome={a.category} />
          <span className="text-[13px] text-ink-mute">{ROTULO_ORIGEM[a.source]}</span>
          <span className={cn('text-[13px]', corPrazo[prazo.tom])}>{prazo.texto}</span>
        </div>
      </div>
      <div className={cn('num whitespace-nowrap text-left text-[16px] font-semibold [grid-area:valor] min-[701px]:text-right', corValor[a.type])}>
        {sinal[a.type] && <span aria-hidden="true">{sinal[a.type] === '-' ? '−' : '+'}</span>}{fmtBRL(a.value)}
      </div>
      <div className="flex justify-end gap-1.5 [grid-area:acoes]">
        <Button
          size="sm" disabled={confirmando} title="Já aconteceu: vira lançamento do mês"
          onClick={() => { setConfirmando(true); void confirmarAgendamento(a.id) }}
        >
          <Check /> {confirmando ? 'Confirmando...' : 'Aconteceu'}
        </Button>
        <Button variant="ghost" size="icon" className="text-ink-mute" title="Remover da agenda" aria-label={`Remover ${a.desc} da agenda`} onClick={() => aoRemover(a)}>
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
      <CardTitle dica="O que ainda não aconteceu. Lançamentos com data futura esperam aqui e só entram no mês quando você confirma.">Agenda</CardTitle>

      <dl className="mb-6 flex flex-wrap gap-x-10 gap-y-4">
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
      </dl>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Select value={filtro} onValueChange={(v) => setFiltro(v as FiltroAgenda)}>
          <SelectTrigger size="sm" className="w-auto min-w-[190px]" aria-label="Filtro da agenda"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Próximos 30 dias</SelectItem>
            <SelectItem value="todos">Tudo que está previsto</SelectItem>
            <SelectItem value="mes">Só do mês selecionado</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-[13px] text-ink-mute">{visiveis.length} de {itens.length} {itens.length === 1 ? 'previsto' : 'previstos'}</span>
      </div>

      {!visiveis.length ? (
        <div className="py-8 text-center text-[14px] text-ink-mute">
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
                <div className={cn('pb-1 pt-5 text-[14px] font-semibold text-ink-2', i === 0 && 'pt-2')}>
                  {mesPorExtenso(chave)}
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
