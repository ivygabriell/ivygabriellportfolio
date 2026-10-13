import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Lê o texto dos arquivos (sem biblioteca de YAML): o objetivo é garantir que o fluxo combinado continue existindo.
const read = (path: string) => readFileSync(path, 'utf8');

describe('verificação automática (GitHub Actions)', () => {
  const ci = existsSync('.github/workflows/ci.yml') ? read('.github/workflows/ci.yml') : '';

  it('o workflow existe', () => {
    expect(existsSync('.github/workflows/ci.yml')).toBe(true);
  });

  it('roda em todo push de qualquer branch, para a branch ser checada antes de ir para a main', () => {
    expect(ci).toMatch(/on:\s*\n\s+push:\s*\n\s+branches:\s*\[\s*'\*\*'\s*\]/);
  });

  it('usa permissões mínimas (só leitura do repositório)', () => {
    expect(ci).toMatch(/permissions:\s*\n\s+contents:\s*read/);
  });

  it('cancela a execução antiga da mesma branch quando chega um push novo', () => {
    expect(ci).toMatch(/concurrency:\s*\n\s+group:\s*ci-\$\{\{\s*github\.ref\s*\}\}\s*\n\s+cancel-in-progress:\s*true/);
  });

  it('usa ações com versão fixa e o mesmo Node do ambiente local', () => {
    expect(ci).toContain('actions/checkout@v4');
    expect(ci).toContain('actions/setup-node@v4');
    expect(ci).toMatch(/node-version:\s*'?24'?/);
    expect(ci).toMatch(/cache:\s*npm/);
  });

  it('instala com npm ci e roda testes unitários, tipos e testes de build, nesta ordem', () => {
    const order = ['npm ci', 'npm test', 'npm run check', 'npm run test:build'].map((cmd) => ci.indexOf(`run: ${cmd}`));
    order.forEach((at, i) => expect(at, `passo ${i}`).toBeGreaterThan(-1));
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('o workflow tem um nome fixo (é ele que a proteção da main vai exigir)', () => {
    expect(ci).toMatch(/^name:\s*CI\s*$/m);
    expect(ci).toMatch(/jobs:\s*\n\s+verify:/);
  });
});

describe('modelo de Pull Request', () => {
  const pr = existsSync('.github/pull_request_template.md') ? read('.github/pull_request_template.md') : '';

  it('existe e tem as seções combinadas', () => {
    expect(existsSync('.github/pull_request_template.md')).toBe(true);
    for (const heading of ['## O que mudou', '## Por quê', '## Como testei', '## Capturas', '## Riscos e pendências'])
      expect(pr, heading).toContain(heading);
  });

  it('tem o checklist das três verificações e da conferência no navegador', () => {
    for (const item of ['npm test', 'npm run test:build', 'npm run check', 'desktop e no celular'])
      expect(pr, item).toContain(item);
    expect(pr).toMatch(/- \[ \]/);
  });

  it('lembra de não publicar dados pessoais fora dos arquivos de conteúdo', () => {
    expect(pr.toLowerCase()).toContain('dados pessoais');
  });
});

describe('documentação do fluxo', () => {
  const readme = read('README.md');

  it('o README explica o fluxo de trabalho com branches, push antes da main e verificação', () => {
    expect(readme).toContain('## Fluxo de trabalho');
    for (const term of ['feat/', 'fix/', 'chore/', 'docs/', 'Pull Request', 'git push -u origin', 'CI']) expect(readme, term).toContain(term);
  });
});
