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
import { Button, Card, ui } from "germinastack-ui-components";

document.body.append(Card("Conteúdo"), Button({ label: "Continuar" }));
ui.showToast({ title: "Pronto", message: "Kit carregado." });
```

Se você escreve HTML direto, copie os arquivos para uma pasta pública e carregue os dois arquivos na página:

```html
<link rel="stylesheet" href="/static/vendor/germinastack/css/germinastack.css" />
<script src="/static/vendor/germinastack/js/germinastack.js" defer></script>
```

No `package.json` do projeto consumidor, automatize a cópia após instalar:

```json
{
  "scripts": {
    "postinstall": "node ./node_modules/germinastack-ui-components/scripts/copy-to-static.mjs ./static/vendor/germinastack"
  }
}
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

## 6. Carregue dados de uma API

Use o helper do kit para chamadas JSON. Ele transforma um objeto em JSON, aceita headers normais e lança erro quando a API responde com status de erro.

```js
async function carregarPosts() {
  const lista = document.querySelector("#posts");
  lista.setAttribute("aria-busy", "true");

  try {
    const posts = await window.GerminaStackUI.request("/api/posts", {
      headers: { Authorization: `Bearer ${token}` },
    });

    lista.replaceChildren(...posts.map((post) => {
      const item = document.createElement("article");
      const titulo = document.createElement("strong");
      const resumo = document.createElement("p");
      item.className = "gs-card";
      titulo.textContent = post.title;
      resumo.textContent = post.summary;
      item.append(titulo, resumo);
      return item;
    }));
  } catch (error) {
    window.GerminaStackUI.showToast({
      title: "Não foi possível carregar os posts",
      message: error.message,
      tone: "danger",
    });
  } finally {
    lista.removeAttribute("aria-busy");
  }
}
```

Use `textContent`, como no exemplo, para dados vindos de API. Não coloque texto externo direto em `innerHTML`.

Para enviar dados:

```js
const post = await window.GerminaStackUI.request("/api/posts", {
  method: "POST",
  body: { title: "Novo post", summary: "Conteúdo enviado pelo formulário" },
});
```

## 7. Ajuste cores sem copiar componentes

Coloque seus ajustes depois do stylesheet do kit:

```css
:root {
  --gs-navy: #17324d;
  --gs-orange: #d97706;
  --gs-page: #f8fafc;
}
```

Evite editar `node_modules`. Atualizações apagariam essas mudanças.

## 8. Facilite a leitura

Para textos longos, use o modo de leitura. Ele inclui a fonte OpenDyslexic no próprio pacote e aumenta o espaçamento entre letras, palavras e linhas:

```html
<article class="gs-readable">
  <h2>Texto mais confortável de ler</h2>
  <p>O conteúdo continua com a semântica normal da sua página.</p>
</article>
```

Escolha o espaçamento por bloco quando necessário:

```html
<article class="gs-readable" data-gs-letter-spacing="wide">...</article>
```

Use `normal` para remover somente o espaçamento extra de um elemento. Esses recursos são opcionais: deixe a escolha com quem está lendo.

## 9. Use um tema de produto opcional

O pacote também oferece temas de contraste que ficam separados do visual base. Importe `themes.css` depois de `styles.css` e aplique os atributos na raiz:

```js
import "germinastack-ui-components/styles.css";
import "germinastack-ui-components/themes.css";

document.documentElement.dataset.tema = "high_contrast";
document.documentElement.dataset.fonte = "atkinson_hyperlegible";
```

Os valores de tema são `normal`, `dark`, `high_contrast`, `black_yellow` e `yellow_black`.

## 10. Use o popover de notificações opcional (GerminaStack)

Assim como `themes.css`, `notifications.css` é um extra do produto GerminaStack, fora do
kit — só quem monta o popover de notificações do cabeçalho (classes `.gs-notif-*`)
precisa importar:

```js
import "germinastack-ui-components/styles.css";
import "germinastack-ui-components/notifications.css";
```

Ele reaproveita o menu contextual do kit (`.gs-menu` / `.gs-menu-trigger` /
`.gs-menu-panel`, o mesmo mecanismo usado por um botão de ações "⋮") e só ajusta largura
e rolagem do painel para caber frases inteiras em vez de itens de uma linha. Sem ele, o
popover ainda funciona, só que com o tamanho padrão do kit (240px, sem teto de altura).

## 11. Confira antes de entregar

1. Navegue pela tela usando somente `Tab`, `Enter`, `Space` e `Esc`.
2. Veja se todo campo tem um `<label>` ou `aria-label`.
3. Abra [index.html](../index.html) para exemplos completos.
4. Use [playground.html](../playground.html) para experimentar componentes sem mexer na aplicação.

## Acessibilidade obrigatória

O runtime valida automaticamente o conteúdo quando ele é carregado. Se encontrar um erro, destaca o elemento em vermelho e mostra a correção no console do navegador.

```html
<!-- Imagem informativa: descreva o conteúdo -->
<img src="grafico.png" alt="Matrículas cresceram 18% em junho" />

<!-- Imagem decorativa: declare alt vazio -->
<img src="enfeite.svg" alt="" />

<!-- Campo: associe um label ou use aria-label -->
<label for="email">Seu e-mail</label>
<input id="email" type="email" />

<!-- Botão só com ícone: dê um nome -->
<button type="button" aria-label="Fechar modal">×</button>
```

Você também pode validar um trecho criado depois:

```js
const erros = window.GerminaStackUI.validateAccessibility(document.querySelector("#conteudo-novo"));
console.log(erros); // elementos que ainda precisam de correção
```

## Para quem mantém esta biblioteca

Edite somente arquivos em `src/`, depois rode:

```bash
npm run build
npm run check
```

`dist/` é gerado automaticamente e é o único código que vai para o npm.
