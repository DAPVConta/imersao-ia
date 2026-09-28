import { Navigate, type RouteObject } from 'react-router-dom'
import { PaginaPainel } from '@/pages/painel'

/**
 * Mapa de páginas do app. Para um módulo novo: crie a página em src/pages/,
 * acrescente a rota aqui e (se fizer sentido) um link no Cabecalho.
 * A Vercel já devolve o index.html para qualquer endereço (vercel.json).
 */
export const rotas: RouteObject[] = [
  { path: '/', element: <PaginaPainel /> },
  { path: '*', element: <Navigate to="/" replace /> },
]
