# Portfólio Ivy Gabriel — Design

Data: 2026-10-12

## Objetivo

Portfólio pessoal novo, feito do zero, como vitrine de presença pessoal (sem meta de contratação). Foco em desenvolvimento e projetos. Bilíngue (PT + EN). Referência de estilo: cuberto.com, apenas como inspiração visual. Nenhum código, asset ou fonte do Cuberto é copiado.

## Critérios de sucesso

- Site estático publicado na Vercel ou Netlify, com deploy automático a cada push.
- Visual limpo e reconhecível: fundo branco, tipografia grande, pílulas pretas, painéis arredondados.
- PT e EN com o mesmo conteúdo, sem textos faltando.
- Troca de conteúdo de exemplo pelo conteúdo real editando apenas arquivos de dados.
- Lighthouse acima de 90 em desempenho e acessibilidade.

## Fora de escopo (YAGNI)

Blog, CMS, formulário com back-end, modo escuro, área de currículo para recrutadores.

## Stack

Astro (estático) + GSAP com ScrollTrigger. Fonte Instrument Sans (livre). Sem framework de UI.

## Estrutura

Página única por idioma, com rolagem:

- `/pt/` e `/en/`, com as mesmas seções.
- `/` redireciona para o idioma do navegador (`navigator.language`).

Seções, em ordem:

1. **Hero:** nome grande e centralizado, frase curta, botão preto em pílula para contato.
2. **Projetos:** cartões com painel de mídia de cantos arredondados; título, descrição de uma linha, tecnologias e link.
3. **Sobre:** foto, texto curto e links para redes.
4. **Contato:** e-mail em destaque com botão de copiar.

Navegação: barra fina no topo com âncoras e seletor PT/EN. Em telas pequenas, vira um botão simples.

## Conteúdo

Textos separados do código:

- `src/content/pt.json` e `src/content/en.json` para os textos das seções.
- `src/content/projects.ts` para os projetos, com campos por idioma.

O conteúdo inicial é de exemplo, claramente marcado, para ser trocado depois.

## Visual

- Cores: fundo `#fff`, texto `#0a0a0a`, cinza claro para linhas e painéis. Sem cor de destaque por enquanto.
- Fonte: Instrument Sans. Headline do hero entre 8vw e 12vw, peso médio, espaçamento apertado.
- Botões em pílula preta; no hover viram contorno.
- Painéis de mídia com raio de 24px; grade de 12 colunas; muito espaço em branco.
- Mobile primeiro; cartões empilham em telas pequenas.

## Animações (GSAP + ScrollTrigger)

- Hero: palavras sobem uma a uma na entrada.
- Cartões de projeto: fade com leve deslocamento ao rolar.
- Hover: zoom suave no painel de mídia e movimento da seta do link.
- Cursor customizado em círculo, só no desktop, fácil de desligar.
- `prefers-reduced-motion` desliga todas as animações.

## Idiomas (i18n)

- Roteamento nativo do Astro, com `/pt/` e `/en/`; cada página lê o JSON do seu idioma.
- O seletor PT/EN leva à mesma seção no outro idioma.
- `<html lang>` correto e `hreflang` cruzado em cada página.

## SEO e compartilhamento

Título, descrição e imagem Open Graph por idioma. Sitemap gerado automaticamente.

## Deploy

`astro build` gera arquivos estáticos em `dist/`. O repositório no GitHub é conectado à Vercel (ou Netlify); cada push publica o site.

## Testes e verificação

- Build: compila e gera as rotas `/pt/` e `/en/`.
- Conteúdo: `pt.json` e `en.json` têm exatamente as mesmas chaves.
- Manual no navegador: mobile e desktop, animações e `prefers-reduced-motion`.
- Lighthouse: desempenho e acessibilidade acima de 90.
