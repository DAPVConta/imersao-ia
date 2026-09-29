import { Navigate, type RouteObject } from 'react-router-dom'
import { PaginaAgenda } from '@/pages/agenda'
import { PaginaImportar } from '@/pages/importar'
import { PaginaLancamentos } from '@/pages/lancamentos'
import { PaginaPainel } from '@/pages/painel'

/**
 * Mapa de páginas do app. Para um módulo novo: crie a página em src/pages/,
 * acrescente a rota aqui e o item em components/layout/menu.ts.
 * A Vercel já devolve o index.html para qualquer endereço (vercel.json).
 */
export const rotas: RouteObject[] = [
  { path: '/', element: <PaginaPainel /> },
  { path: '/agenda', element: <PaginaAgenda /> },
  { path: '/lancamentos', element: <PaginaLancamentos /> },
  { path: '/importar', element: <PaginaImportar /> },
  { path: '*', element: <Navigate to="/" replace /> },
]
