# Portfólio Ivy Gabriel — Design

Data: 2026-10-12 (revisão 2: Cuberto como base principal, após análise com REA)

## Objetivo

Portfólio pessoal novo, feito do zero, como vitrine de presença pessoal (sem meta de contratação). Foco em desenvolvimento e projetos. Bilíngue (PT + EN).

**Referência principal: cuberto.com.** O site segue a mesma linguagem visual, a mesma ordem de seções e o mesmo tipo de interação, adaptados a uma pessoa em vez de uma agência. Todo código, texto, imagem e fonte é próprio: o Cuberto é referência de design, não fonte de arquivos.

## Critérios de sucesso

- Quem conhece o Cuberto reconhece o estilo ao abrir o site; quem não conhece vê um site coeso e original.
- Site estático publicado na Vercel ou Netlify, com deploy automático a cada push.
- PT e EN com o mesmo conteúdo, sem textos faltando.
- Troca do conteúdo de exemplo pelo real editando apenas arquivos de dados.
- Lighthouse acima de 90 em desempenho e acessibilidade.

## Análise do Cuberto (REA)

Feita em 2026-10-12, carregando https://cuberto.com/ num Chrome headless de perfil temporário, só leitura (sem login e sem interação além de abrir a página). Contém o que foi observado e, separado, o que é inferência. Não foram guardados arquivos do site no repositório.

**Observado**
- Stack: Astro, com `ClientRouter` (transições entre páginas) e `prefetch`; GSAP e ScrollTrigger; scripts por componente (`RoundButton`, `ShowreelModal`).
- Fonte: Suisse Intl (regular e medium). É comercial e não será usada.
- Topbar: logo à esquerda; links (Services, Projects, About, Blog) e um botão preto em pílula "Contacts" à direita.
- Seções, na ordem: Tophead (h1 grande centralizado + subtítulo), Preview (showreel em painel arredondado, com vídeo e modal), Overview ("What we do"), Features (lista de serviços, cada um com link "Explore"), Logoreel (marcas), Selected work (seção invertida, escura), Testimonials, Why (números), Insights (blog, 3 posts), FAQ (acordeão, seção invertida), Outro (chamada final para contato), Footer.
- Cores no CSS: quase só `#fff` e `#000`, com alguns tons pastel pontuais e cinzas translúcidos.
- Raios: 1.6rem a 2.5rem em cartões e painéis; `99999px` e `50%` em botões; `8rem 8rem 0 0` em painéis de topo arredondado.
- Easing: `cubic-bezier(.16,1,.3,1)` é o principal (transições de 0.8s em `transform`); `cubic-bezier(.34,4.56,.64,1)` (elástico) em botões; `grid-template-rows` com 1.2s no acordeão; transições de `opacity` e `color` de 0.2s a 0.6s.
- Texto do hero e do showreel com efeito de curvatura (texto em arco) no painel de destaque.
- Mídia em WebP e vídeo MP4 curto para o showreel.

**Inferido (não confirmado por execução)**
- O tamanho de fonte da raiz usa `vw`, então o layout escala de forma fluida com a largura da tela (há `font-size` em `vw` no CSS).
- Seções "inverse" alternam fundo claro e escuro durante a rolagem para dar ritmo.

**Não verificado**
- Detalhes finos de cada animação do GSAP (durações e gatilhos de ScrollTrigger); serão definidos por observação visual e ajustados no navegador.
- Comportamento em mobile.

## Mapeamento Cuberto → portfólio

| Seção do Cuberto | No portfólio | Observação |
|---|---|---|
| Topbar com pílula "Contacts" | Topbar com logo (seu nome), links, seletor PT/EN e pílula "Contato" | igual |
| Tophead (h1 + subtítulo) | Hero: seu nome ou frase em destaque + subtítulo | igual |
| Preview / showreel | Painel de destaque: vídeo curto ou demo de projeto, com modal | igual; conteúdo de exemplo até haver vídeo seu |
| Overview "What we do" | "Sobre" curto | adaptado |
| Features (serviços) | "O que eu faço": áreas de atuação, cada uma com link | adaptado |
| Logoreel (marcas) | Faixa de tecnologias e ferramentas | adaptado: sem clientes, mostra stack |
| Selected work (escura) | "Projetos": cartões grandes em seção escura, com página de cada projeto | igual |
| Testimonials | fora do escopo | sem clientes por enquanto |
| Why / números | "Em números": 3 ou 4 números reais seus | opcional, só se houver números reais |
| Insights / blog | fora do escopo | pode virar "Notas" depois |
| FAQ | fora do escopo | pode ser reaproveitado como "Perguntas rápidas" depois |
| Outro (chamada final) | "Vamos conversar": chamada final com e-mail e botão de copiar | igual |
| Footer | Footer com redes e seletor de idioma | igual |

## Fora de escopo (YAGNI)

Blog, CMS, formulário com back-end, depoimentos, FAQ, tema claro/escuro alternável pelo usuário, área de currículo para recrutadores.

## Stack

Astro (estático) com `ClientRouter` para transições entre páginas + GSAP com ScrollTrigger. Fonte Instrument Sans (livre; alternativa: Inter Tight), peso regular e medium como no original. Sem framework de UI.

## Estrutura e páginas

- `/pt/` e `/en/`: home com as seções, na ordem do mapeamento acima.
- `/pt/projetos/[slug]` e `/en/projects/[slug]`: página de cada projeto, aberta com transição de página.
- `/` redireciona para o idioma do navegador (`navigator.language`).

Mudança em relação à revisão 1: deixa de ser página única e passa a ter páginas de projeto, como no Cuberto.

## Conteúdo

Textos separados do código:

- `src/content/pt.json` e `src/content/en.json` para os textos das seções.
- `src/content/projects/*` (um arquivo por projeto), com campos por idioma.

O conteúdo inicial é de exemplo, claramente marcado, para ser trocado depois.

## Visual

- Fundo branco, texto preto; seções "inverse" com fundo preto e texto branco. Cinzas translúcidos para linhas e painéis. Sem cor de destaque no início; tons pastel só em painéis de mídia se houver necessidade.
- Tipografia grande no hero (escala fluida com a largura da tela), peso medium, espaçamento apertado; textos de apoio em regular.
- Botões em pílula preta; no hover o preenchimento se move com a curva elástica do botão.
- Painéis de mídia e cartões com raio de 1.6 a 2.5rem.
- Escala fluida: tamanho de fonte da raiz proporcional à largura da tela em desktop, com limites mínimo e máximo; layout próprio para mobile.

## Animações (GSAP + ScrollTrigger)

Tempos e curvas partem do que foi medido no CSS do Cuberto e são ajustados no navegador:

- Easing padrão `cubic-bezier(.16,1,.3,1)` em transições de `transform` (cerca de 0.8s); curva elástica nos botões; `opacity` e `color` entre 0.2s e 0.6s.
- Hero: texto entra palavra por palavra.
- Showreel: painel arredondado que cresce ao rolar; clique abre modal com vídeo; texto em arco como detalhe.
- Seções de projetos: cartões aparecem com fade e deslocamento; hover com zoom suave na mídia.
- Seções alternam claro e escuro conforme a rolagem.
- Acordeões e menus usam transição de `grid-template-rows` (se algum for usado).
- Transições entre páginas com `ClientRouter` do Astro.
- `prefers-reduced-motion` desliga as animações.

## Idiomas (i18n)

- Roteamento nativo do Astro, com `/pt/` e `/en/`; cada página lê o JSON do seu idioma.
- O seletor PT/EN leva à mesma página ou seção no outro idioma.
- `<html lang>` correto e `hreflang` cruzado em cada página.

## SEO e compartilhamento

Título, descrição e imagem Open Graph por idioma e por projeto. Sitemap gerado automaticamente.

## Deploy

`astro build` gera arquivos estáticos em `dist/`. O repositório no GitHub é conectado à Vercel (ou Netlify); cada push publica o site.

## Testes e verificação

- Build: compila e gera as rotas `/pt/`, `/en/` e as páginas de projeto nos dois idiomas.
- Conteúdo: `pt.json` e `en.json` têm exatamente as mesmas chaves; todo projeto tem os dois idiomas.
- Manual no navegador: mobile e desktop, animações, transições de página e `prefers-reduced-motion`.
- Comparação visual lado a lado com o Cuberto (apenas para conferir ritmo e proporções).
- Lighthouse: desempenho e acessibilidade acima de 90.
