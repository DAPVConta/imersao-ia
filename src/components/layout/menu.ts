import { CalendarClock, LayoutDashboard, ListOrdered, Upload, type LucideIcon } from 'lucide-react'

/** Itens do menu lateral (e da barra inferior no celular). Um por página. */
export const ITENS_MENU: { rota: string; rotulo: string; icone: LucideIcon; curto: string }[] = [
  { rota: '/', rotulo: 'Painel', curto: 'Painel', icone: LayoutDashboard },
  { rota: '/agenda', rotulo: 'Agenda', curto: 'Agenda', icone: CalendarClock },
  { rota: '/lancamentos', rotulo: 'Lançamentos', curto: 'Extrato', icone: ListOrdered },
  { rota: '/importar', rotulo: 'Trazer lançamentos', curto: 'Importar', icone: Upload },
]
