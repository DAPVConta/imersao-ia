import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Superficie } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { excluirRegra, mudarCategoriaDaRegra } from '@/features/financas/acoes'
import { SeletorCategoria } from '@/features/financas/components/seletores'
import { useFinancas } from '@/features/financas/store'

export function TabelaRegras() {
  const regras = useFinancas((e) => e.base.rules)
  const linhas = [
    ...Object.entries(regras.cnpj).map(([chave, r]) => ({ grupo: 'cnpj' as const, chave, r, tipo: 'CNPJ/CPF (extrato)' })),
    ...Object.entries(regras.mcc).map(([chave, r]) => ({ grupo: 'mcc' as const, chave, r, tipo: 'MCC (fatura)' })),
  ]
  return (
    <div>
      <p className="mb-4 max-w-[70ch] text-[13.5px] text-ink-mute">
        Regras usadas para classificar lançamentos automaticamente ao importar. O CNPJ/CPF do favorecido (extrato) e o MCC (fatura) são a
        chave estável — o nome do estabelecimento muda, esses códigos não.
      </p>
      <Superficie className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chave</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Referência (última vez vista)</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.map(({ grupo, chave, r, tipo }) => {
            const especial = r.cat === '__bank__'
            return (
              <TableRow key={grupo + chave}>
                <TableCell className="num whitespace-nowrap">{chave}</TableCell>
                <TableCell>{tipo}</TableCell>
                <TableCell>{r.label}</TableCell>
                <TableCell className="min-w-[170px]">
                  {especial ? (
                    <span className="text-[13.5px] text-ink-mute">regra especial (banco)</span>
                  ) : (
                    <SeletorCategoria tamanho="sm" valor={r.cat} aoMudar={(c) => mudarCategoriaDaRegra(grupo, chave, c)} />
                  )}
                </TableCell>
                <TableCell>
                  {!especial && (
                    <Button variant="ghost" size="icon" onClick={() => excluirRegra(grupo, chave)} aria-label={`Excluir regra ${chave}`}>
                      <X />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      </Superficie>
    </div>
  )
}
