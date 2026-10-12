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
4. **Selected work** (título igual nos dois idiomas): 4 cartões, um por serviço (Sites e landing pages, Aplicações web, Apps mobile, Automações e integrações), no layout de grade dos antigos cartões de projeto, com arte em cobalto, título (`h3`) e descrição. Sem links.
5. **Contato + footer**: e-mail e WhatsApp como botões principais; LinkedIn, GitHub e Instagram como links secundários; sem formulário. Navbar e footer: Sobre, Serviços, Contato.

`services.ts` (rolagem guiada) e as páginas de projeto continuam no código sem uso na home; a limpeza fica para depois.

**Animações restauradas depois (pedido da usuária, medidas no Cuberto ao vivo):**
- **Divider** (`Divider.astro` + `divider.ts`): linha em curva quadrática que segue o mouse (0,2s) e volta elástica (`elastic.out(1, 0.2)`, 2s), com entrada `scaleX 0 → 1` em 3s `expo.out`. Três na home: dois no Sobre e um no footer. Só reage ao mouse em dispositivos com ponteiro fino; sem JavaScript fica uma linha reta.
- **Linha do título** (`border-reveal.ts`, `data-reveal="border"`): `scaleX 0 → 1` em 1,5s `expo.out`, sob o título de Selected work.
- **Scrub dos cartões** (`work-scrub.ts`): cada cartão de Selected work acende (opacidade 0,35 → 1 e escala 0,94 → 1, `scrub: 1`) ao cruzar a tela, só no desktop.
- **Cantos arredondados** nas seções escuras de conteúdo (Selected work e Contato; `--r-top`: 8rem no desktop, 4rem no mobile), com sobreposição para os cantos revelarem a cor da seção anterior. **O footer é reto** (pedido posterior da usuária).
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
9. Nenhuma ocorrência de `example.com`, `Instagram` ou `gcivy` no HTML gerado (exceto `SITE_URL` de fallback documentado).

## 7. Fora do escopo

Vídeo/motion do destaque, currículo, depoimentos, processo, FAQ, formulário, blog, modo escuro e os menores adiados do spec anterior (menu mobile, sitemap, robustez). Cada um pode virar um ciclo próprio.

## 8. Pontos em aberto (não bloqueiam)

- Fato pessoal opcional para a abertura do Sobre (a usuária ainda pode enviar).
- Qual vídeo/motion usar no Destaque.
- Decisão de integração da branch `feat/portfolio` (merge/PR/manter) e hospedagem.
