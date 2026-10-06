import { AlertTriangle, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { fmtBRL } from '@/lib/formato'
import { pedirDicas } from '../banco'
import type { DicasDaIA } from '../tipos'

type Estado =
  | { fase: 'parado' }
  | { fase: 'pensando' }
  | { fase: 'pronto'; dicas: DicasDaIA }
  | { fase: 'erro'; mensagem: string }

const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

/**
 * Botão "Dicas da IA" do painel. Ao abrir pela primeira vez pede as dicas;
 * depois guarda a resposta (cada pedido custa uma chamada à IA) e só gera de
 * novo quando a pessoa pede.
 */
export function BotaoDicas() {
  const [aberto, setAberto] = useState(false)
  const [estado, setEstado] = useState<Estado>({ fase: 'parado' })

  const gerar = async () => {
    setEstado({ fase: 'pensando' })
    try {
      setEstado({ fase: 'pronto', dicas: await pedirDicas() })
    } catch (e) {
      setEstado({ fase: 'erro', mensagem: e instanceof Error ? e.message : String(e) })
    }
  }

  const abrir = () => {
    setAberto(true)
    if (estado.fase === 'parado' || estado.fase === 'erro') void gerar()
  }

  return (
    <>
      <Button variant="default" onClick={abrir}>
        <Sparkles /> Dicas da IA
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[88dvh] max-w-2xl overflow-y-auto sm:p-8">
          <div className="flex items-center gap-3 pr-8">
            <span className="grid size-10 flex-none place-items-center rounded-full bg-accent/10 text-accent">
              <Sparkles className="size-5" />
            </span>
            <div>
              <DialogTitle>Dicas para as finanças da casa</DialogTitle>
              <DialogDescription className="text-[13px] text-ink-mute">
                A inteligência artificial lê os números salvos e sugere o que fazer.
              </DialogDescription>
            </div>
          </div>

          {estado.fase === 'pensando' && (
            <div className="flex flex-col items-center gap-3 py-12 text-center" role="status">
              <Loader2 className="size-7 text-accent motion-safe:animate-spin" />
              <p className="text-[14px] text-ink-2">Lendo seus números e preparando as dicas…</p>
              <p className="text-[12.5px] text-ink-mute">Costuma levar menos de um minuto.</p>
            </div>
          )}

          {estado.fase === 'erro' && (
            <div className="grid gap-4">
              <Alert variant="erro" className="mb-0 bg-sheet-2 shadow-none">{estado.mensagem}</Alert>
              <div><Button onClick={() => void gerar()}><RefreshCw /> Tentar de novo</Button></div>
            </div>
          )}

          {estado.fase === 'pronto' && <Resultado dicas={estado.dicas} aoGerarDeNovo={() => void gerar()} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

function Resultado({ dicas, aoGerarDeNovo }: { dicas: DicasDaIA; aoGerarDeNovo: () => void }) {
  return (
    <div className="grid gap-5">
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">{dicas.resumo}</p>

      {dicas.alerta && (
        <div className="flex gap-3 rounded-md border-l-[3px] border-l-gold bg-gold/10 px-4 py-3 text-[14px] text-ink" role="alert">
          <AlertTriangle className="mt-0.5 size-4 flex-none text-gold" />
          <p className="whitespace-pre-line">{dicas.alerta}</p>
        </div>
      )}

      {/* Lista numerada: a IA ordena da dica mais importante para a menos. */}
      <ol className="grid gap-3">
        {dicas.dicas.map((d, i) => (
          <li key={i} className="flex gap-3.5 rounded-md border border-rule p-4">
            <span className="num grid size-7 flex-none place-items-center rounded-full bg-accent text-[13px] font-semibold text-accent-foreground">
              {i + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold leading-snug text-ink">{d.titulo}</h3>
              <p className="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-ink-2">{d.explicacao}</p>
              {d.economia_mensal_estimada !== null && d.economia_mensal_estimada > 0 && (
                <p className="mt-2 text-[13px] text-credit-deep">
                  Pode economizar cerca de <strong className="num font-semibold">{fmtBRL(d.economia_mensal_estimada)}</strong> por mês
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
        <p className="max-w-[48ch] text-[12px] text-ink-mute">
          Feito por inteligência artificial às {hora(dicas.gerado_em)}, com os dados salvos no banco. Confira antes de decidir.
        </p>
        <Button size="sm" onClick={aoGerarDeNovo}><RefreshCw /> Gerar de novo</Button>
      </div>
    </div>
  )
}
