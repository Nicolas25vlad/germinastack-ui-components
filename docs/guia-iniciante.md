# Guia para começar do zero

Este pacote serve para montar telas com HTML, CSS e um pouco de JavaScript. Você não precisa usar React, Vue ou aprender um framework para começar.

## 1. Instale o pacote

No terminal do seu projeto, rode:

```bash
npm install germinastack-ui-components
```

Isso baixa os estilos e as interações prontas (modal, tabs, toast e outros componentes).

## 2. Carregue o kit uma vez

Se o seu projeto usa Vite, React, Vue ou outro bundler, coloque isto no arquivo que inicia a aplicação:

```js
import "germinastack-ui-components/styles.css";
import "germinastack-ui-components";
```

Se você escreve HTML direto, carregue os dois arquivos na página:

```html
<link rel="stylesheet" href="./node_modules/germinastack-ui-components/dist/css/germinastack.css" />
<script src="./node_modules/germinastack-ui-components/dist/js/germinastack.js" defer></script>
```

Use um servidor local para abrir a página. Abrir o HTML com dois cliques (`file://`) pode impedir o navegador de acessar arquivos instalados.

## 3. Crie a primeira tela

Cole este bloco dentro do `<body>`. As classes começam com `gs-` e definem o visual.

```html
<main class="gs-page">
  <section class="gs-card gs-stack">
    <span class="gs-kicker">Primeiro passo</span>
    <h1>Olá, GerminaStack</h1>
    <p>Este card já vem com espaçamento, borda e responsividade.</p>
    <button class="gs-btn gs-btn-primary" type="button">Continuar</button>
  </section>
</main>
```

Regra simples: use `<button>` para executar uma ação e `<a>` para navegar para outra página.

## 4. Adicione uma interação pronta

Para mostrar uma confirmação, use um toast. Não precisa criar JavaScript:

```html
<button
  class="gs-btn gs-btn-primary"
  type="button"
  data-gs-toast
  data-gs-toast-title="Salvo"
  data-gs-toast-message="Suas alterações foram guardadas."
  data-gs-toast-tone="success"
>
  Salvar
</button>
```

Para interações mais específicas, use a API global:

```js
window.GerminaStackUI.showToast({
  title: "Salvo",
  message: "Suas alterações foram guardadas.",
  tone: "success",
});
```

## 5. Use componentes interativos declarativos

O comportamento é ativado por atributos `data-gs-*`. Por exemplo, estas tabs funcionam depois que o runtime é carregado:

```html
<section data-gs-tabs>
  <div class="gs-tabs" role="tablist" aria-label="Conteúdo">
    <button class="gs-tab is-active" type="button" data-gs-tab="resumo">Resumo</button>
    <button class="gs-tab" type="button" data-gs-tab="detalhes">Detalhes</button>
  </div>

  <div class="gs-card" data-gs-panel="resumo">Visão geral.</div>
  <div class="gs-card" data-gs-panel="detalhes" hidden>Mais informações.</div>
</section>
```

Quando adicionar HTML depois que a página já carregou, inicialize apenas o trecho novo:

```js
window.GerminaStackUI.init(document.querySelector("#conteudo-novo"));
```

## 6. Ajuste cores sem copiar componentes

Coloque seus ajustes depois do stylesheet do kit:

```css
:root {
  --gs-navy: #17324d;
  --gs-orange: #d97706;
  --gs-page: #f8fafc;
}
```

Evite editar `node_modules`. Atualizações apagariam essas mudanças.

## 7. Confira antes de entregar

1. Navegue pela tela usando somente `Tab`, `Enter`, `Space` e `Esc`.
2. Veja se todo campo tem um `<label>` ou `aria-label`.
3. Abra [index.html](../index.html) para exemplos completos.
4. Use [playground.html](../playground.html) para experimentar componentes sem mexer na aplicação.

## Para quem mantém esta biblioteca

Edite somente arquivos em `src/`, depois rode:

```bash
npm run build
npm run check
```

`dist/` é gerado automaticamente e é o único código que vai para o npm.
