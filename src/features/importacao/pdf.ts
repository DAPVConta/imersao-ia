/**
 * Lê o texto de um PDF no próprio navegador (nada é enviado para servidor).
 * O pdf.js é carregado só quando alguém anexa um PDF — é pesado (~1 MB) e não
 * precisa atrasar a abertura do painel. Vem do próprio site, sem CDN.
 */
type PdfJs = typeof import('pdfjs-dist')

let carregando: Promise<PdfJs> | null = null

function carregarPdfJs(): Promise<PdfJs> {
  carregando ??= Promise.all([
    // Build "legacy": inclui compatibilidade com navegadores um pouco mais antigos.
    import('pdfjs-dist/legacy/build/pdf.mjs') as Promise<PdfJs>,
    import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
  ]).then(([pdfjs, worker]) => {
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    return pdfjs
  })
  return carregando
}

type ItemTexto = { str: string; transform: number[] }

/** Devolve as linhas de texto do PDF, de cima para baixo, página por página. */
export async function extrairLinhasDoPdf(arquivo: File): Promise<string[]> {
  const pdfjs = await carregarPdfJs()
  const pdf = await pdfjs.getDocument({ data: await arquivo.arrayBuffer() }).promise
  const linhas: string[] = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const pagina = await pdf.getPage(p)
    const conteudo = await pagina.getTextContent()
    // Agrupa pedaços de texto que estão na mesma altura (mesma linha visual).
    const grupos: { y: number; itens: ItemTexto[] }[] = []
    for (const item of conteudo.items as ItemTexto[]) {
      if (!('str' in item)) continue
      const y = Math.round(item.transform[5])
      let g = grupos.find((g) => Math.abs(g.y - y) <= 2)
      if (!g) grupos.push((g = { y, itens: [] }))
      g.itens.push(item)
    }
    grupos.sort((a, b) => b.y - a.y)
    for (const g of grupos) {
      g.itens.sort((a, b) => a.transform[4] - b.transform[4])
      const texto = g.itens.map((i) => i.str).join(' ').replace(/\s+/g, ' ').trim()
      if (texto) linhas.push(texto)
    }
  }
  return linhas
}
