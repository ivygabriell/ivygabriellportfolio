# Portfólio Ivy Gabriel — Design

Data: 2026-10-12 (revisão 3: análise completa do Cuberto)

## Objetivo

Portfólio pessoal novo, feito do zero, como vitrine de presença pessoal (sem meta de contratação). Foco em desenvolvimento e projetos. Bilíngue (PT + EN).

**Referência principal: cuberto.com.** O site segue a mesma linguagem visual, a mesma ordem de seções, o mesmo sistema de animação e as mesmas interações, adaptados a uma pessoa em vez de uma agência. Todo código, texto, imagem e fonte é próprio. O Cuberto é referência de design, não fonte de arquivos. Bibliotecas livres (GSAP, Lenis, Astro) podem ser usadas normalmente.

## Critérios de sucesso

- Quem conhece o Cuberto reconhece o estilo e o "toque" ao abrir o site (rolagem suave, cursor, revelações de texto); quem não conhece vê um site coeso e original.
- Site estático publicado na Vercel ou Netlify, com deploy automático a cada push.
- PT e EN com o mesmo conteúdo, sem textos faltando.
- Troca do conteúdo de exemplo pelo real editando apenas arquivos de dados.
- Lighthouse acima de 90 em desempenho e acessibilidade.

## Análise do Cuberto

Feita em 2026-10-12 sobre https://cuberto.com/ (home, uma página de projeto, About e uma página de serviço). Método:

- Captura da home com o REA (provider Playwright, Chromium, perfil temporário, só leitura).
- Leitura dos scripts e CSS públicos que a página carrega, para entender o comportamento de cada componente.
- Chrome próprio controlado por DevTools (perfil temporário) para rolar a página em passos, medir estilos reais, simular hover e emular mobile (390×844).

Nenhum arquivo do site foi guardado no repositório. As capturas e os scripts baixados ficaram só em pasta temporária.

### Arquitetura (observado)

- Astro, com `ClientRouter` (transições entre páginas) e prefetch ao passar o mouse.
- GSAP + ScrollTrigger + SplitText (v3.15), e Lenis para rolagem suave.
- Cada seção é um componente com um script próprio (`PreviewSection`, `FeatureSection`, `SummarySection`, `OverviewSection`, `LogoreelSection`, `FaqSection`, `OutroSection`, `Navbar`, `Cursor`, `Loader`, `Divider`, `Card`, `RoundButton`, `ShowreelModal`). Os componentes compartilham helpers de animação.
- Páginas do site: `/`, `/projects/`, `/projects/[slug]/` (10 projetos), `/about/`, `/services/` (+ 3 serviços), `/blog/` (+ posts), `/contacts/`, `/privacy/`.
- Metadados: `title`, `description`, `og:*`, `twitter:summary_large_image`, imagem `/cover.png`.

### Sistema visual (medido a 1440px de largura)

- **Escala fluida:** o `rem` é proporcional à largura da tela. Desktop: `1rem = 0.625vw` (10px a 1600px; 8,9px a 1440px). Mobile (até 767px): `1rem = 2.667vw` (10px a 375px). Todo o resto é em `rem`, então o layout inteiro escala junto.
- **Cores:** fundo `#fff`, texto `#000`. Seções invertidas: fundo preto e texto branco. Cartões pastel: menta `#e3f5f3` e lavanda `#f1f3fa`. Linhas e textos secundários em preto ou branco translúcido. Sem cor de destaque.
- **Fonte:** Suisse Intl (comercial, não será usada), pesos 400 e 500.
- **Hero (h1):** 9rem, peso 500, entrelinha 1, espaçamento de letras −0,01em, centralizado no desktop; 4,5rem e alinhado à esquerda no mobile. Subtítulo de 2,4rem.
- **Botão pílula:** raio total, preto com texto branco, altura de 5,8rem, padding horizontal de 2,8rem, fonte de 2rem. No mobile fica com 4rem de altura.
- **Raios:** painéis e cartões entre 1.6rem e 2.5rem; seção "Insights" com cantos superiores de 8rem; botões e ícones sociais em pílula ou círculo.
- **Container:** conteúdo da topbar e do hero alinhado a ~12rem das bordas; seções de texto em uma coluna estreita (~24rem de margem lateral); painéis de mídia ocupam a largura do container maior.
- **Topbar:** logo à esquerda; links e pílula "Contacts" à direita; o link da página atual fica sublinhado. É fixa, some ao rolar para baixo e volta ao rolar para cima. No mobile vira uma barra arredondada com botão de menu (hambúrguer).
- **Footer:** e-mail e telefone em pílulas com contorno, endereços, links em duas colunas e ícones sociais em círculos.

### Estrutura da home (observado, nesta ordem)

1. **Tophead:** h1 grande centralizado + subtítulo.
2. **Preview (showreel):** painel largo de cantos arredondados com vídeo (grade de peças inclinadas, em 3D). Clique abre um modal com vídeo.
3. **Overview "What we do":** rótulo pequeno em caixa-alta à esquerda e parágrafo grande à direita.
4. **Features:** cinco cartões pretos empilhados, com número (01 a 05), título, texto, link "Explore" e uma arte abstrata em gradiente roxo/índigo ao fundo.
5. **Logoreel:** título e grade de 4 colunas de logos de clientes, cada logo é um link.
6. **Selected work (invertida):** fundo preto; duas colunas com a coluna da direita deslocada para baixo; imagem arredondada com legenda de uma linha embaixo; cada item é um link.
7. **Testimonials.**
8. **Why:** texto com números (15+ anos etc.) em cartões pastel com contadores e ícones.
9. **Insights (invertida, cantos superiores muito arredondados):** título, botão contornado "Visit blog" e 3 cartões de posts.
10. **FAQ (invertida):** acordeão.
11. **Outro:** chamada final sobre fundo escuro com gradiente e formas concêntricas, botão branco "Get in touch".
12. **Footer.**

Altura total: ~13.000px no desktop e ~17.900px no mobile.

### Página de projeto (observado)

Topbar → Tophead (nome do cliente em rótulo pequeno + h1 à esquerda) → Preview (mídia larga) → Overview "The challenge" → Preview → Overview "Product overview" → **Splitshow** (grade de duas colunas deslocadas com imagens e legendas, o mesmo padrão de "Selected work") → blocos alternados de Overview, Preview e Splitshow (as seções de grade têm 2.000 a 2.600px) → Feedback do cliente → Nextcase (próximo projeto) → Footer.

### Animações e interações (observado no código)

**Cursor customizado ("follower").** Só em dispositivos com ponteiro fino. Círculo que segue o mouse com atraso (velocidade 0,5) e deformação por velocidade (skewing 1,5). Usa `mix-blend-mode: exclusion`. Muda de estado conforme `data-cursor-icon` do elemento sob o mouse: `play` no showreel, `arrow-up-right` em cartões e logos, `times` no modal. Também suporta texto, imagem e vídeo dentro do cursor. É removido ao trocar de página.

**Rolagem suave (Lenis).** Opções padrão, só em dispositivos sem toque, movido pelo ticker do GSAP com `lagSmoothing(0)` e ligado ao ScrollTrigger. É pausado quando um modal abre; o modal usa `data-lenis-prevent`.

**Revelação de texto.** Texto dividido em palavras, cada palavra dentro de uma máscara; as palavras sobem de `y: 120%` para `0` em 1,7s, com stagger total de 0,6s e `expo.out`; dispara uma vez ao entrar na tela.

**Revelações genéricas (disparam uma vez, em lote, ao entrar na tela):**
- Subida com fade: `y: 70 → 0`, 2s, `expo.out`, stagger 0,1, opacidade em 1s.
- Fade simples: 2s, `expo.out`.
- Escala: `scale 0 → 1` (logos, peças), 2s, `expo.out`.
- Linha/borda de título: `scaleX 0 → 1`, 1,5s, `expo.out`.
- Contadores numéricos nos cartões "Why".

**Preview (showreel).** O painel entra com `clip-path: inset(5% 10% round 2rem)` e `scale 0.9` indo para `inset(0)` e `scale 1`, em 2,5s com `expo.out`, mais fade de 1s. A mídia dentro tem paralaxe ligada à rolagem (`y −10% → +10%`, `scale 1.05`).

**Features.** Os cartões (do segundo em diante) são animados por ScrollTrigger com `scrub: 1`: ao passar pelo centro da tela o texto fica branco, o fundo vira preto (`#000`), a arte de fundo aparece, o acordeão abre por `grid-template-rows: 0fr → 1fr` e o conteúdo aparece. No mobile (até 767px) não há scrub: o cartão abre e fecha com clique (classe `-active`).

**Divider (linha entre seções).** Linha SVG feita com curva quadrática que segue o mouse (0,2s) e volta com `elastic.out(1, 0.2)` em 2s ao sair; entra com `scaleX 0 → 1` em 3s, `expo.out`. Desligada em dispositivos de toque.

**Cartão de projeto (`Card`).** No hover (sem toque), o vídeo do projeto volta ao início e toca; ao sair, pausa. A imagem diminui levemente no hover (visto na captura).

**Navbar.** Entrada: as letras do logo (paths SVG) crescem de `scale 0 → 1` com stagger de 0,06s; links e pílula sobem `y 20 → 0` com fade e stagger de 0,1s. Fixa ao rolar; some ao descer e volta ao subir.

**Transição entre páginas.** O `Loader` sobe um painel de baixo para cima (`scaleY 0 → 1`, 0,7s, `power4.inOut`), a página troca e o painel desaparece (fade de 0,4s). `ClientRouter` do Astro faz a troca; o cursor persiste entre páginas.

**Modal do showreel.** Elemento `<dialog>` nativo; abrir toca o vídeo, fechar (clique em qualquer lugar) pausa.

**Botão de copiar.** Clique copia o texto para a área de transferência e troca para um estado alternativo por 1s.

**Transições de CSS.** `cubic-bezier(.16,1,.3,1)` em 0,8s para `transform`; curva elástica `cubic-bezier(.34,4.56,.64,1)` em botões (0,7s); `opacity` e `color` de 0,2s a 0,6s.

### Não observado / não verificado

- O Cuberto **não** desliga as animações do GSAP com `prefers-reduced-motion` (só o Lenis lê essa preferência). No portfólio vamos fazer melhor.
- Não abri o menu mobile aberto nem o estado aberto do FAQ.
- Não medi o desempenho real (Lighthouse) do Cuberto.
- A seção de "Testimonials" e o conteúdo exato do "Why" foram vistos só por texto e captura estática.
- Licença da biblioteca de cursor deles (é código próprio do site): não vamos copiar; implementamos nossa versão.

## Mapeamento Cuberto → portfólio

| Cuberto | No portfólio | Observação |
|---|---|---|
| Topbar fixa que some/volta + pílula "Contacts" | Igual: logo (seu nome), links, seletor PT/EN, pílula "Contato"; no mobile, barra arredondada com menu | igual |
| Tophead | Hero: frase grande centralizada + subtítulo | igual |
| Preview / showreel com modal | Painel de destaque com vídeo curto ou demo; modal com vídeo | igual; vídeo de exemplo até haver um seu |
| Overview "What we do" | "Sobre": rótulo + parágrafo grande | adaptado |
| Features (cartões pretos 01–05, scrub) | "O que eu faço": 3 a 5 áreas, cada uma com link para um projeto | igual |
| Logoreel (clientes) | Grade de tecnologias e ferramentas, cada uma com link | adaptado: sem clientes |
| Selected work (invertida, grade deslocada) | "Projetos": mesma grade em seção escura | igual |
| Testimonials | fora do escopo | sem clientes |
| Why (cartões pastel com contadores) | "Em números": 3 a 4 números reais seus | opcional, só com números reais |
| Insights (blog) | fora do escopo | pode virar "Notas" depois |
| FAQ | fora do escopo | |
| Outro (gradiente + pílula branca) | "Vamos conversar": chamada final com e-mail e botão de copiar | igual |
| Footer | E-mail em pílula, localização, links, ícones sociais em círculos | igual |
| Página de projeto (Tophead, Preview, Overview, Splitshow, Feedback, Nextcase) | Mesma estrutura, sem Feedback; "Próximo projeto" no fim | adaptado |
| `/about`, `/services`, `/blog`, `/contacts` | fora do escopo | tudo cabe na home |

## Fora de escopo (YAGNI)

Blog, CMS, formulário com back-end, depoimentos, FAQ, páginas `/about`, `/services` e `/contacts`, tema claro/escuro alternável pelo usuário, área de currículo para recrutadores.

## Stack

Astro (estático) com `ClientRouter` + GSAP (ScrollTrigger e SplitText) + Lenis. Fonte livre no lugar da Suisse Intl: Instrument Sans (alternativa: Inter Tight), pesos 400 e 500. Sem framework de UI.

## Estrutura e páginas

- `/pt/` e `/en/`: home com as seções, na ordem do mapeamento.
- `/pt/projetos/[slug]` e `/en/projects/[slug]`: página de cada projeto, aberta com a transição de página.
- `/` redireciona para o idioma do navegador (`navigator.language`).

## Conteúdo

Textos separados do código:

- `src/content/pt.json` e `src/content/en.json` para os textos das seções.
- `src/content/projects/*` (um arquivo por projeto), com campos por idioma.

O conteúdo inicial é de exemplo, claramente marcado, para ser trocado depois. Como o Cuberto depende muito de mídia (vídeo e imagens 3D), o plano inclui gerar mídias de exemplo próprias (cores e formas simples) para o site não ficar vazio.

## Visual

- Escala fluida com `rem` proporcional à largura (0,625vw no desktop, 2,667vw no mobile, ponto de corte em 768px), com limites mínimo e máximo para telas muito grandes ou pequenas.
- Cores: branco, preto, e dois tons pastel para os cartões de números. Seções escuras com gradiente e formas concêntricas (feitas por mim, em CSS/SVG).
- Tipografia, raios, container e botões seguem os valores medidos acima.

## Animações

Seguem o sistema do Cuberto (seção "Animações e interações"), com estas decisões próprias:

- Implementamos nossos próprios componentes e helpers com GSAP, ScrollTrigger, SplitText e Lenis.
- Valores de tempo e curva partem dos medidos e são ajustados olhando no navegador.
- **`prefers-reduced-motion` desliga** as animações de GSAP, o Lenis e o cursor customizado (o Cuberto não faz isso).
- Cursor customizado e Lenis só em dispositivos com ponteiro fino e sem toque.
- Animações com `will-change` somente durante a execução.

## Idiomas (i18n)

- Roteamento nativo do Astro, com `/pt/` e `/en/`; cada página lê o JSON do seu idioma.
- O seletor PT/EN leva à mesma página ou seção no outro idioma.
- `<html lang>` correto e `hreflang` cruzado em cada página.

## SEO e compartilhamento

Título, descrição e imagem Open Graph por idioma e por projeto, no mesmo formato do Cuberto (`og:*` e `twitter:summary_large_image`). Sitemap gerado automaticamente.

## Deploy

`astro build` gera arquivos estáticos em `dist/`. O repositório no GitHub é conectado à Vercel (ou Netlify); cada push publica o site.

## Testes e verificação

- Build: compila e gera as rotas `/pt/`, `/en/` e as páginas de projeto nos dois idiomas.
- Conteúdo: `pt.json` e `en.json` têm exatamente as mesmas chaves; todo projeto tem os dois idiomas.
- Manual no navegador: desktop e mobile, rolagem suave, cursor, transição de página, modal, scrub dos cartões e `prefers-reduced-motion`.
- Comparação visual lado a lado com o Cuberto (apenas para conferir ritmo e proporções).
- Lighthouse: desempenho e acessibilidade acima de 90.
