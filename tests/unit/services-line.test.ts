import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = (path: string) => readFileSync(`src/${path}`, 'utf8');

describe('linha sob o título de Serviços', () => {
  const work = src('components/Work.astro');

  it('é o componente Divider (a linha que se curva e segue o cursor), dentro do cabeçalho da seção', () => {
    expect(work).toContain("import Divider from './Divider.astro';");
    expect(work).toMatch(/<div class="container--narrow head">[\s\S]*<h2[^>]*data-reveal="words"[\s\S]*<Divider \/>[\s\S]*<\/div>/);
  });

  it('não sobrou a linha simples antiga nem o script que só a servia', () => {
    expect(work).not.toContain('Rule');
    expect(work).not.toContain('data-reveal="border"');
    expect(existsSync('src/scripts/border-reveal.ts')).toBe(false);
    expect(src('scripts/main.ts')).not.toContain('border-reveal');
  });

  it('mantém o espaço entre o título e os cartões', () => {
    expect(work).toMatch(/\.rule\s*\{[^}]*margin-top:\s*5rem/);
  });
});
