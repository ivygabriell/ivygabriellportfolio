# Portfólio: conteúdo real, contatos e nova paleta

Complementa `2026-10-12-portfolio-design.md`. Aquele spec define a estrutura e o movimento; este define **o que muda para o site ser o da Ivy**: público, conteúdo, contatos, projetos "Em breve" e cores.

## 1. Objetivo e restrições

**Objetivo.** Transformar o site de exemplo no portfólio real de Ivy Gabriel, **Desenvolvedor Full Stack**, para vender serviços de desenvolvimento a **clientes**. Recrutadores entram em contato pelos mesmos canais; não há currículo.

**Restrições (decididas pela usuária):**

- **Só as cores mudam.** Estrutura (seções, layout, tipografia, espaçamentos) e **todas as animações** ficam exatamente como foram construídas.
- Exceção mínima e necessária: o cartão "Em breve" em Projetos (cartão sem link) e o botão de WhatsApp no Contato. Visual e movimento reaproveitam os existentes.
- Bilíngue PT/EN, Astro + GSAP + Lenis, como antes.
- O e-mail da conta Claude (gcivy.01) **não** entra no site.

## 2. Estrutura final

**Revisão posterior (pedido da usuária):** a seção de Projetos virou a de serviços e a seção antiga de Serviços (acordeão com rolagem guiada) foi removida. A ordem final é Hero → Destaque → Sobre → **Selected work** (`#servicos`) → Contato → footer.

1. **Hero**: *Ivy Gabriel, Desenvolvedor Full Stack.* + frase de impacto. **Sem botão no hero** (o hero original nunca teve; o acesso ao contato é a pílula "Contato" da navbar e a seção final) e sem link de currículo.
2. **Destaque**: painel em código. O vídeo/motion fica para depois (`highlightVideo: null`); o painel funciona sem ele.
3. **Sobre**: texto curto, **sem** habilidades (mantém o bloco de redes).
4. **Serviços** (o título passou de "Selected work" para "Serviços" / "Services", a pedido da usuária; o antigo nome de trabalho da seção ainda aparece nos nomes de arquivo/classe `Work`): 4 cartões, um por serviço (Sites e landing pages, Aplicações web, Apps mobile, Automações e integrações), no layout de grade dos antigos cartões de projeto, com arte em cobalto, título (`h3`) e descrição. Sem links.
5. **Contato + footer**: e-mail e WhatsApp como botões principais; LinkedIn, GitHub e Instagram como links secundários; sem formulário. Navbar e footer: Sobre, Serviços, Contato.

`services.ts` (rolagem guiada) e as páginas de projeto continuam no código sem uso na home; a limpeza fica para depois.

**Animações restauradas depois (pedido da usuária, medidas no Cuberto ao vivo):**
- **Divider** (`Divider.astro` + `divider.ts`): linha em curva quadrática que segue o mouse (0,2s) e volta elástica (`elastic.out(1, 0.2)`, 2s), com entrada `scaleX 0 → 1` em 3s `expo.out`. Três na home: dois no Sobre e um no footer. Só reage ao mouse em dispositivos com ponteiro fino; sem JavaScript fica uma linha reta.
- **Linha sob o título de Serviços:** é um **Divider** (a mesma linha elástica que segue o cursor e volta, com entrada `scaleX 0 → 1`), e não uma linha parada. (Uma versão anterior usava uma linha simples com `border-reveal.ts`, que só crescia uma vez e não reagia ao cursor; foi trocada e o script removido.) Passam a ser 4 Dividers: 2 no Sobre, 1 em Serviços e 1 acima do footer.
- **Scrub dos cartões** (`work-scrub.ts`): cada cartão de Selected work acende (opacidade 0,35 → 1 e escala 0,94 → 1, `scrub: 1`) ao cruzar a tela, só no desktop.
- **Cantos arredondados** nas seções escuras de conteúdo (Selected work e Contato; `--r-top`: 8rem no desktop, 4rem no mobile), com sobreposição para os cantos revelarem a cor da seção anterior. **O footer é reto** (pedido posterior da usuária). **Footer:** só a navegação (Sobre, Serviços, Contato), a linha (Divider) e, embaixo, "© 2026 Ivy Gabriel, Brasil" ("Brazil" em inglês) com as redes em círculos com os **ícones** de GitHub, LinkedIn e Instagram; sem seletor de idioma (fica só no header), sem localização e sem e-mail próprio. **O bloco do Contato (título, frase, botões de e-mail e WhatsApp e o e-mail) vive dentro do footer**, numa faixa de 3 colunas: Sobre/Serviços/Contato à esquerda (alinhados ao Sobre) e o Contato centralizado ao lado, os dois **alinhados pela base** (o e-mail termina na altura do último link) e colados na linha divisória logo abaixo; no mobile o Contato vem antes dos links, em uma coluna. A âncora `#contato` continua existindo. **O footer é cobalto (`--c-accent`), diferente do azul-noite dos Serviços, e entra por cima deles com os cantos de cima arredondados (`--r-top`)**; é compacto (≈840px de altura no desktop). O botão claro do Contato usa hover escuro (`--c-ink`) nele, e o © usa branco a 90% (contraste ≥ 4,5:1). Os blocos do footer usam o mesmo recuo horizontal do Sobre (`container--narrow`). O Contato (última seção) e o footer são de **uma cor só** (`--c-ink`), sem gradiente e sem a arte de triângulos encaixados (pedido posterior da usuária).
- O teste de congelamento passa a aceitar `main.ts` com os três imports novos e os três scripts novos; os demais arquivos de movimento continuam idênticos.

Sem Depoimentos, Processo, FAQ, Currículo nem Blog.

## 3. Conteúdo (PT / EN)

**Hero.** PT: *Ivy Gabriel, Desenvolvedor Full Stack.* / *Eu transformo a sua ideia em um produto digital além do convencional.* EN: *Ivy Gabriel, Full Stack Developer.* / *I turn your idea into a digital product beyond the conventional.*

**SEO.** Título: "Ivy Gabriel — Desenvolvedor Full Stack" / "Ivy Gabriel — Full Stack Developer". Descrição PT: "Sites, sistemas, apps e automações sob medida. Fale com Ivy Gabriel e transforme sua ideia em produto."; EN: "Custom websites, systems, apps and automations. Talk to Ivy Gabriel and turn your idea into a product."

**Serviços** (o link "Explorar" de cada um passa de `#projetos` para `#contato`):

| # | PT | EN |
|---|---|---|
| 1 | **Sites e landing pages**: Sua marca com um site que tem desempenho, passa confiança e leva o visitante a falar com você. | **Websites and landing pages**: Your brand with a site that performs, inspires trust and leads visitors to get in touch. |
| 2 | **Aplicações web**: Troque planilhas e tarefas manuais por um sistema feito para o jeito como o seu negócio funciona. | **Web applications**: Replace spreadsheets and manual tasks with a system built around how your business works. |
| 3 | **Apps mobile**: Seu serviço no bolso do cliente, com um app rápido, fácil de usar e pronto para crescer. | **Mobile apps**: Your service in your customer's pocket, with a fast, easy-to-use app ready to grow. |
| 4 | **Automações e integrações**: Ferramentas conectadas e tarefas repetitivas no automático. | **Automations and integrations**: Connected tools and repetitive tasks on autopilot. |

**Projetos, "Em breve".** PT: *Em breve: um projeto que estou finalizando agora.* / *Em breve: o próximo projeto pode ser o seu.* EN: *Coming soon: a project I'm finishing right now.* / *Coming soon: the next project could be yours.* *(Superado pela revisão posterior da seção 2: a seção virou Selected work.)*

**Sobre.** PT: *Eu sou desenvolvedor full stack e trabalho do banco de dados à tela. Gosto de começar pelo problema, conversar com calma e só então escrever o código que o resolve. Explico cada etapa em linguagem simples, sem jargão. Se você tem um processo manual, um sistema lento ou uma ideia sem time técnico, é aqui que eu ajudo.* EN: *I'm a full stack developer and I work from the database to the screen. I like to start from the problem, talk things through and only then write the code that solves it. I explain every step in plain language, no jargon. If you have a manual process, a slow system or an idea without a technical team, that's where I help.*

**Contato.** Título: *Tem uma ideia para tirar do papel?* / *Have an idea to get off the ground?* Botões: *Copiar e-mail* e *Chamar no WhatsApp* / *Copy email* e *Message on WhatsApp*. Mensagem inicial do WhatsApp: *Olá, Ivy! Vi seu portfólio e quero conversar sobre um projeto.* / *Hi Ivy! I saw your portfolio and I'd like to talk about a project.*

**Contatos (públicos no site):** e-mail `ivy.gabriel@icloud.com`; WhatsApp **somente como botão com link de redirecionamento** (`https://wa.me/5562995024778?text=<mensagem codificada no idioma da página>`); o número **não aparece como texto** em nenhuma página; LinkedIn `https://www.linkedin.com/in/ivygabriel`; GitHub `https://github.com/ivygabriell`. Instagram `https://www.instagram.com/ivygabriell_/` (incluído depois, a pedido da usuária; aparece no Sobre e no footer como as outras redes).

## 4. Dados e código

- `src/content/site.ts`: nome, e-mail, **`whatsapp` (novo)**, `socials` só com GitHub e LinkedIn, `highlightVideo`. O texto do WhatsApp vive em `pt.json`/`en.json` (`outro.whatsappCta`, `outro.whatsappMessage`).
- `src/content/pt.json` e `en.json`: reescrever `meta`, `hero`, `about` (remover `skillsLabel` e `skills`), `services.items` (hrefs → `#contato`), `projects` (adicionar `soon` com 2 itens), `outro`. **Paridade PT/EN preservada** (o teste existente continua valendo).
- `src/content/projects/`: remover `aurora`, `atlas`, `pulso`, `nimbus` e as capas/capturas SVG de exemplo em `public/media/projects/`. A pasta fica vazia até haver projeto real.
- `Projects.astro`: se `loadProjects()` devolver lista vazia, renderiza os cartões "Em breve" (mesma classe `Card` e mesma revelação, sem `<a>`, sem ícone de cursor de link); com 1 ou mais projetos, renderiza os reais e **não** mostra "Em breve". As rotas `[slug]` não geram páginas quando não há projetos. *(Superado pela revisão posterior da seção 2: a seção virou Selected work.)*
- `About.astro`: remover o bloco de habilidades; manter o bloco de redes.
- `Outro.astro`: acrescentar o botão de WhatsApp (mesmo componente `Pill`). `Footer.astro` não ganha botão: mantém a pílula de e-mail e lista só GitHub e LinkedIn (os dados vêm de `site.socials`).
- `site.example` permanece `true` (e, com ele, `noindex`) **até a usuária aprovar os textos publicados**; só então vira `false`. `SITE_URL` é definido no deploy.

## 5. Paleta (somente `tokens.css` e cores soltas)

| Token | Antes | Depois |
|---|---|---|
| `--c-bg` | `#fff` | `#f7f8fc` |
| `--c-ink` | `#000` | `#0b1330` |
| `--c-mint` | `#e3f5f3` | `#e4eaff` |
| `--c-lavender` | `#f1f3fa` | `#d3dcff` |
| `--c-accent` (novo) | n/a | `#1f4fff` (cobalto) |
| `--c-ink-soft`, `--c-line`, `--c-paper-soft`, `--c-line-inverse` | preto/branco com transparência | mesma transparência sobre `#0b1330` / `#f7f8fc` |

O botão em pílula (`Pill`) passa de preto a `--c-accent` com texto `--c-bg`; hover e foco mantêm o efeito atual. As artes em gradiente dos cartões (hoje índigo, rosa e âmbar) passam a tons de cobalto. Não se altera nenhum valor de movimento, easing, raio, espaçamento ou tamanho de fonte.

## 6. Critérios de aceite

1. `npm test` e `npm run test:build` verdes; `astro check` sem erros.
2. **Teste de congelamento:** os arquivos em `src/scripts/` (incluindo `motion-config.ts`) ficam idênticos ao commit `9ba438a`, com **uma única exceção**: o literal de cor `'#000'` em `services.ts` (destino da animação do cartão) passa a `'#0b1330'`, igual ao `--c-ink`; os testes de estrutura do HTML (ordem e ids das seções) continuam passando.
3. Sem JavaScript e com movimento reduzido, tudo continua visível.
4. Contraste verificado por teste: `--c-ink` sobre `--c-bg` e `--c-bg` sobre `--c-accent` ≥ 4,5:1.
5. Lighthouse nas páginas `/pt/` e `/en/`: acessibilidade ≥ 98, performance ≥ 95.
6. Páginas sem projetos: nenhuma rota `/pt/projetos/*` nem `/en/projects/*` é gerada; a seção Projetos mostra "Em breve". *(Superado pela revisão posterior da seção 2: a seção virou Selected work.)*
7. O link do WhatsApp abre a conversa com a mensagem inicial no idioma da página.
8. O número de WhatsApp aparece apenas dentro do `href` do botão, nunca como texto visível nem em metadados.
9. Nenhuma ocorrência de `example.com` (exceto o fallback do `SITE_URL`) nem de `gcivy` no HTML gerado (exceto `SITE_URL` de fallback documentado).

## 7. Fora do escopo

Vídeo/motion do destaque, currículo, depoimentos, processo, FAQ, formulário, blog, modo escuro e os menores adiados do spec anterior (menu mobile, sitemap, robustez). Cada um pode virar um ciclo próprio.

## 8. Pontos em aberto (não bloqueiam)

- Fato pessoal opcional para a abertura do Sobre (a usuária ainda pode enviar).
- Qual vídeo/motion usar no Destaque.
- Decisão de integração da branch `feat/portfolio` (merge/PR/manter) e hospedagem.

## 9. Vídeos (pedido posterior da usuária)

Seis vídeos da pasta `~/Documents/video-motions` (sem áudio, H.264) entram em `public/media/`, ligados em `src/content/media.ts`:

- **Destaque:** `destaque-16x9` (desktop) e `destaque-4x5` (até 767px) tocam em loop, mudos, dentro do painel, no lugar da arte em código e da frase "Código, movimento e detalhe." (que saiu dos textos). A capa é uma `<picture>` no HTML (`fetchpriority="high"`); o vídeo fica invisível por cima e só aparece quando começa a tocar (fade).
- **Serviços:** `card-websites`, `card-webapps`, `card-mobile` e `card-automations`, um por cartão, na ordem dos textos, no lugar da arte em SVG (que saiu do código). Com mouse tocam no hover e param ao sair (`card-video.ts`, como no Cuberto); em dispositivos de toque tocam enquanto o cartão está na tela (`card-autoplay.ts`).
- **Desempenho:** o vídeo do Destaque só começa 3 s depois do `load` ou na primeira interação, e com o painel perto da tela; as capas têm 720px (cartões e 4:5) e 1280px (16:9), de 13 a 50 KB. Lighthouse mobile: desempenho 96, acessibilidade 100, 220 KiB no carregamento inicial.
- **Movimento reduzido:** só as capas; nenhum vídeo é baixado nem tocado.

## 10. Depoimentos "Trusted by our clients" (pedido posterior da usuária)

Seção que reproduz a `SummarySection -fill` do Cuberto (id `clients`, título "Trusted by our clients"), entre o Sobre e os Serviços, com dados **fictícios** por enquanto. (Uma primeira versão confundiu essa seção com a de logos "Trusted by remarkable global brands"; foi corrigida.)

- **Título (aprovado):** PT "Quem confia no meu trabalho", EN "Trusted by my clients"; centralizado, 8rem no desktop e 4,5rem no celular, revelação por palavras (`data-reveal="words"`).
- **5 cartões** (como no Cuberto): aspas decorativas, texto entre aspas, linha divisória de 6rem a 20% e o logo do cliente (4rem de altura). Cores alternadas `--c-mint` e `--c-lavender` (o 5º usa o tom de índice par), borda de 4px na cor do fundo.
- **Leque (≥ 768px):** cartões de 40rem sobrepostos e inclinados (−9°, 0°, 9°, −20°, 20°, com os mesmos deslocamentos do Cuberto) e, ao passar o mouse na área, todos se alinham em uma grade (transição de `transform` de 1s, `cubic-bezier(.25,1,.5,1)`). No celular os cartões ficam empilhados. Com movimento reduzido não há transição.
- **Sem JavaScript novo:** só a revelação do título, que já existe; o leque é CSS.
- **Dados:** `src/content/clients.ts` (`testimonials`) + textos em `clients.items`. Os logos de exemplo são gerados por `scripts/gen-client-logos.mjs` (marcas inventadas).
- **Trava:** com `site.example: false`, os testes falham se houver depoimento com `example: true`.
- Lighthouse mobile: desempenho 96–97, acessibilidade 100.

