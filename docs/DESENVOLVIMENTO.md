# Desenvolvimento em sessões

Como o portfólio é desenvolvido com várias sessões do Claude Code ao mesmo tempo, sem perder qualidade. Este documento vale para **todas as sessões**, e cada trabalhadora recebe o caminho dele no prompt inicial (seção 11).

## 1. Visão geral

- **1 sessão integradora** (a principal): define as tarefas, valida cada entrega com olhar independente e é a única que leva código para a `main`.
- **Sessões trabalhadoras** (uma por tarefa): constroem a tarefa numa branch própria, dentro de uma *worktree* (cópia isolada da pasta do projeto) e com uma porta de servidor só dela.
- **Limite:** no máximo 1 integradora e 2 trabalhadoras ao mesmo tempo. Cada sessão gasta o seu próprio limite de uso.
- **Por que separar quem constrói de quem valida:** testes verdes não provam que a tarefa certa foi feita (já aconteceu de uma seção ser implementada no lugar de outra). A integradora confere o resultado contra o pedido, no navegador.

## 2. Papéis

| | Integradora | Trabalhadora |
|---|---|---|
| Escreve código | Quase nunca (só correções pequenas da própria validação) | Sim, só nos arquivos permitidos pela tarefa |
| Cria tarefas (issues) e critérios de aceite | Sim | Não; segue a issue |
| Branch e PR | Abre e mantém os PRs de coordenação | Uma branch e um PR por tarefa |
| Roda os testes | Refaz tudo do zero e **explora** (seção 8) | TDD (micro) e a suíte completa (macro) antes do PR |
| Faz merge | **Só a sessão integradora integra na `main`** | **Nunca** integra nem faz merge, nem na própria branch de outra |
| Fala com a Ivy | Sim; reúne todas as dúvidas num lugar só | Não; sobe a dúvida para a integradora |
| Mexe em `docs/` e na memória | Sim | Só no que a tarefa pede |

## 3. Ciclo de uma tarefa

1. **Integradora** abre uma issue com o formulário "Tarefa" (objetivo, critérios de aceite, arquivos permitidos e proibidos, testes esperados).
2. **Trabalhadora** cria a worktree: `scripts/nova-tarefa.sh <feat|fix|chore|docs> <slug>` (cria a branch a partir da `main` do GitHub e escolhe a porta).
3. **Trabalhadora** desenvolve com TDD, em commits pequenos, usando as Skills da seção 5.
4. **Trabalhadora** traz a `main` para dentro da branch (`git fetch origin && git merge origin/main`), roda os testes macro (seção 4) e envia: `git push -u origin <branch>`. Abre o PR com o modelo, marcando "Closes #N", e avisa a integradora.
5. **O CI** do GitHub roda sozinho na branch.
6. **Integradora** valida (seção 8). Se achar problema, comenta no PR e a trabalhadora corrige na mesma branch.
7. **Integradora** integra (merge), confere a `main` e o CI da `main`. **As branches integradas ficam no GitHub** (histórico consultável; decisão da Ivy): nunca apagar a branch remota. A trabalhadora remove a worktree: `scripts/remover-tarefa.sh <tipo> <slug>`. (A opção `--apagar-branch` só apaga a branch local; a do GitHub fica.)

## 4. Testes: micro e macro

Duas camadas, duas responsabilidades. Nenhuma sessão pula testes.

- **micro** = o menor pedaço que mudou: um teste unitário ou de HTML escrito **antes** do código (RED, depois GREEN), uma função, um componente, um estado (hover, foco, erro).
- **macro** = a página e o projeto inteiros: a suíte completa, o build, os tipos, o desempenho e as outras seções (regressão).

| Camada | Trabalhadora | Integradora |
|---|---|---|
| micro | TDD: escreve o teste, vê falhar, faz passar (`superpowers:test-driven-development`) | Relê os testes novos: eles realmente falhariam sem o código? **Explora** cada elemento alterado no navegador (hover, foco, teclado, estados) |
| macro | Antes do PR: `npm test`, `npm run check` e `npm run test:build` (build e testes do HTML), tudo verde; Lighthouse quando mexer em desempenho ou em mídia | Refaz `npm test`, `npm run check` e `npm run test:build` na branch **e depois na `main`**; confere o CI; **explora** a página inteira, as outras seções, PT e EN, desktop, tablet e celular, movimento reduzido |

A trabalhadora entrega com os macro verdes, e a integradora não confia nisso: refaz.

## 5. Skills obrigatórias

As Skills do Superpowers valem para **todas as sessões**, integradora e trabalhadoras. Dizer qual skill está em uso faz parte do trabalho.

| Cenário | Skill |
|---|---|
| Funcionalidade nova ou mudança de comportamento | `superpowers:brainstorming` antes de mexer em qualquer arquivo |
| Implementar qualquer coisa | `superpowers:test-driven-development` (RED antes de GREEN) |
| Bug, teste que falha ou comportamento inesperado | `superpowers:systematic-debugging` (causa raiz antes de qualquer correção) |
| Antes de dizer "pronto", "passou" ou abrir o PR | `superpowers:verification-before-completion` (rodar o comando e ler a saída) |
| Mudança grande ou arriscada | `superpowers:requesting-code-review` |
| Fim de uma branch | `superpowers:finishing-a-development-branch` |
| Plano com vários passos | `superpowers:writing-plans` e `superpowers:executing-plans` |

Se nenhuma skill cobrir o cenário, dizer isso em uma linha.

## 6. Conflitos e propriedade de arquivos

- **Regra:** duas tarefas abertas não tocam o mesmo arquivo. Cada issue lista os arquivos que **pode** e os que **não pode** tocar; se duas listas se cruzam, as tarefas rodam em sequência.
- **Pontos quentes** (mudam com frequência, conflitam fácil): `src/components/Footer.astro`, `src/components/Work.astro`, `src/components/Testimonials.astro`, `src/components/Highlight.astro`, `src/styles/tokens.css`, `src/content/pt.json` e `en.json`, `tests/unit/freeze.test.ts`, `tests/build/section-order.test.ts`, `tests/unit/palette-usage.test.ts`, `README.md` e o spec em `docs/superpowers/specs/`.
- **Scripts de movimento:** ficam congelados (`tests/unit/freeze.test.ts`). Mudar um é decisão explícita da issue, junto com a atualização do teste.
- **Antes do PR:** traga a `main` para a branch e rode tudo de novo. Branch velha é a causa número um de conflito.

## 7. Worktrees e portas

- As worktrees ficam **fora** da pasta do projeto, em `../portfolio-tarefas/<tipo>-<slug>`; cada uma tem o seu `node_modules` e o seu `dist/`, então os testes de build não se atropelam.
- **Portas:** `4321` é o servidor da integradora (`npm run dev`), `4322` é o preview de produção (`npm run preview -- --port 4322`) e `4330` a `4339` são das tarefas (o script escolhe a primeira livre).
- Para listar as tarefas abertas: `git worktree list`.

## 8. Validação da integradora

A integradora **não** aceita "CI verde" como prova. Antes de integrar, ela:

1. Lê a issue e compara o resultado com os **critérios de aceite** e com a referência (por exemplo, a seção do Cuberto).
2. Roda `npm test`, `npm run check` e `npm run test:build` na branch.
3. Abre o **navegador** (servidor local ou preview de produção) e explora: cada elemento alterado nos seus estados e a página inteira, no desktop, no tablet e no **celular**, em **PT e EN**, e com **movimento reduzido**.
4. Procura regressões nas outras seções (ordem das seções, animações, rolagem, cursor, vídeos).
5. Confere o CI do GitHub e o contraste e o desempenho quando a tarefa mexer nisso.
6. Só então integra, roda tudo de novo na `main` e confere o CI da `main`.

Se a validação revelar um problema de causa desconhecida, usa `superpowers:systematic-debugging`, não tentativa e erro.

## 9. Proteção da main

A `main` só recebe código por Pull Request com o check **"Testes, tipos e build"** verde. Não há push direto, force push nem exclusão da `main`. A proteção está ativa no GitHub (configurada junto com este documento). Para as tarefas, isso significa: sempre PR, sempre CI verde, e branch atualizada antes do merge.

**Branches integradas ficam no GitHub.** Depois do merge a branch remota **não é apagada** (decisão da Ivy: o histórico das tarefas fica consultável). Integre com `gh pr merge N --merge`, sem `--delete-branch`. Só a worktree local é removida.

## 10. Consumo e limites

- No máximo 1 integradora e 2 trabalhadoras ao mesmo tempo (conta Pro: paralelo esgota o limite mais rápido).
- A integradora fica enxuta: não relê o código inteiro, valida o que mudou e o que pode ter quebrado.
- Tarefa pequena (uma linha, um texto) não precisa de sessão própria: a integradora faz direto, na sua branch, no mesmo fluxo.

## 11. Como iniciar uma sessão trabalhadora

1. A integradora cria a issue (formulário "Tarefa") e diz o número.
2. Na pasta do projeto: `scripts/nova-tarefa.sh <tipo> <slug>`.
3. Abra uma nova sessão do Claude Code **dentro da pasta da worktree** e cole este prompt (trocando `#N`):

```text
Você é uma sessão trabalhadora do portfólio da Ivy. Sua tarefa é a issue #N do repositório
ivygabriell/ivygabriellportfolio (leia com `gh issue view N`).

Antes de qualquer coisa, leia docs/DESENVOLVIMENTO.md e siga:
- as Skills do Superpowers da seção 5, em todo o trabalho (brainstorming, test-driven-development,
  systematic-debugging, verification-before-completion), dizendo qual está usando;
- só mexa nos arquivos permitidos pela issue;
- TDD: teste primeiro e vê-lo falhar; ao terminar, rode npm test, npm run check e npm run test:build;
- traga a main para a branch, envie a branch e abra o PR com o modelo, "Closes #N";
- NÃO faça merge na main e NÃO use push --force. Dúvidas vão para a sessão integradora, não para a Ivy.
Responda em português.
```
