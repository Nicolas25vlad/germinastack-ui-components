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
- **select/combobox** com busca, grupos e navegação por teclado
- **date picker / date range picker** com calendário acessível
- **data table** com ordenação, filtro, paginação e seleção de linhas
- **tooltip / popover** com posicionamento automático e conteúdo rico

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
  Inicializa um escopo novo quando markup é inserido dinamicamente (tabs, menus, toasts, dismiss, accordion, selects, datepickers, datatables, tooltips).
- `window.GerminaStackUI.showToast({ title, message, tone, duration })`
  Dispara toast programaticamente.
- `window.GerminaStackUI.closeMenus()`
  Fecha todos os menus contextuais abertos.
- `window.GerminaStackUI.openModal(modalEl)`
  Abre modal com armadilha de foco e anúncio.
- `window.GerminaStackUI.closeModal(modalEl)`
  Fecha modal com restauração de foco.
- `window.GerminaStackUI.activateTab(tabBtn)`
  Ativa uma tab programaticamente.
- `window.GerminaStackUI.toggleAccordion(triggerBtn)`
  Alterna accordion com anúncio para leitor de tela.
- `window.GerminaStackUI.announceToScreenReader(message, priority)`
  Anuncia mensagem via região ao vivo (`"polite"` | `"assertive"`).
- `window.GerminaStackUI.trapFocus(element)`
  Ativa armadilha de foco em um elemento (usado internamente por modais).
- `window.GerminaStackUI.initSelects(root)`
  Inicializa selects/combobox com busca, grupos e navegação por teclado.
- `window.GerminaStackUI.initDatePickers(root)`
  Inicializa date pickers e range pickers com calendário acessível.
- `window.GerminaStackUI.initDataTables(root)`
  Inicializa data tables com ordenação, filtro, paginação e seleção.
- `window.GerminaStackUI.initTooltips(root)`
  Inicializa tooltips e popovers com posicionamento automático.

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
- select/combobox: `data-gs-select`, `data-gs-select-search`, `data-gs-select-placeholder`, `data-gs-select-multiple`
- date picker: `data-gs-datepicker`, `data-gs-datepicker-range`, `data-gs-datepicker-placeholder`
- data table: `data-gs-datatable`, `data-gs-datatable-sort`, `data-gs-datatable-filter`, `data-gs-datatable-paginate`, `data-gs-datatable-page-size`
- tooltip: `data-gs-tooltip`, `data-gs-tooltip-content`, `data-gs-tooltip-placement`
- popover: `data-gs-popover`, `data-gs-popover-trigger`, `data-gs-popover-title`, `data-gs-popover-content`

## Novos componentes (v1.2)

### Select / Combobox

```html
<div class="gs-select" data-gs-select data-gs-select-search data-gs-select-placeholder="Selecione...">
  <button class="gs-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
    <span class="gs-select-value">Selecione...</span>
    <span class="gs-select-icon" aria-hidden="true">▼</span>
  </button>
  <div class="gs-select-panel" role="listbox" hidden>
    <div class="gs-select-search"><input type="text" placeholder="Buscar..." aria-label="Filtrar opções" /></div>
    <div class="gs-select-group">
      <span class="gs-select-group-label">Grupo</span>
      <div class="gs-select-option" role="option" data-value="1" aria-selected="false">Opção 1</div>
      <div class="gs-select-option" role="option" data-value="2" aria-selected="false">Opção 2</div>
    </div>
  </div>
</div>
```

**Atributos**: `data-gs-select` (raiz), `data-gs-select-search` (habilita busca), `data-gs-select-placeholder`, `data-gs-select-multiple` (seleção múltipla)

**Teclado**: `Enter`/`Space` abre, `↑↓` navega, `Esc` fecha, digita para filtrar, `Home`/`End` primeiro/último

**Acessibilidade**: `role="listbox"`, `role="option"`, `aria-selected`, `aria-controls`, `aria-expanded`, busca anuncia resultados via `aria-live`

---

### Date Picker / Date Range Picker

```html
<div class="gs-datepicker" data-gs-datepicker data-gs-datepicker-placeholder="Selecione uma data">
  <button class="gs-datepicker-trigger" type="button" aria-haspopup="dialog" aria-expanded="false">
    <span class="gs-datepicker-value">Selecione uma data</span>
    <span class="gs-datepicker-icon" aria-hidden="true">📅</span>
  </button>
  <div class="gs-datepicker-panel" role="dialog" aria-modal="true" aria-label="Selecionar data" hidden>
    <div class="gs-datepicker-header">
      <button class="gs-datepicker-nav" type="button" aria-label="Mês anterior">‹</button>
      <span class="gs-datepicker-title">Janeiro 2025</span>
      <button class="gs-datepicker-nav" type="button" aria-label="Próximo mês">›</button>
    </div>
    <div class="gs-datepicker-grid" role="grid" aria-label="Dias do mês">
      <div class="gs-datepicker-weekday" role="columnheader">Dom</div>
      <!-- ... dias da semana ... -->
      <div class="gs-datepicker-day" role="gridcell" aria-selected="false" tabindex="-1">1</div>
      <!-- ... dias do mês ... -->
    </div>
  </div>
</div>
```

**Atributos**: `data-gs-datepicker` (raiz), `data-gs-datepicker-range` (seleção de intervalo), `data-gs-datepicker-placeholder`

**Teclado**: `Enter` abre, setas navegam dias, `PgUp`/`PgDn` muda mês, `Home`/`End` primeira/última semana, `Esc` fecha

**Acessibilidade**: `role="dialog"`, `aria-modal="true"`, `role="grid"`, `role="gridcell"`, `aria-selected`, navegação por grade 2D

---

### Data Table

```html
<div class="gs-datatable" data-gs-datatable data-gs-datatable-sort data-gs-datatable-filter data-gs-datatable-paginate data-gs-datatable-page-size="10">
  <div class="gs-datatable-toolbar">
    <input type="text" class="gs-datatable-filter-input" placeholder="Filtrar..." aria-label="Filtrar linhas" />
    <div class="gs-datatable-info" aria-live="polite"></div>
  </div>
  <div class="gs-datatable-wrap">
    <table class="gs-table">
      <thead>
        <tr>
          <th scope="col" data-gs-sort="string">Nome</th>
          <th scope="col" data-gs-sort="number">Valor</th>
          <th scope="col" data-gs-sort="date">Data</th>
          <th scope="col"><input type="checkbox" class="gs-datatable-select-all" aria-label="Selecionar todas" /></th>
        </tr>
      </thead>
      <tbody>
        <tr data-gs-row>
          <td>Item 1</td>
          <td>100</td>
          <td>2025-01-15</td>
          <td><input type="checkbox" class="gs-datatable-row-select" /></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="gs-datatable-pagination" aria-label="Paginação">
    <button class="gs-datatable-page-btn" type="button" aria-label="Primeira página" disabled>««</button>
    <button class="gs-datatable-page-btn" type="button" aria-label="Página anterior" disabled>«</button>
    <span class="gs-datatable-page-info">Página 1 de 5</span>
    <button class="gs-datatable-page-btn" type="button" aria-label="Próxima página">»</button>
    <button class="gs-datatable-page-btn" type="button" aria-label="Última página">»»</button>
  </div>
</div>
```

**Atributos**: `data-gs-datatable` (raiz), `data-gs-datatable-sort`, `data-gs-datatable-filter`, `data-gs-datatable-paginate`, `data-gs-datatable-page-size`

**Colunas**: `data-gs-sort="string|number|date"` no `<th>`

**Teclado**: `Tab` navega células, `Enter`/`Space` ordena (cabeçalho), `Space` seleciona linha (checkbox)

**Acessibilidade**: `scope="col"`, `aria-sort` no cabeçalho ativo, `aria-live` no contador, checkboxes com `aria-label`

---

### Tooltip / Popover

```html
<!-- Tooltip -->
<button class="gs-btn gs-btn-secondary" type="button" 
        data-gs-tooltip 
        data-gs-tooltip-content="Dica contextual" 
        data-gs-tooltip-placement="top">
  Passe o mouse
</button>

<!-- Popover -->
<button class="gs-btn gs-btn-primary" type="button" 
        data-gs-popover 
        data-gs-popover-trigger="click" 
        data-gs-popover-title="Ações" 
        data-gs-popover-content="<button class='gs-btn gs-btn-sm'>Editar</button>">
  Clique para ver
</button>
```

**Tooltip atributos**: `data-gs-tooltip`, `data-gs-tooltip-content`, `data-gs-tooltip-placement` (`top|right|bottom|left`)

**Popover atributos**: `data-gs-popover`, `data-gs-popover-trigger` (`hover|click`), `data-gs-popover-title`, `data-gs-popover-content` (suporta HTML)

**Teclado**: `Esc` fecha, foco move para popover ao abrir (trigger=click)

**Acessibilidade**: `role="tooltip"` para tooltip, `role="dialog"` para popover, `aria-describedby` no trigger, posicionamento com `Floating UI` logic (viewport clamping, flip, shift)

---

## Checklist antes de entregar uma tela

- os tokens foram reaproveitados sem cor solta?
- existe um único CTA primário por área?
- o layout colapsa bem em mobile?
- estados de foco e hover continuam visíveis?
- a interação poderia ser resolvida por `data-gs-*` antes de criar JS novo?

## Acessibilidade (WCAG 2.1 AA)

O kit implementa recursos de acessibilidade nativos. Antes de entregar, valide:

### Checklist de acessibilidade

- [ ] **Navegação por teclado**: Toda funcionalidade acessível via `Tab`, `Shift+Tab`, setas`, setas, `Enter`, `Space`, `Esc`
- [ ] **Foco visível**: Anel de foco (`--gs-focus-ring-width`, `--gs-focus-ring-color`) visível em todos os elementos interativos
- [ ] **Armadilha de foco em modais**: `Tab`/`Shift+Tab` cicla dentro do modal; foco restaura ao fechar
- [ ] **Regiões ao vivo**: Toasts, accordion e modal anunciam mudanças via `aria-live`
- [ ] **ARIA automático**: Tabs (`role="tablist/tab/tabpanel"`), Accordion (`aria-expanded`, `aria-controls`), Menu (`aria-expanded`, `aria-haspopup`)
- [ ] **Contraste**: Tokens principais atendem AA (4.5:1) — veja tabela abaixo
- [ ] **Alto contraste**: `prefers-contrast: high` mantém bordas, foco e estados visíveis
- [ ] **Cores forçadas**: `forced-colors: active` usa cores do sistema sem quebrar UI
- [ ] **Redução de movimento**: `prefers-reduced-motion: reduce` elimina animações/transições
- [ ] **Zoom 200%**: Layout funcional sem scroll horizontal
- [ ] **Labels**: Todo input tem `<label>` explícita; ícones decorativos têm `aria-hidden="true"`

### Tabela de contraste dos tokens principais

| Token | Cor | Fundo | Contraste | WCAG |
|-------|-----|-------|-----------|------|
| `--gs-color-navy-900` | `#0a1929` | `#fff` | 18.2:1 | ✅ AAA |
| `--gs-color-navy-700` | `#1a3a5c` | `#fff` | 10.4:1 | ✅ AAA |
| `--gs-color-text` | `#0a1929` | `#f0f2f5` | 17.1:1 | ✅ AAA |
| `--gs-color-text-secondary` | `#546e7a` | `#f0f2f5` | 5.2:1 | ✅ AA |
| `--gs-color-primary` | `#ff8c00` | `#fff` | 3.0:1 | ⚠️ Apenas texto grande (≥18pt/14pt bold) |

### Testes manuais recomendados

1. **Teclado**: Navegue toda a interface sem mouse
2. **Leitor de tela**: NVDA (Windows) ou VoiceOver (macOS) — verifique anúncios de tabs, accordion, modal, toasts
3. **Alto contraste**: DevTools → Rendering → Emule `prefers-contrast: high` e `forced-colors: active`
4. **Redução de movimento**: DevTools → Rendering → Emule `prefers-reduced-motion: reduce`
5. **Zoom**: Amplie a 200% — sem scroll horizontal

### Diretrizes de contribuição para acessibilidade

- **Novos componentes**: Devem incluir `role` apropriado, `aria-*` necessários e navegação por teclado
- **Novos tokens de cor**: Validar contraste AA (4.5:1 texto normal, 3:1 texto grande) antes de merge
- **Animações**: Respeitar `prefers-reduced-motion` — use `transition: none !important` no media query
- **Foco**: Nunca remova `outline` sem substituir por `:focus-visible` com anel visível
- **Testes**: Rode checklist acima em PRs que tocam componentes interativos

## Histórico git desta entrega

- `967038f` `feat: scaffold GerminaStack UI kit foundation`
- `f99c400` `docs: add living documentation and playground`
- `590213f` `docs: add repository handoff guides`
- `39f85ff` `refactor: move UI kit to repository root`
- `a11y` `feat: WCAG 2.1 AA accessibility enhancements (focus trap, live regions, keyboard nav, high contrast, reduced motion)`
- `v1.2` `feat: add Select/Combobox, DatePicker/RangePicker, DataTable, Tooltip/Popover components with full accessibility`
