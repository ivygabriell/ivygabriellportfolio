import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => (existsSync(path) ? readFileSync(path, 'utf8') : '');

describe('documento de desenvolvimento em sessões (docs/DESENVOLVIMENTO.md)', () => {
  const doc = read('docs/DESENVOLVIMENTO.md');

  it('existe e tem as seções combinadas', () => {
    expect(existsSync('docs/DESENVOLVIMENTO.md')).toBe(true);
    for (const heading of [
      '## 1. Visão geral',
      '## 2. Papéis',
      '## 3. Ciclo de uma tarefa',
      '## 4. Testes: micro e macro',
      '## 5. Skills obrigatórias',
      '## 6. Conflitos e propriedade de arquivos',
      '## 7. Worktrees e portas',
      '## 8. Validação da integradora',
      '## 9. Proteção da main',
      '## 10. Consumo e limites',
      '## 11. Como iniciar uma sessão trabalhadora',
    ])
      expect(doc, heading).toContain(heading);
  });

  it('só a integradora integra na main, e as trabalhadoras nunca', () => {
    expect(doc).toContain('Só a sessão integradora integra na `main`');
    expect(doc).toMatch(/trabalhadora[^.]*nunca[^.]*(integra|faz merge)/i);
  });

  it('limita o paralelismo a 1 integradora e 2 trabalhadoras', () => {
    expect(doc).toContain('no máximo 1 integradora e 2 trabalhadoras');
  });

  it('as Skills do Superpowers valem para TODAS as sessões, e o documento nomeia cada uma', () => {
    expect(doc).toMatch(/todas as sessões/i);
    for (const skill of [
      'superpowers:brainstorming',
      'superpowers:test-driven-development',
      'superpowers:systematic-debugging',
      'superpowers:verification-before-completion',
      'superpowers:requesting-code-review',
      'superpowers:finishing-a-development-branch',
    ])
      expect(doc, skill).toContain(skill);
  });

  it('separa os testes: a trabalhadora faz micro (TDD) e macro; a integradora refaz e explora micro e macro', () => {
    const tests = doc.slice(doc.indexOf('## 4. Testes'), doc.indexOf('## 5. Skills'));
    expect(tests).toMatch(/trabalhadora/i);
    expect(tests).toMatch(/integradora/i);
    for (const term of ['micro', 'macro', 'npm test', 'npm run test:build', 'npm run check', 'explora']) expect(tests, term).toContain(term);
  });

  it('lista os arquivos que mais geram conflito', () => {
    const conflicts = doc.slice(doc.indexOf('## 6. Conflitos'), doc.indexOf('## 7. Worktrees'));
    for (const file of ['Footer.astro', 'Work.astro', 'Testimonials.astro', 'freeze.test.ts', 'section-order.test.ts'])
      expect(conflicts, file).toContain(file);
  });

  it('a validação da integradora exige abrir o navegador, comparar com o pedido e conferir mobile e movimento reduzido', () => {
    const validation = doc.slice(doc.indexOf('## 8. Validação'), doc.indexOf('## 9. Proteção'));
    for (const term of ['navegador', 'critérios de aceite', 'celular', 'movimento reduzido', 'PT e EN']) expect(validation, term).toContain(term);
  });

  it('traz um prompt pronto para iniciar uma sessão trabalhadora', () => {
    const start = doc.slice(doc.indexOf('## 11. Como iniciar'));
    expect(start).toContain('scripts/nova-tarefa.sh');
    expect(start).toContain('docs/DESENVOLVIMENTO.md');
  });
});

describe('formulário de tarefa (issue)', () => {
  const form = read('.github/ISSUE_TEMPLATE/tarefa.yml');

  it('existe e pede tudo que a trabalhadora precisa', () => {
    expect(existsSync('.github/ISSUE_TEMPLATE/tarefa.yml')).toBe(true);
    for (const id of ['objetivo', 'criterios', 'arquivos_permitidos', 'arquivos_proibidos', 'skills', 'testes_micro', 'testes_macro', 'sessao'])
      expect(form, id).toMatch(new RegExp(`id:\\s*${id}\\b`));
    expect(form).toMatch(/labels:\s*\[?\s*["']?tarefa/);
  });

  it('não deixa abrir issue em branco', () => {
    expect(read('.github/ISSUE_TEMPLATE/config.yml')).toMatch(/blank_issues_enabled:\s*false/);
  });
});

describe('modelo de Pull Request', () => {
  const pr = read('.github/pull_request_template.md');

  it('mantém as seções antigas e acrescenta testes macro e a validação da integradora', () => {
    for (const heading of ['## O que mudou', '## Por quê', '## Como testei', '## Capturas', '## Riscos e pendências', '## Testes macro executados', '## Validação da integradora'])
      expect(pr, heading).toContain(heading);
  });

  it('o checklist da integradora cobre navegador, critérios de aceite, mobile e idiomas', () => {
    const part = pr.slice(pr.indexOf('## Validação da integradora'));
    for (const term of ['navegador', 'critérios de aceite', 'celular', 'PT e EN']) expect(part, term).toContain(term);
  });
});

describe('README', () => {
  it('aponta para o documento e resume o modelo de sessões', () => {
    const readme = read('README.md');
    expect(readme).toContain('## Desenvolvimento em sessões');
    expect(readme).toContain('docs/DESENVOLVIMENTO.md');
  });
});
