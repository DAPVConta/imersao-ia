import * as React from 'react'
import { cn } from '@/lib/utils'

/** Tabela com rolagem própria e cabeçalho fixo. */
function Table({ className, contida = true, ...props }: React.HTMLAttributes<HTMLTableElement> & { contida?: boolean }) {
  const tabela = <table className={cn('w-full border-collapse text-[12.8px]', className)} {...props} />
  return contida ? <div className="max-h-[560px] overflow-auto rounded-sm">{tabela}</div> : tabela
}

const TableHeader = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...props} />
const TableBody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />

function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('transition-colors', className)} {...props} />
}

function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'sticky top-0 z-[1] border-b-2 border-rule-strong bg-sheet px-[11px] py-2.5 text-left align-middle',
        'text-[10px] font-extrabold uppercase tracking-[.11em] text-ink-mute',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('border-b border-rule px-[11px] py-2.5 text-left align-middle', className)} {...props} />
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow }
