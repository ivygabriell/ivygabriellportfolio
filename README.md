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

1. `src/content/site.ts`: nome, e-mail, redes, vídeo do destaque; ponha `example: false`.
2. `src/content/pt.json` e `src/content/en.json`: textos (as chaves precisam ser iguais; `npm test` confere).
3. `src/content/projects/*.json`: um arquivo por projeto (3 a 4). Troque `example` por `false`, aponte `cover` e `shots` para suas imagens em `public/media/projects/<slug>/`. O nome do arquivo precisa ser igual ao `slug`. `palette` só alimenta o gerador de mídia de exemplo (`scripts/gen-mock-media.mjs`) e `link` ainda não é exibido em nenhuma página. Para um cartão de compartilhamento por projeto, use PNG/JPG (o `og:image` hoje é sempre `public/og-cover.png`).
4. Quando não houver mais conteúdo de exemplo (nem em `site.ts`, nem nos projetos), o `noindex` das páginas some sozinho.
5. Troque `public/og-cover.png` (rode `node scripts/gen-og.mjs` ou ponha sua imagem 1200×630).
6. A mídia de exemplo dos projetos é gerada por `node scripts/gen-mock-media.mjs`; ao trocar pelas suas imagens, não rode esse script de novo (ele sobrescreve os arquivos).

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
