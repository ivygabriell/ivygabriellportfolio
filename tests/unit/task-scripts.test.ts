import { execFileSync, spawnSync } from 'node:child_process';
import { accessSync, constants, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const NOVA = join(process.cwd(), 'scripts/nova-tarefa.sh');
const REMOVER = join(process.cwd(), 'scripts/remover-tarefa.sh');
const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' },
  }).trim();

describe('scripts de tarefa (worktrees)', () => {
  it('existem, são executáveis e têm sintaxe válida de bash', () => {
    for (const script of [NOVA, REMOVER]) {
      expect(existsSync(script), script).toBe(true);
      expect(() => accessSync(script, constants.X_OK), script).not.toThrow();
      expect(spawnSync('bash', ['-n', script]).status, script).toBe(0);
    }
  });

  describe('em um repositório temporário', () => {
    let base: string;
    let repo: string;
    let worktrees: string;
    const run = (script: string, args: string[]) =>
      spawnSync('bash', [script, ...args], {
        cwd: repo,
        encoding: 'utf8',
        env: { ...process.env, SKIP_INSTALL: '1', PORTFOLIO_WORKTREES_DIR: worktrees, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' },
      });

    beforeAll(() => {
      base = mkdtempSync(join(tmpdir(), 'tarefas-'));
      const origin = join(base, 'origin.git');
      repo = join(base, 'portfolio');
      worktrees = join(base, 'portfolio-tarefas');
      git(base, 'init', '--bare', '-b', 'main', origin);
      git(base, 'clone', origin, repo);
      git(repo, 'switch', '-c', 'main');
      writeFileSync(join(repo, 'README.md'), 'teste\n');
      git(repo, 'add', '.');
      git(repo, 'commit', '-m', 'init');
      git(repo, 'push', '-u', 'origin', 'main');
    });
    afterAll(() => rmSync(base, { recursive: true, force: true }));

    it('rejeita tipo inválido e slug fora do padrão, sem criar nada', () => {
      const badType = run(NOVA, ['coisa', 'menu']);
      expect(badType.status).not.toBe(0);
      expect(badType.stderr + badType.stdout).toMatch(/feat\|fix\|chore\|docs|feat, fix, chore/);
      const badSlug = run(NOVA, ['fix', 'Menu Mobile']);
      expect(badSlug.status).not.toBe(0);
      expect(existsSync(worktrees)).toBe(false);
    });

    it('cria a worktree e a branch a partir da main do remoto e informa a pasta e a porta', () => {
      const result = run(NOVA, ['fix', 'mobile-menu', '4339']);
      expect(result.status, result.stderr).toBe(0);
      const dir = join(worktrees, 'fix-mobile-menu');
      expect(existsSync(dir)).toBe(true);
      expect(git(dir, 'rev-parse', '--abbrev-ref', 'HEAD')).toBe('fix/mobile-menu');
      expect(git(dir, 'rev-parse', 'HEAD')).toBe(git(repo, 'rev-parse', 'origin/main'));
      expect(result.stdout).toContain('4339');
      expect(result.stdout).toContain(dir);
    });

    it('não sobrescreve uma tarefa que já existe', () => {
      const again = run(NOVA, ['fix', 'mobile-menu', '4339']);
      expect(again.status).not.toBe(0);
      expect(again.stderr + again.stdout).toMatch(/já existe/);
    });

    it('recusa remover a worktree com mudanças não salvas e remove quando está limpa', () => {
      const dir = join(worktrees, 'fix-mobile-menu');
      writeFileSync(join(dir, 'sujeira.txt'), 'x');
      const refused = run(REMOVER, ['fix', 'mobile-menu']);
      expect(refused.status).not.toBe(0);
      expect(existsSync(dir)).toBe(true);
      rmSync(join(dir, 'sujeira.txt'));
      const ok = run(REMOVER, ['fix', 'mobile-menu']);
      expect(ok.status, ok.stderr).toBe(0);
      expect(existsSync(dir)).toBe(false);
    });
  });
});
