import { useEffect } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { Cabecalho } from '@/components/layout/cabecalho'
import { FaixaAviso } from '@/components/layout/faixa-aviso'
import { Rodape } from '@/components/layout/rodape'
import { iniciar } from '@/features/financas/acoes'
import { rotas } from '@/rotas'

function Paginas() {
  return useRoutes(rotas)
}

export default function App() {
  useEffect(() => {
    void iniciar()
  }, [])

  return (
    <BrowserRouter>
      <Cabecalho />
      <main className="mx-auto max-w-[1180px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <FaixaAviso />
        <Paginas />
        <Rodape />
      </main>
    </BrowserRouter>
  )
}
