## O que mudou
<!-- Em uma ou duas frases, o que esta branch entrega. -->

## Por quê
<!-- O pedido ou o problema que originou a mudança. -->

## Como testei
- [ ] `npm test` passa
- [ ] `npm run test:build` passa
- [ ] `npm run check` passa (0 erros)
- [ ] Conferi no navegador, no desktop e no celular (e com movimento reduzido, se mexi em animação)
- [ ] A verificação automática (CI) do GitHub está verde

## Testes macro executados
<!-- Trabalhadora: marque o que rodou, com o resultado. A integradora refaz tudo. -->
- [ ] Suíte completa (`npm test`), tipos (`npm run check`) e build (`npm run test:build`), todos verdes
- [ ] Trouxe a `main` para a branch antes do PR e rodei tudo de novo
- [ ] Sem regressão nas outras seções (ordem, animações, rolagem, cursor, vídeos)

## Capturas
<!-- Antes e depois, quando a mudança for visual. -->

## Riscos e pendências
<!-- O que pode quebrar, o que ficou para depois. -->

- [ ] Não publiquei dados pessoais (e-mail da conta, telefone etc.) fora dos arquivos de conteúdo do site

## Validação da integradora
<!-- Só a sessão integradora preenche e integra na `main`. CI verde não basta. -->
- [ ] Li a issue e conferi o resultado contra os critérios de aceite (e a referência, se houver)
- [ ] Refiz `npm test`, `npm run check` e `npm run test:build` na branch
- [ ] Explorei no navegador (micro): cada elemento alterado, hover, foco e teclado
- [ ] Explorei no navegador (macro): a página inteira, no desktop, no tablet e no celular, em PT e EN, e com movimento reduzido
- [ ] Rodei tudo de novo na `main` depois do merge e o CI da `main` ficou verde

