# GerminaStack Componentes

Kit de componentes em HTML, CSS e JavaScript vanilla derivado do `GerminaStack-Prototype`.

## Estrutura real do repositório

- `GerminaStack-Prototype/`
  Referência visual e funcional original. Não é a base de consumo do time.
- `assets/css/germinastack.css`
  Tokens, reset leve, layout, componentes e responsividade.
- `assets/js/germinastack.js`
  Runtime do kit. Liga tabs, menus, dismiss, toast, composer e interações simples.
- `assets/js/docs.js`
  Melhorias da página de documentação.
- `index.html`
  Documentação viva do kit.
- `playground.html`
  Página de composição completa para validar o comportamento dos componentes.

## Fluxo recomendado para o time

1. Validar visualmente o componente ou layout em `playground.html`.
2. Consultar `index.html` para pegar markup, classes e contratos de comportamento.
3. Copiar o bloco necessário para a tela real.
4. Ajustar apenas conteúdo, dados e tokens.
5. Criar JS específico do produto fora do kit quando a interação deixar de ser genérica.

## Bootstrap mínimo

```html
<link rel="stylesheet" href="./assets/css/germinastack.css" />
<script src="./assets/js/germinastack.js" defer></script>

<main class="gs-page">
  <section class="gs-card">Conteudo</section>
</main>
```

## O que já está pronto

- fundação visual com tokens centralizados em `:root`
- cabeçalho, hero, cards, posts, sidebar, badges e chips
- formulários base, composer, campo de comentário e estados de foco
- tabs declarativas com `data-gs-tabs`, `data-gs-tab` e `data-gs-panel`
- menu contextual com `data-gs-menu`, `data-gs-menu-trigger` e `data-gs-menu-panel`
- feedback com banner, alert, dismiss e toast
- playground funcional para testes rápidos sem plugin e sem build

## Convenções do kit

- prefixo CSS: `gs-`
- prefixo de comportamento: `data-gs-*`
- customização preferencial: sobrescrever tokens, não duplicar componentes
- responsividade: reduzir colunas antes de mexer em tipografia e espaçamento
- acoplamento: o kit cobre interface genérica; regra de negócio fica fora dele

## Contratos JS disponíveis

- `window.GerminaStackUI.init(root)`
  Inicializa um escopo novo quando markup é inserido dinamicamente.
- `window.GerminaStackUI.showToast({ title, message, tone, duration })`
  Dispara toast programaticamente.
- `window.GerminaStackUI.closeMenus()`
  Fecha todos os menus abertos.

## Receitas práticas

### Criar uma tela nova

1. Comece por `gs-page`.
2. Monte a estrutura com `gs-stack`, `gs-grid-2` ou `gs-grid-3`.
3. Use `gs-card`, `gs-side-card` e `gs-post` como blocos principais.
4. Aplique botões `gs-btn-*` e chips `gs-chip` para ação e contexto.

### Criar navegação interna por tabs

1. Envolva tudo com `data-gs-tabs`.
2. Marque cada botão com `data-gs-tab="id"`.
3. Marque cada painel com `data-gs-panel="id"`.
4. Deixe um botão inicial com `is-active`.

### Criar menu contextual

1. Envolva trigger e painel com `data-gs-menu`.
2. Use `data-gs-menu-trigger` no botão.
3. Use `data-gs-menu-panel` no dropdown.
4. O kit cuida de abrir, fechar e tratar clique fora.

### Exibir feedback rápido

- persistente na tela: `gs-banner` ou `gs-alert`
- dispensável: `data-gs-dismissible` + botão com `data-gs-dismiss`
- efêmero: `data-gs-toast` ou `GerminaStackUI.showToast(...)`

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
