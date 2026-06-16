# GerminaStack Componentes

Kit de componentes em HTML, CSS e JavaScript vanilla derivado do `GerminaStack-Prototype`.

## Estrutura real do repositório

- `GerminaStack-Prototype/`
  Referência visual e funcional original. Não é a base de consumo do time.
- `assets/css/germinastack.css`
  Tokens, layout, responsividade e componentes visuais.
- `assets/js/germinastack.js`
  Runtime do kit. Liga tabs, menu, dismiss, toast, modal, accordion e demos interativas.
- `assets/js/docs.js`
  Comportamento auxiliar da documentação.
- `index.html`
  Documentação viva com exemplos e contratos de uso.
- `playground.html`
  Composição completa com cenários mais próximos de tela real.

## O que o kit cobre hoje

- hero, topbar, cards, sidebar e blocos de conteúdo
- botões, chips, badges e segmentado
- composer, inputs, textarea, select e comentário inline
- post, comentários, reply e menu contextual
- métricas, progresso, timeline, tabela, callout e empty state
- accordion, modal, toast, banner e alert
- pricing cards e blocos de showcase

## Bootstrap mínimo

```html
<link rel="stylesheet" href="./assets/css/germinastack.css" />
<script src="./assets/js/germinastack.js" defer></script>

<main class="gs-page">
  <section class="gs-card">Conteúdo</section>
</main>
```

## Fluxo recomendado para o time

1. Validar visualmente o componente ou layout em `playground.html`.
2. Consultar `index.html` para pegar markup, classes e contratos de comportamento.
3. Copiar o bloco necessário para a tela real.
4. Ajustar conteúdo, dados e tokens.
5. Criar JS específico do produto fora do kit quando a interação deixar de ser genérica.

## Convenções

- prefixo CSS: `gs-`
- prefixo de comportamento: `data-gs-*`
- customização preferencial: sobrescrever tokens, não duplicar componente
- regra de negócio: fora do kit
- responsividade: reduzir colunas antes de mexer em tipografia e spacing

## Contratos JS disponíveis

- `window.GerminaStackUI.init(root)`
  Inicializa um escopo novo quando markup é inserido dinamicamente.
- `window.GerminaStackUI.showToast({ title, message, tone, duration })`
  Dispara toast programaticamente.
- `window.GerminaStackUI.closeMenus()`
  Fecha todos os menus contextuais abertos.

## Receitas práticas

### Tela nova

1. Comece por `gs-page`.
2. Estruture com `gs-stack`, `gs-grid-2`, `gs-grid-3` ou `gs-grid-4`.
3. Use `gs-card`, `gs-side-card`, `gs-showcase-card` e `gs-post` como blocos principais.

### Dashboard

1. Abra com `gs-metric-grid`.
2. Adicione `gs-progress`, `gs-kpi-strip` e `gs-table`.
3. Se houver sequência temporal, encaixe `gs-timeline`.

### Interações

- tabs: `data-gs-tabs`, `data-gs-tab`, `data-gs-panel`
- menu: `data-gs-menu`, `data-gs-menu-trigger`, `data-gs-menu-panel`
- modal: `data-gs-modal-open`, `data-gs-modal`, `data-gs-modal-close`
- accordion: `data-gs-accordion-item`, `data-gs-accordion-trigger`, `data-gs-accordion-panel`
- feedback rápido: `data-gs-toast` ou `GerminaStackUI.showToast(...)`

## Checklist antes de entregar uma tela

- os tokens foram reaproveitados sem cor solta?
- existe um único CTA primário por área?
- o layout colapsa bem em mobile?
- estados de foco e hover continuam visíveis?
- a interação poderia ser resolvida por `data-gs-*` antes de criar JS novo?

## Histórico git desta entrega

- `967038f` `feat: scaffold GerminaStack UI kit foundation`
- `f99c400` `docs: add living documentation and playground`
- `590213f` `docs: add repository handoff guides`
- `39f85ff` `refactor: move UI kit to repository root`
