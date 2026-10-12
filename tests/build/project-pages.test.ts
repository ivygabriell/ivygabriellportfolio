import { describe, expect, it } from 'vitest';
import { loadProjects, nextProject } from '../../src/lib/projects';
import { exists, read } from './dist';

const projects = loadProjects();

describe('páginas de projeto', () => {
  it.skipIf(projects.length === 0)('existe uma página por projeto nos dois idiomas', () => {
    for (const p of projects) {
      expect(exists(`pt/projetos/${p.slug}/index.html`), `pt ${p.slug}`).toBe(true);
      expect(exists(`en/projects/${p.slug}/index.html`), `en ${p.slug}`).toBe(true);
    }
  });

  it.skipIf(projects.length === 0)('cada página tem título, visão geral, legendas e hreflang cruzado', () => {
    for (const p of projects) {
      const pt = read(`pt/projetos/${p.slug}/index.html`);
      expect(pt).toContain(p.pt.title);
      expect(pt).toContain(p.pt.overview);
      for (const c of p.pt.shotCaptions) expect(pt).toContain(c);
      expect(pt).toMatch(new RegExp(`hreflang="en" href="[^"]*/en/projects/${p.slug}/"`));
      const en = read(`en/projects/${p.slug}/index.html`);
      expect(en).toContain(p.en.title);
      expect(en).toMatch(new RegExp(`hreflang="pt-BR" href="[^"]*/pt/projetos/${p.slug}/"`));
    }
  });

  it.skipIf(projects.length === 0)('o próximo projeto do último volta ao primeiro', () => {
    const last = projects[projects.length - 1];
    const first = projects[0];
    expect(nextProject(projects, last.slug)?.slug).toBe(first.slug);
    expect(read(`pt/projetos/${last.slug}/index.html`)).toContain(`href="/pt/projetos/${first.slug}/"`);
  });

  it.skipIf(projects.length === 0)('os links da navbar voltam para as âncoras da home do idioma', () => {
    const html = read(`pt/projetos/${projects[0].slug}/index.html`);
    expect(html).toContain('href="/pt/#servicos"');
  });
});
