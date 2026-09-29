# Design do Assistente Financeiro

Plano feito com a skill `frontend-design` (`.claude/skills/frontend-design/SKILL.md`).
Todo módulo novo segue estas decisões; mudar alguma delas é decisão de design,
não detalhe de implementação.

## Assunto, público e tarefa

- **Assunto:** o fechamento do mês das finanças de uma casa brasileira —
  extrato da conta, fatura do cartão, contas a vencer.
- **Público:** o dono, que não é da área de tecnologia. Abre o painel quando
  a fatura chega e no fim do mês.
- **Tarefa principal da tela:** responder "como o mês fechou e o que ainda
  vem pela frente", em segundos, sem precisar interpretar gráfico.

## De onde vem a identidade

Do mundo do dinheiro impresso: a **cédula de real** e a impressão de segurança.
Papel-moeda levemente esverdeado, tinta de talho-doce (verde-pinho profundo),
as cores das notas (R$ 5 violeta, R$ 10 carmim, R$ 20 laranja, R$ 50 ocre,
R$ 100 azul-petróleo) e o **guilhochê** — o rendilhado de linhas finas que
protege as notas contra falsificação.

## Paleta (tema claro)

| Nome | Hex | Uso |
|---|---|---|
| Papel-moeda | `#E8ECE6` | fundo da página |
| Folha | `#F8F9F5` | superfícies (cédula, extrato) |
| Tinta de talho | `#17302B` | texto principal |
| Verde de entrada | `#1E7A55` | dinheiro que entrou / sobrou |
| Carmim de saída | `#A3324A` | dinheiro que saiu / faltou |
| Violeta de nota de 5 | `#5E4FA2` | ações, foco, mês selecionado |

Tema escuro: "cofre à noite" — fundo verde-pinho `#0E1A18` (nunca preto
neutro), as mesmas cores mais claras. Tokens em `src/index.css`.

As categorias usam as cores das cédulas (Moradia azul-petróleo da nota de 100,
Alimentação laranja da de 20, Transporte ocre da de 50, Educação carmim da de
10, Saúde violeta-rosado da de 5...), em `src/index.css` (`--cat-*`).

## Tipografia

- **Bodoni Moda** (serifa de alto contraste, como os valores impressos nas
  cédulas) — só no valor principal da cédula do mês e no nome do mês. Com
  parcimônia: nunca em rótulos ou tabelas.
- **Public Sans** — todo o resto: sóbria, de extrato bancário, com algarismos
  tabulares (`tabular-nums`) para colunas de valores alinharem.
- Escala: 12 / 13 / 14 (corpo) / 16 / 20 / 28 / 64–88 (valor da cédula).
- Rótulos em **caixa normal** (sentence case). Nada de CAIXA-ALTA espaçada,
  nada de "A · B · C", nada de fonte monoespaçada em rótulo.

## Layout

Coluna única, alinhada à esquerda, largura máxima 1180 px. É um extrato, não
um mural de cartões: seções separadas por espaço e uma linha fina; superfície
com fundo próprio só onde há objeto (a cédula e a tabela do extrato).

```
┌────────────────────────────────────────────────────────────┐
│ logo  Assistente Financeiro     ‹  julho de 2026  ›  Lançar │  barra fina
├────────────────────────────────────────────────────────────┤
│ ┌── CÉDULA DO MÊS ───────────────────────────────────────┐ │
│ │ ◎ guilhochê        Sobrou em julho                      │ │
│ │   (anel = % que    R$ 5.960,40      ← Bodoni, grande     │ │
│ │    sobrou)         Entrou 8.450 | Saiu 2.489 | frase    │ │
│ └────────────────────────────────────────────────────────┘ │
│ O ano   ▇▇ ▇▇ ▇▇ ▇▇  (entradas acima, saídas abaixo;       │
│         ▂▂ ▃▃ ▂▂ ▅▅   cada mês é clicável e troca o mês)   │
├──────────────────────────────┬─────────────────────────────┤
│ Para onde foi o dinheiro     │ Conta e cartão              │
│ ████████ Moradia   2.300     │ saldo, fatura, limite, mín. │
├──────────────────────────────┴─────────────────────────────┤
│ Agenda (o que ainda vai acontecer)                         │
├────────────────────────────────────────────────────────────┤
│ Extrato de julho (tabela)                                  │
├────────────────────────────────────────────────────────────┤
│ Trazer lançamentos (manual, PDF, CSV, exemplo, regras)     │
└────────────────────────────────────────────────────────────┘
```

No celular tudo empilha; a cédula vira vertical (guilhochê em cima).

## Assinatura (a única ousadia)

A **cédula do mês**: o resultado do mês impresso como uma nota, com um rosetão
de guilhochê gerado em SVG. O rosetão é informação, não enfeite — o anel
externo preenche a fração da receita que sobrou (a "poupança"). É o único
momento animado sem clique: ao abrir e ao trocar de mês, as linhas do
guilhochê se desenham e o valor conta até o número final.

Todo o resto fica quieto: sem gradiente decorativo, sem sombra em tudo, sem
cartão levantando no hover, sem animação de entrada por seção.

## Recursos de interação

- Trocar de mês por `‹ ›`, pelas setas ← → do teclado, pela lista ou
  clicando no mês no gráfico do ano. A troca usa *View Transitions* do
  navegador (transição suave nativa), quando disponível.
- "Lançar" no topo leva direto ao formulário e já põe o cursor na descrição.
- Movimento só responde a ação da pessoa (abrir diálogo, trocar de mês),
  exceto a assinatura. `prefers-reduced-motion` desliga tudo.

## Texto

Português simples, do ponto de vista de quem usa: "Entrou", "Saiu",
"Sobrou", "Faltou", "Para onde foi o dinheiro". Botões dizem o que fazem
("Adicionar lançamento", "Confirmar importação"); erros dizem o que houve e
o que fazer; tela vazia convida a agir.

## Revisão contra os padrões genéricos (feita antes de codar)

- *Primeira ideia:* manter a faixa azul-marinho com números grandes em
  cartões coloridos e gradiente. É o "número grande + rótulo pequeno +
  gradiente" genérico. **Trocado** pela cédula com guilhochê, que só faz
  sentido para dinheiro.
- *Paleta:* nem creme+terracota, nem preto+neon, nem marinho+dourado de SaaS.
  Veio das cédulas. **Mantida.**
- *Fontes:* Inter + JetBrains Mono eram escolhas padrão. **Trocadas** por
  Bodoni Moda (restrita) + Public Sans.
- *Estrutura:* "kit de cartões SaaS" (tudo em caixas iguais com sombra).
  **Trocado** por seções de extrato separadas por linha.
- *Rosca de categorias:* difícil de ler com muitas fatias. **Trocada** por
  barras horizontais ordenadas, lidas como uma lista.
- *Dois gráficos de linha/barra separados:* **fundidos** num só gráfico do
  ano, que também serve para navegar entre meses.
- *Acessório removido (Chanel):* a borda com microtexto de segurança em volta
  da cédula — bonita, mas não informa nada. Fica só o guilhochê.
