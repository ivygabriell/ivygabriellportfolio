# Portfólio Ivy Gabriel

Site estático bilíngue (PT/EN) feito com Astro, GSAP e Lenis. Design e spec em `docs/superpowers/`.

Versões usadas: Astro 7.3.8, GSAP 3.15.0, Lenis 1.3.26, TypeScript 6.0.3 (o `astro check` ainda não aceita o 7), Vitest 5.0.4.

## Rodar

    npm install
    npm run dev        # http://localhost:4321
    npm test           # testes unitários
    npm run test:build # build + testes sobre dist/
    npm run check      # tipos

## Trocar o conteúdo de exemplo

1. `src/content/site.ts`: nome, e-mail, WhatsApp (só dígitos com DDI; aparece só dentro do link do botão), redes e vídeo do destaque. Mantenha `example: true` até aprovar os textos; ao virar `false`, o `noindex` some.
2. `src/content/pt.json` e `src/content/en.json`: todos os textos. As duas línguas precisam ter exatamente as mesmas chaves (`npm test` confere).
3. `src/content/projects/*.json`: um arquivo por projeto, com o nome igual ao `slug`. Enquanto a pasta estiver vazia, a seção Projetos mostra os cartões "Em breve" (`projects.soon` nos JSONs de texto); ao adicionar o primeiro projeto real, os cartões somem sozinhos. Aponte `cover` e `shots` para imagens em `public/media/projects/<slug>/`. `link` ainda não é exibido em nenhuma página. Para cartão de compartilhamento por projeto, use PNG/JPG (o `og:image` hoje é sempre `public/og-cover.png`).
4. Cores: edite os tokens em `src/styles/tokens.css` (`--c-accent` é o cobalto dos botões).
5. Troque `public/og-cover.png` (rode `node scripts/gen-og.mjs` ou ponha sua imagem 1200×630).
6. No deploy, defina `SITE_URL` e rode `npm test && npm run build`.

## Publicar (Vercel ou Netlify)

1. Suba o repositório no GitHub.
2. Importe o repositório na Vercel (ou Netlify): framework Astro, comando `npm test && npm run build` (assim um texto faltando em `en.json` ou um projeto inválido barra a publicação), pasta `dist`.
3. Defina a variável `SITE_URL` com o endereço final do site.
4. A cada push na branch principal o site é publicado.

## Como o movimento funciona

- `src/scripts/main.ts` liga e desliga tudo a cada página (necessário por causa do `ClientRouter`).
- `prefers-reduced-motion` desliga animações, Lenis, cursor e a transição de página.
- Cursor e Lenis só rodam com ponteiro fino e sem toque.
- Sem JavaScript todo o conteúdo continua visível.
