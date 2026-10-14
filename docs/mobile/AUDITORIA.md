# Auditoria mobile: Cuberto × nosso site (issue #5, Fase A)

Medido em **13/10/2026**, com Chrome headless (`puppeteer-core` fora do repositório), emulando iPhone: **390×844**, `deviceScaleFactor` 3, toque (`pointer: coarse`, sem `hover`). Nosso site: build de produção (`npm run preview`) da branch `fix/mobile-structure` (base `main` em `14bd0c5`), página `/pt/` (a `/en/` tem a mesma estrutura). Medidas em **px CSS a 390px**; entre parênteses o valor em `rem` (os dois sites usam `html { font-size: 2.66667vw }` até 767px, então **1rem = 10,4px**).

Escopo: só as seções que o nosso site tem. O Cuberto tem outras (logos, blog, FAQ etc.), que ficam de fora.

| Nossa seção | Equivalente no Cuberto |
|---|---|
| Navbar e menu | `.Navbar` (`.strip`) |
| Hero | `TopheadSection` |
| Destaque (vídeo) | `PreviewSection #showreel` |
| Sobre | `OverviewSection #about` |
| Depoimentos | `SummarySection -fill #clients` ("Trusted by our clients") |
| Serviços | `SummarySection -inverse -fill #featured` ("Selected work"), cujo layout de cartões os Serviços herdaram (spec de conteúdo real). O Cuberto também tem uma seção de serviços em acordeão (`FeatureSection #features`); ver a pergunta P1 |
| Contato e footer | `OutroSection` + `Footer` |

Capturas em `docs/mobile/img/` (lado a lado, Cuberto à esquerda e nosso à direita, 390×844 cada, até 90 KB): `01-topo`, `02-menu-aberto`, `03-navbar-rolagem`, `04-destaque`, `05-sobre`, `06-depoimentos`, `07-servicos`, `08-servicos-acordeao-cuberto` (só o Cuberto), `09-contato` e `10-footer`.

## 1. O que já está igual (não mexer)

- Ponto de quebra `767px` e `html { font-size: 2.66667vw }`; sem overflow horizontal hoje em 360, 390 e 430px (PT e EN: `scrollWidth = innerWidth`).
- Hero: altura total da seção 469px nos dois; `h1` 46,8px (4,5rem), `line-height: 1`, peso 500, alinhado à esquerda, 3 linhas.
- Depoimentos: empilhados, sem leque. Título 46,8px centralizado com 41,6px abaixo; lista em grade com 8,3px (0,8rem) de espaço; cartão com 31,2px (3rem) de respiro e raio 8,3px; texto 20,8px/29,1px; aspas 42×25; linha de 62px a 20%. Altura da seção: 2385 × 2394px.
- Espaço entre seções de 83,2px (8rem) no topo de Depoimentos e Serviços.
- Grade de 1 coluna nos Serviços com 62,4px (6rem) entre os cartões; raio da mídia 20,8px (2rem).
- Animações de entrada (seção 3): palavras, painel do destaque, paralaxe, fade-up dos cartões, Divider entrando por `scaleX`. Cursor, rolagem suave e curva do Divider desligados no toque.

## 2. Tabela seção a seção (390px)

| Seção | Item | Cuberto | Nosso | Diferença |
|---|---|---|---|---|
| **Geral** | Margem lateral (`container`) | 15,6px (1,5rem); conteúdo com 359px | 20,8px (2rem, `--gutter`/`--narrow`); conteúdo com 348px | **11px mais estreito** em todas as seções |
| | Fonte do corpo | 14,6px (1,4rem) | 18,7px (`max(1.8rem, 15px)`) | Só afeta o que não tem tamanho próprio |
| **Navbar** | Posição | `position: fixed` desde o início, a 10,4px (1rem) do topo e dos lados | `position: absolute` no topo; só vira `fixed` depois de rolar | |
| | Caixa | 369×50px (4,8rem), raio 26px (2,5rem); fundo branco a 70% com `backdrop-filter: blur(8px)` e borda 1px `#e6e9ef80` (no `::before`) | 348×67px (6,4rem), margem 20,8px, raio 99999px, fundo sólido `--c-bg`, borda 1px `--c-line` | Mais alta, mais estreita, sem vidro |
| | Ao rolar para baixo | **Continua visível** e encolhe: `left/right` passam a 6,2rem (261px de largura, centralizada), transição de 0,8s `cubic-bezier(.16,1,.3,1)` | **Some** (`translateY(-120%)`) e volta ao rolar para cima | Comportamento oposto |
| | Logo | Marca de 20px de altura | "IG" a 33,3px (3,2rem) | Logo 65% maior |
| | Botão do menu | 26×26px; 2 traços de 26×2px, 6px entre eles | 42×33px; traços de 33×2px, 10px entre eles | Maior e mais espaçado |
| **Menu** | Formato | **Gaveta dentro da própria pílula**: a caixa cresce de 50 para 451px; raio vai a 1,6rem | **Tela cheia** (`position: fixed; inset: 0`), conteúdo centrado na vertical | Estrutura diferente (img 02) |
| | Abertura | Altura por `grid-template-rows: 0fr → 1fr` em 0,5s `cubic-bezier(.2,0,0,1)` + `opacity` em 0,4s; fecha em ~0,5s | Instantânea (`display: none → flex`) | Sem animação no nosso |
| | Conteúdo | Rótulo "Menu" 16,6px com linha de 1px embaixo; links 37,4px (3,6rem), ~56px entre linhas; botão "Contacts" preto de 42px (4rem) | Links 43,7px (4,2rem), 77px entre linhas; "EN" 20,8px; pílula "Contato" de 41,6px | Links maiores e mais soltos; sem rótulo |
| | Rolagem da página com o menu aberto | Não trava | Trava (`html.menu-open { overflow: hidden }`) | |
| **Hero** | Respiro acima do título | 124,8px (12rem) | 166,4px (16rem) | 42px a mais (compensado pelo subtítulo mais baixo) |
| | Subtítulo | 20,8px (2rem), `line-height` 27px (1,3), 33,3px (3,2rem) abaixo do título | 20,8px, `line-height` 22,9px (1,1), 31,2px (3rem) abaixo | Entrelinha bem mais apertada |
| **Destaque** | Painel | 359×404px, proporção **355/400**, raio 20,8px | 348×436px, proporção **4/5**, raio 20,8px | 32px mais alto |
| | Espaço até a próxima seção | 83,2px (margem do Sobre) | 83,2px (`padding-bottom`) | Igual |
| **Sobre** | Estrutura | Rótulo + parágrafo, **sem linhas** | Linha + rótulo + parágrafo + linha + "Redes" com links | Linhas (Divider) e redes só no nosso |
| | Parágrafo | 20,8px (2rem), `line-height` 27px (1,3), 337px de largura | 25px (2,4rem, `--fs-lead`), `line-height` 27,5px (1,1), 348px | Fonte 20% maior e entrelinha apertada |
| | Respiro | Margem de 83,2px em cima e embaixo | 41,6px em cima, 104px embaixo, 62,4px entre blocos | |
| **Serviços** | Título | 46,8px (4,5rem), 41,6px (4rem) até o 1º cartão, **sem linha** | 43,7px (4,2rem, `--fs-h2`), linha (Divider) 52px abaixo e mais 52px até o 1º cartão (149px do título ao cartão) | 61px a mais e a linha |
| | Mídia do cartão | 359×413px, proporção **365/420** (alguns 1/1) | 348×436px, proporção **4/5** | |
| | Texto do cartão | Uma legenda: 17,7px (1,7rem)/21,2px, 20,8px (2rem) abaixo da mídia | Título 25px peso 500 a 31,2px da mídia + texto 20,8px/23,9px a 16,6px do título | Estrutura de texto própria (conteúdo da Ivy) |
| | Respiro da seção | 83,2px em cima e embaixo | 83,2px em cima, 145,6px embaixo (inclui o raio do footer) | |
| **Contato** | Alinhamento | **Centralizado** | À esquerda (`text-align: left` no mobile) | img 09 |
| | Título | 52px (5rem), peso 400, `line-height` 57,2px (1,1) | 46,8px (4,5rem), peso 500, `line-height` 1 | |
| | Texto | 20,8px/27px (1,3), 33,3px abaixo do título | 20,8px/23,9px (1,15), 31,2px de espaço | |
| | Botões | 1 pílula de 60px (5,8rem) de altura, centralizada | 2 pílulas de 41,6px (4rem) + e-mail sublinhado | Botão principal menor |
| **Footer** | Links | Grade de **2 colunas**, 20,8px (2rem), 10,4px de respiro vertical (46px por linha) | 1 coluna, 25px (2,4rem), 12,5px entre links | |
| | Redes | 4 círculos de 52px (5rem) espalhados (`space-between`) | 3 círculos de 56px (5,4rem) à esquerda, 14,6px entre eles | |
| | Linha final | "Privacy Policy" + "2026, Cuberto" a 14,6px (1,4rem), opacidade 0,5 | "© 2026 Ivy Gabriel, Brasil" a 16,6px (1,6rem), branco a 90% | |
| | Respiro | 62,4px (6rem) em cima e embaixo | 114,4px em cima (inclui o raio), 41,6px embaixo | |

Alturas totais das seções (390px): Hero 469 × 469 · Destaque 404 × 519 (o nosso inclui o respiro) · Sobre 203 × 823 · Depoimentos 2385 × 2394 · Serviços (cartões) 5563 com 10 projetos × 2866 com 4 serviços · Contato 576 + footer 806 × footer com contato 919. Página: 17934 × 7948px.

## 3. Inventário das animações no mobile

Medido amostrando `transform`, `opacity` e `clip-path` dos elementos a cada 100–700ms depois de eles entrarem na tela (página nova para cada elemento).

| Elemento | Cuberto (toque) | Nosso (toque) | Como dispara | Duração e curva |
|---|---|---|---|---|
| Palavras de títulos e textos (hero, Sobre, Depoimentos, Serviços, Contato) | Sim: cada palavra sobe de ~120% da altura para 0, em sequência | Sim, mesmos valores | Entrada na tela (hero: no carregamento) | ~1,7–2s, `expo.out`, `stagger` total ~0,6s. **Igual.** No Cuberto o hero começa ~0,6s mais tarde (depois do loader) |
| Painel do Destaque | Sim: `clip-path: inset(...)` → `inset(0%)` + `scale(.9 → 1)` | Sim | Entrada na tela | ~2,5s `expo.out`. **Igual** |
| Paralaxe da mídia do Destaque | Sim: `scale(1.05)` + `translateY` ligado à rolagem | Sim | Rolagem (`scrub`) | **Igual** |
| Cartões (Selected work × Serviços) | Sim: `y: 70 → 0`, `opacity: 0 → 1` | Sim | Entrada na tela, em lote | Opacidade ~1s, posição ~2s, `expo.out`. **Igual** |
| Botão do Contato | Sim: fade-up (`y: 70 → 0`, `opacity`) | **Não** (botões sem `data-reveal`) | Entrada na tela | ~2s `expo.out` |
| Depoimentos | Sem animação (leque desligado) | Sem animação | — | **Igual** |
| Divider (linha) | Sim, só a entrada: `scaleX: 0 → 1`. No Cuberto não há Divider nas seções equivalentes às nossas (aparece no FAQ e em outra Overview) | Sim, só a entrada (Sobre ×2, Serviços, footer) | Entrada na tela | ~3s `expo.out`. Curva que segue o mouse: **desligada nos dois** |
| Logo | Sem animação de entrada | Letras crescem de `scale(0)` (0,4s, `stagger` 0,06s) | Carregamento | Script congelado (`navbar.ts`); fica |
| Itens da barra | — (ficam no menu) | Entrada desligada abaixo de 768px (`navbar.ts`) | — | Igual na prática |
| Navbar ao rolar | Encolhe para 261px e continua visível | Some ao descer e volta ao subir | Rolagem | Cuberto: `left/right` 0,8s `cubic-bezier(.16,1,.3,1)`. Nosso: `translateY` 0,6s `--ease-out` |
| Abrir/fechar o menu | Gaveta cresce (`grid-template-rows` 0,5s `cubic-bezier(.2,0,0,1)`) + `opacity` 0,4s; vidro passa de `blur(8px)` a `blur(15px)` e raio de 2,5 a 1,6rem (0,4s) | Instantâneo | Toque no botão | — |
| Botão do menu (2 traços → X) | Gira ±45° em ~0,3s | Gira ±45° com `translateY`, 0,5s `--ease-out` | Toque | Parecido |
| Acordeão de serviços (`#features`) | 1º item aberto; altura por `grid-template-rows` 1,2s `cubic-bezier(.16,1,.3,1)`; conteúdo `opacity` 0,6s | Não existe no nosso markup (o `services.ts` tem o código, mas procura `.Services`, que não está na página) | Toque | — |
| Vídeo do Destaque | Toca em loop | Toca em loop (começa 3s depois do `load` ou na 1ª interação) | — | Igual |
| Vídeos dos cartões | **Não existem no mobile** (`.preview__media.-video` fica com `display: none`; só imagem) | Tocam enquanto o cartão está na tela (`card-autoplay.ts`) | — | Diferença de desempenho; script congelado |

**Desligado no toque**

| Recurso | Cuberto | Nosso |
|---|---|---|
| Cursor | `display: none` em `pointer: coarse` | Fica no DOM com `opacity: 0` (`flags.cursor = false`); invisível |
| Rolagem suave (Lenis) | Desligada | Desligada (`flags.smoothScroll = false` em toque) |
| Hover | Todos os efeitos de hover dentro de `@media (pointer: fine)` (10 regras) | **Sem filtro**: `.Pill:hover`, `.circle:hover` e `.nav:hover::after` também valem no toque, e o estado "gruda" depois do toque |
| Divider | Só a entrada; sem curva | Só a entrada; sem curva (`flags.cursor = false`) |
| Movimento reduzido | Mostra tudo sem animar | Mostra tudo sem animar (verificado: 0 de 17 elementos `[data-reveal]` escondidos; vídeo do Destaque não carrega) |

## 4. Diferenças priorizadas

**Alta** (mudam a cara do mobile)

1. **Navbar não é a pílula de vidro fixa do Cuberto** e some ao descer (img 01, 03). Cuberto: fixa a 1rem, 4,8rem de altura, raio 2,5rem, branco a 70% + `blur(8px)` + borda; sempre visível, encolhe para `left/right: 6.2rem` ao rolar. Dá para fazer só com CSS sobre as classes `-fixed`/`-visible`/`-open` que o `navbar.ts` já aplica (sem mexer no script).
2. **Menu em tela cheia e sem animação** × gaveta dentro da pílula com altura animada (img 02). Medidas: altura 0,5s `cubic-bezier(.2,0,0,1)`, `opacity` 0,4s, links 3,6rem.
3. **Margem lateral de 2rem** × 1,5rem em todas as seções (conteúdo 348 × 359px).

**Média**

4. **Serviços:** 149px do título ao 1º cartão × 41,6px (a linha e os dois respiros de 5rem); título 4,2rem × 4,5rem; mídia 4/5 × 365/420 (img 07).
5. **Sobre:** parágrafo 2,4rem/1,1 × 2rem/1,3 (img 05).
6. **Hero:** 16rem × 12rem acima do título (consequência da navbar menor); subtítulo com `line-height` 1,1 × 1,3 e 3rem × 3,2rem de espaço (img 01).
7. **Contato:** à esquerda × centralizado; título com `line-height` 1 × 1,1; texto 1,15 × 1,3; botão principal de 4rem × 5,8rem (img 09).
8. **Footer:** links em 1 coluna de 2,4rem × 2 colunas de 2rem; redes à esquerda × espalhadas; "©" 1,6rem × 1,4rem (img 10).
9. **Hover no toque:** efeitos de hover sem `@media (pointer: fine)` ficam "presos" depois do toque (pílulas, círculos das redes, sublinhado dos links).

**Baixa**

10. **Destaque:** proporção 4/5 × 355/400 (32px a mais) (img 04).
11. **Botão do menu e logo:** 42×33px com traços a 10px × 26×26px com traços a 6px; "IG" 3,2rem × marca de 20px de altura.
12. **Botões do Contato sem fade-up** (o Cuberto anima o botão). Dá para ligar só com `data-reveal="fade-up"` no markup, sem mexer em script.
13. **Cursor no toque:** `opacity: 0` × `display: none`. Invisível nos dois; só limpeza.
14. Fora do escopo (scripts congelados): entrada do logo letra a letra, vídeos dos cartões tocando no mobile, código morto do acordeão em `services.ts`.

## 5. Perguntas para a integradora (decidir antes da Fase B)

- **P1. Serviços: cartões ou acordeão?** A issue cita "acordeão dos serviços", mas os nossos Serviços herdaram o layout dos cartões do "Selected work" (spec de conteúdo real), e o `services.ts` tem um acordeão sem markup correspondente (o acordeão do Cuberto está na img 08). **Recomendo manter os cartões** e ajustar as medidas aos cartões do Cuberto (item 4). Trocar para acordeão muda a seção no desktop também e é decisão da Ivy.
- **P2. Linhas (Divider) no mobile:** o Cuberto não tem linha no título dos Serviços nem no Sobre. Esconder só abaixo de 768px (o desktop continua igual) ou manter? **Recomendo esconder a do título dos Serviços** (é ela que gera os 149px) e manter as do Sobre, que separam o bloco "Redes" que só nós temos.
- **P3. Rótulo "Menu" na gaveta:** precisaria de um texto novo em `pt.json`/`en.json`, que esta tarefa não pode tocar. **Recomendo não ter rótulo**, só a linha de 1px no topo da gaveta, com "EN" e a pílula "Contato" no fim, como hoje.
- **P4. Travar a rolagem com o menu aberto?** O Cuberto não trava. **Recomendo seguir o Cuberto** (a gaveta não cobre a página inteira). A regra fica em `global.css`, sem mexer no `navbar.ts`.
- **P5. Contato centralizado no mobile?** O desktop já é centralizado; o mobile foi posto à esquerda de propósito. **Recomendo centralizar**, como no Cuberto.
- **P6. Testes de navegador:** overflow, alturas e Lighthouse precisam de um navegador, e não posso adicionar dependência (`package.json` proibido). **Proposta:** testes de CSS (regex no código-fonte, como os atuais) para cada regra, e as medidas no navegador feitas por script fora do repositório, com os números no PR. A integradora refaz no navegador.
- **P7. Arquivos da Fase B:** `src/styles/tokens.css`, `src/styles/global.css`, `src/components/{Navbar,Hero,Panel,About,Work,Outro,Footer,Pill}.astro` e um teste novo `tests/unit/mobile-structure.test.ts`. `tokens.css`, `Work.astro` e `Footer.astro` são **pontos quentes**: nenhuma outra tarefa aberta pode tocá-los ao mesmo tempo. A Navbar também aparece nas páginas de projeto, que entram na verificação.

## 6. Critérios de aceite propostos para a Fase B

Todas as regras ficam **dentro de `@media (max-width: 767px)`** (ou de `(pointer: fine)` para hover). Cada uma ganha um teste escrito antes do código e visto falhar. Medidas conferidas a 390px.

**Geral**
- [ ] `--gutter` e `--narrow` = `1.5rem` no mobile: conteúdo com 359px de largura a 390px.
- [ ] Sem overflow horizontal (`scrollWidth ≤ innerWidth`) em 360, 390 e 430px, em PT e EN, com o menu aberto e fechado.

**Navbar e menu**
- [ ] Barra `position: fixed` desde o topo, a `1rem` do topo e dos lados, `4.8rem` de altura, raio `2.5rem`, fundo `--c-bg` translúcido (~70%) com `backdrop-filter: blur(8px)` e borda de 1px.
- [ ] Ao rolar, a barra **não some** no mobile (`-fixed` sem `translateY`) e encolhe para `left/right: 6.2rem`, com transição de 0,8s `var(--ease-out)`. Aberta (`-open`), volta à largura cheia.
- [ ] Botão do menu: caixa de `2.6rem`, traços de 2px a `0.6rem` um do outro; vira X.
- [ ] Logo com altura de ~`2rem` (proporcional à barra).
- [ ] Menu é uma gaveta dentro da barra (não tela cheia): fechado `grid-template-rows: 0fr`, `opacity: 0` e `visibility: hidden` (links fora do Tab); aberto `1fr` e `opacity: 1`; transição de altura 0,5s `cubic-bezier(.2,0,0,1)` e de opacidade 0,4s; raio do vidro `1.6rem` quando aberto.
- [ ] Links do menu a `3.6rem`; linha de 1px no topo da gaveta; "EN" e a pílula "Contato" no fim.
- [ ] Esc e o toque num link continuam fechando; `aria-expanded` continua certo (nada muda no script).
- [ ] Sem JavaScript, o menu continua visível e navegável (regra atual mantida).
- [ ] (Conforme P4) A página não trava a rolagem com o menu aberto.

**Seções**
- [ ] Hero: `padding-top: 12rem`; subtítulo com `line-height: 1.3` e `margin-top: 3.2rem`.
- [ ] Destaque: painel com `aspect-ratio: 355 / 400`.
- [ ] Sobre: parágrafo a `2rem` com `line-height: 1.3`.
- [ ] Serviços: título a `4.5rem`; `4rem` do título ao 1º cartão (conforme P2, linha escondida no mobile); mídia `aspect-ratio: 365 / 420`.
- [ ] Contato (conforme P5): centralizado; título com `line-height: 1.1`; texto com `line-height: 1.3`; botões com `5.8rem` de altura.
- [ ] Footer: links em grade de 2 colunas, `2rem`, `1rem` de respiro vertical; redes distribuídas na largura (`space-between`); "©" a `1.4rem`.
- [ ] Depoimentos: sem mudança além da margem lateral.

**Toque, movimento e regressão**
- [ ] Hover de `.Pill`, `.circle` e `.nav::after` só em `@media (pointer: fine)` (no desktop nada muda).
- [ ] Botões do Contato com `data-reveal="fade-up"` (usa o `reveal.ts` como está).
- [ ] `src/scripts/**`, `src/content/*.json`, `src/content/clients.ts` e `public/media/**` sem alteração (`freeze.test.ts` verde).
- [ ] Movimento reduzido: tudo visível sem animar, inclusive a gaveta do menu (sem transição).
- [ ] Desktop (1440px) e tablet (820px) sem regressão: mesmas alturas de seção e capturas iguais às da `main`.
- [ ] Lighthouse mobile em `/pt/` e `/en/`: desempenho ≥ 95 e acessibilidade ≥ 98.
- [ ] `npm test`, `npm run check` e `npm run test:build` verdes.

## 7. Resultado da Fase B

Decisões aplicadas (comentário da integradora na issue #5): P1 cartões mantidos; P2 sem a linha do título dos Serviços no mobile; P3 gaveta sem rótulo; P4 sem trava de rolagem; P5 Contato centralizado. Todas as regras estão em `@media (max-width: 767px)` (hover em `@media (pointer: fine)`) e cada uma tem teste em `tests/unit/mobile-structure.test.ts`. `src/scripts/**` e o conteúdo não mudaram.

Medido em 13/10/2026 no build de produção da branch, emulando iPhone (390×844, toque), com script fora do repositório (P6):

| Item | Cuberto | Antes | Depois |
|---|---|---|---|
| Margem lateral / largura do conteúdo | 15,6px / 359px | 20,8px / 348px | 15,6px / 359px |
| Barra (topo, esq., largura × altura) | 10, 10, 369×50, fixa | 21, 21, 348×67, some ao descer | 10, 10, 369×50, fixa |
| Barra ao rolar | 261px, centralizada, visível | escondida | 261px, centralizada, visível |
| Menu | gaveta, 0,5s | tela cheia, sem animação | gaveta, 0,5s; fechada: 0px e fora do Tab |
| Título do Hero (topo) | 125px | 166px | 125px |
| Subtítulo do Hero (topo, entrelinha) | 298px, 27px | 338px, 22,9px | 298px, 27px |
| Painel do Destaque | 359×404 | 348×436 | 359×404 |
| Parágrafo do Sobre | 20,8 / 27px | 25 / 27,5px | 20,8 / 27px |
| Serviços: título → 1º cartão / mídia | 41,6px / 359×413 | 149px / 348×436 | 41,6px / 359×413 |
| Contato / botão principal | centralizado / 60px | à esquerda / 41,6px | centralizado / 60px |
| Footer: links | 2 colunas, 20,8px | 1 coluna, 25px | 2 colunas, 20,8px |

Verificações:
- Sem overflow horizontal em 360, 390 e 430px, em PT e EN, com o menu aberto e fechado (`scrollWidth = innerWidth`).
- Desktop (1440px) e tablet (820px, com mouse e com toque), PT e EN: capturas de página inteira **idênticas pixel a pixel** às da `main` (movimento reduzido, para as capturas serem determinísticas).
- Contraste do texto da barra (`--c-ink`) sobre o vidro: pior caso 8,8:1 sobre os Serviços e 10,9:1 sobre o footer (AA pede 4,5:1).
- Movimento reduzido: 0 de 18 elementos `[data-reveal]` escondidos; barra e gaveta sem transição.
- Sem JavaScript: a barra volta ao fluxo e a gaveta fica aberta, com os 4 links visíveis.
- Lighthouse mobile: `/pt/` e `/en/` com desempenho 96 e acessibilidade 100 (a `main` também tem 96 e 100).
- Âncoras: tocar em "Sobre" no menu para a seção abaixo da barra (`scroll-padding-top: 7rem`).

Mudanças que valem fora do mobile, de propósito: o fade-up nos botões do Contato (pedido no critério; aparece também no desktop) e o hover só com `pointer: fine` (num iPad sem mouse o hover não "gruda"; com mouse continua igual).
