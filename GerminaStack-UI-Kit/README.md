# GerminaStack UI Kit

Kit de componentes em HTML, CSS e JavaScript vanilla para montar telas do GerminaStack com consistencia visual e baixo acoplamento.

## Arquivos principais

- `index.html`: documentacao viva com exemplos e snippets
- `playground.html`: exemplo completo de composicao do feed
- `assets/css/germinastack.css`: tokens, base, layout e componentes
- `assets/js/germinastack.js`: tabs, menu, dismiss, toast e demos

## Integracao minima

```html
<link rel="stylesheet" href="./assets/css/germinastack.css" />
<script src="./assets/js/germinastack.js" defer></script>
```

## Mapa de componentes

- `gs-topbar`, `gs-brand`, `gs-nav-link`: cabecalho
- `gs-hero`: faixa principal
- `gs-card`, `gs-side-card`, `gs-post`: containers de interface
- `gs-btn-*`: botoes
- `gs-chip`, `gs-badge`: marcadores curtos
- `gs-tabs`, `gs-tab`, `gs-tab-panel`: navegacao interna
- `gs-input`, `gs-textarea`, `gs-input-shell`: formularios
- `gs-banner`, `gs-alert`, `gs-toast`: feedback visual
- `gs-menu`, `gs-menu-panel`, `gs-menu-item`: menu contextual

## Atributos JavaScript

- `data-gs-tabs`: raiz de tabs
- `data-gs-tab`: trigger de tab
- `data-gs-panel`: painel controlado por tab
- `data-gs-menu`: raiz de menu
- `data-gs-menu-trigger`: botao que abre o menu
- `data-gs-menu-panel`: conteudo do menu
- `data-gs-dismiss`: fecha o bloco com `data-gs-dismissible`
- `data-gs-toast`: dispara toast declarativo
- `data-gs-copy`: copia o texto de um seletor
- `data-gs-compose`: ativa o composer do playground

## Estrategia de customizacao

1. Sobrescreva tokens CSS em `:root`.
2. Reaproveite classes existentes antes de criar variantes novas.
3. Para novos comportamentos, siga o padrao `data-gs-*`.
4. Mantenha o kit sem dependencias externas.

## Fluxo recomendado para times

1. Validar layout e estilo em `playground.html`.
2. Copiar os blocos desejados da documentacao.
3. Compor a tela final em HTML estatico.
4. Adicionar apenas comportamentos especificos do produto fora do kit base.
