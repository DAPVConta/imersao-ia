import { VERSAO_APP } from '@/lib/versao'

export function Rodape() {
  return (
    <footer className="mt-[30px] text-center text-[11px] text-ink-mute">
      Dados de exemplo fictícios, para uso didático. O que você importa é salvo no banco de dados e aparece em qualquer
      aparelho. <span>· {VERSAO_APP}</span>
    </footer>
  )
}
