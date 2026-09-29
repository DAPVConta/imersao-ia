# Design do Assistente Financeiro

Plano feito com a skill `frontend-design` (`.claude/skills/frontend-design/SKILL.md`),
revisado em 29/09/2026 a pedido do dono: layout de painel com **menu fixo à
esquerda**, cartões de indicadores e uma faixa de resultado no topo. As
referências foram dois painéis administrativos (menu azul-marinho, faixa verde
de resultado, cartões brancos com ícone); este plano parte deles e sobe a
régua onde eles são genéricos.

Todo módulo novo segue estas decisões; mudar alguma delas é decisão de design,
não detalhe de implementação.

## Assunto, público e tarefa

- **Assunto:** o fechamento do mês das finanças de uma casa brasileira —
  extrato da conta, fatura do cartão, contas a vencer.
- **Público:** o dono, que não é da área de tecnologia. Abre o painel quando
  a fatura chega, no fim do mês e quando quer saber "o que ainda vem".
- **Tarefa principal:** responder "como o mês fechou e o que vem pela frente"
  em segundos, e chegar a qualquer área (agenda, extrato, importar) com um
  clique, sem rolar.

## Estrutura

Aplicativo de páginas, não uma página longa:

```
┌──────────┬─────────────────────────────────────────────────────────┐
│ ●  Assis-│  ‹  agosto de 2026 ▾  ›   Novo mês              + Lançar │  barra do mês
│ tente    ├─────────────────────────────────────────────────────────┤
│          │  Painel                                                 │
│ ▍Painel  │  41 lançamentos em agosto de 2026                       │
│  Agenda  │  ┌──────────────────────────────────────────────────┐   │
│  Lança-  │  │ Sobrou em agosto            Entrou     Saiu   ⊛ │   │  faixa de resultado
│  mentos  │  │ R$ 1.590,31                 9.692     8.101  ⊛⊛ │   │  (guilhochê como marca-d'água)
│  Trazer  │  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░  │   │
│          │  └──────────────────────────────────────────────────┘   │
│          │  ┌ Entrou ┐ ┌ Saiu ┐ ┌ Guardado ┐ ┌ A pagar 30d ┐       │  indicadores + tendência
│          │  ┌ O ano mês a mês ─────────────────────────────────┐   │
│          │  ┌ Para onde foi ──────┐ ┌ Conta e cartão ─────────┐   │
│ ◐ ⇩ ⇧ v… │                                                         │
└──────────┴─────────────────────────────────────────────────────────┘
```

- **Menu à esquerda** (248 px, fixo, azul-petróleo profundo): marca, quatro
  páginas com ícone — Painel, Agenda, Lançamentos, Trazer lançamentos — e,
  embaixo, tema, backup e versão. Item ativo: fundo um tom mais claro e um
  traço verde à esquerda. No celular o menu vai para uma **barra inferior**,
  ao alcance do polegar.
- **Barra do topo**: o mês aberto (vale para todas as páginas: ‹ › , lista,
  setas do teclado) e o botão "Lançar".
- **Página**: título (24 px) + uma linha de contexto, e depois cartões. Um
  assunto por cartão; largura máxima 1280 px.
- Cartão = folha branca, canto 14 px, borda de 1 px e sombra leve. Não há
  seção sem cartão nem cartão dentro de cartão (a tabela usa só uma moldura).

## De onde vem a identidade

Do dinheiro impresso, como antes, mas em papel administrativo: o azul-petróleo
da nota de R$ 100 no menu e nas ações, verde de entrada, carmim de saída, e o
**guilhochê** das cédulas como marca-d'água da faixa de resultado (o desenho
muda a cada mês). É a única assinatura; o resto é sóbrio.

## Paleta (tema claro)

| Nome | Hex | Uso |
|---|---|---|
| Fundo | `#F3F5F8` | fundo da área de conteúdo |
| Folha | `#FFFFFF` | cartões |
| Tinta | `#142133` | texto principal |
| Menu | `#0C243A` / `#143450` | menu lateral e item ativo |
| Petróleo | `#14628C` | ações, foco, item selecionado (nota de R$ 100) |
| Verde de entrada | `#16A36A` | dinheiro que entrou / sobrou |
| Carmim de saída | `#DC3E54` | dinheiro que saiu / faltou |
| Violeta | `#6A54C4` | o que está previsto (agenda) |
| Âmbar | `#C77E14` | alerta (limite alto, vence logo) |

Faixa de resultado: gradiente de tinta profunda (menu → verde-mar → verde de
entrada) quando sobrou; (menu → vinho → carmim) quando faltou. Tema escuro:
"cofre à noite" — fundo azul-ardósia (`#0E141E`), cartões `#17202E`, as mesmas
cores mais claras. Tokens em `src/index.css`, sempre nos três blocos.

As categorias usam as cores das cédulas (`--cat-*`), como antes.

## Tipografia

- **Public Sans** para tudo, sem segunda família. A hierarquia vem de
  tamanho e peso, não de troca de fonte.
- Escala: 12 / 13 / 14 (corpo) / 17 (título de cartão) / 21 (indicador) /
  24 (título de página) / 38–56 (resultado do mês).
- Números sempre com `num` (algarismos tabulares); valores grandes com
  espaçamento negativo (`tracking -.02em`).
- Rótulos em caixa normal. Nada de CAIXA-ALTA espaçada, "A · B · C" ou fonte
  monoespaçada.

## Indicadores

Cada cartão de indicador diz quatro coisas, nesta ordem: o rótulo, o número,
a **variação** em relação ao mês anterior (▲ ▼ %) e a **tendência** dos
últimos seis meses numa linha sem eixos. O ícone tem fundo na cor do
indicador (verde entrou, carmim saiu, petróleo guardado, violeta agenda).
O cartão inteiro é um link para a página que detalha aquele número.

## Movimento

Só responde a ação da pessoa: trocar de mês (View Transitions), abrir
diálogo, o número do resultado contando ao abrir. `prefers-reduced-motion`
desliga tudo. Nada de entrada animada por seção, nada de cartão que sobe no
hover (só a borda escurece).

## Texto

Português simples, do ponto de vista de quem usa: "Entrou", "Saiu",
"Sobrou", "Guardado", "A pagar em 30 dias", "Para onde foi o dinheiro".
Botões dizem o que fazem; erros dizem o que houve e o que fazer; tela vazia
convida a agir.

## Revisão contra os padrões genéricos

- *Referência 1 (faixa verde chapada + cartões iguais):* a faixa virou
  gradiente de tinta com o guilhochê como marca-d'água — só faz sentido para
  dinheiro; os cartões ganharam variação e tendência, não só o número.
- *Referência 2 (blocos em degradê arco-íris — roxo, verde, azul, laranja):*
  bonitos, mas cada cor sem significado. **Trocados** por blocos de cor suave
  onde a cor é a informação (carmim = a pagar, verde = a receber).
- *Rótulos em caixa alta espaçada ("TEMPO TOTAL DO DIA"):* **recusados**.
- *Fonte serifada Bodoni da versão anterior:* fazia sentido na "cédula";
  num painel administrativo vira enfeite. **Removida.**
- *Paleta genérica de SaaS (marinho + azul-elétrico):* o azul virou o
  petróleo da nota de R$ 100, e o verde/carmim seguem as cédulas.
