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
      <main className="relative z-[1] mx-auto max-w-[1240px] px-[22px] pb-[100px] pt-5">
        <FaixaAviso />
        <Paginas />
        <Rodape />
      </main>
    </BrowserRouter>
  )
}
