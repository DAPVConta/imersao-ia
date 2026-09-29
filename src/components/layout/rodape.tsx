import { VERSAO_APP } from '@/lib/versao'

export function Rodape() {
  return (
    <footer className="mt-10 border-t border-rule pt-6 text-[12.5px] text-ink-mute">
      <p className="max-w-[70ch]">
        O que você lança ou importa fica salvo no banco de dados e aparece em qualquer aparelho. Os dados de exemplo são
        fictícios.
      </p>
      <p className="mt-1">Versão {VERSAO_APP}</p>
    </footer>
  )
}
