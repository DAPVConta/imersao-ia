import { useEffect } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { BarraLateral } from '@/components/layout/barra-lateral'
import { BarraTopo } from '@/components/layout/barra-topo'
import { FaixaAviso } from '@/components/layout/faixa-aviso'
import { NavCelular } from '@/components/layout/nav-celular'
import { Rodape } from '@/components/layout/rodape'
import { Porteiro } from '@/features/acesso/components/porteiro'
import { iniciar } from '@/features/financas/acoes'
import { rotas } from '@/rotas'

function Paginas() {
  return useRoutes(rotas)
}

/** Casca: menu à esquerda (ou embaixo, no celular), barra do mês no topo e a página no meio. Só aparece depois do login. */
function Painel() {
  useEffect(() => {
    void iniciar()
  }, [])

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <BarraLateral />
        <div className="flex min-w-0 flex-1 flex-col">
          <BarraTopo />
          <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
            <FaixaAviso />
            <Paginas />
            <Rodape />
          </main>
        </div>
      </div>
      <NavCelular />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <Porteiro>
      <Painel />
    </Porteiro>
  )
}
