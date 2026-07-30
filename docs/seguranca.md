# Segurança antes de produção

Este pacote protege o que controla no navegador: popovers e tooltips são renderizados como texto, e os exemplos usam `textContent` para dados externos. Isso reduz XSS, mas uma biblioteca de interface não substitui a segurança do servidor.

## Dados vindos de API

- Renderize texto externo com `textContent`, nunca com `innerHTML`.
- Valide todos os dados no backend; a validação visual do navegador não é uma barreira de segurança.
- Não coloque senha, chave privada, token de serviço ou segredo no JavaScript, HTML ou repositório.
- O helper `GerminaStackUI.request()` não adiciona autenticação por conta própria. Envie somente tokens temporários e com escopo mínimo quando necessário.

## Sessão e autenticação

Prefira sessão em cookie `HttpOnly`, `Secure` e `SameSite=Lax` ou `Strict`. JavaScript não consegue ler um cookie `HttpOnly`, o que reduz o impacto de XSS. Proteja requisições que alteram dados contra CSRF no backend.

Autorização deve ser verificada em cada endpoint. Esconder um botão não impede alguém de chamar a API diretamente.

## Cabeçalhos do servidor

Configure estas proteções no servidor ou proxy. Ajuste domínios da API, imagens e fontes ao seu ambiente:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://api.seudominio.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Use HTTPS em produção. Não copie uma CSP sem ajustar `connect-src` e outros domínios que sua aplicação realmente usa.

## Checklist de entrega

1. API só responde por HTTPS e valida autenticação/autorização no servidor.
2. Tokens e segredos não aparecem no frontend, Git ou logs.
3. Dados externos usam `textContent` ou uma sanitização revisada.
4. CSP e os cabeçalhos acima estão configurados no ambiente de produção.
5. Dependências, runtime Node e servidor recebem atualizações de segurança.
