import { describe, expect, it } from 'vitest';
import { buildProjects, nextProject, parseProject, showComingSoon } from '../../src/lib/projects';

const text = (t: string) => ({
  title: t, caption: `${t} caption`, overview: `${t} overview`, role: `${t} role`,
  shotCaptions: ['a', 'b'],
});
const base = (slug: string, order: number) => ({
  slug, order, year: 2026, example: true, tags: ['x'],
  palette: ['#000', '#111', '#222'], cover: `/c-${slug}.svg`, shots: ['/s1.svg', '/s2.svg'],
  video: null, link: null, pt: text('pt'), en: text('en'),
});

describe('parseProject', () => {
  it('aceita um projeto válido', () => {
    expect(parseProject(base('aurora', 1), 'aurora.json').slug).toBe('aurora');
  });

  it('falha citando arquivo e campo quando falta a tradução', () => {
    const raw: any = base('aurora', 1);
    delete raw.en.title;
    expect(() => parseProject(raw, 'aurora.json')).toThrow(/aurora\.json.*en\.title/);
  });

  it('falha quando o número de legendas não bate com o de imagens', () => {
    const raw: any = base('aurora', 1);
    raw.pt.shotCaptions = ['só uma'];
    expect(() => parseProject(raw, 'aurora.json')).toThrow(/pt\.shotCaptions/);
  });

  it('falha com slug que não é seguro para URL', () => {
    expect(() => parseProject(base('Meu Projeto!', 1), 'x.json')).toThrow(/slug/);
  });

  it('falha quando o slug não bate com o nome do arquivo', () => {
    expect(() => parseProject(base('aurora', 1), 'outro.json')).toThrow(/slug.*file name/i);
  });
});

describe('buildProjects', () => {
  it('ordena por order e rejeita slugs duplicados', () => {
    const list = buildProjects({ 'b.json': base('b', 2), 'a.json': base('a', 1) });
    expect(list.map((p) => p.slug)).toEqual(['a', 'b']);
    expect(() =>
      buildProjects({ 'a.json': base('a', 1), 'a2.json': { ...base('a', 2) } }),
    ).toThrow();
  });
});

describe('nextProject', () => {
  const list = buildProjects({ 'a.json': base('a', 1), 'b.json': base('b', 2), 'c.json': base('c', 3) });

  it('devolve o seguinte', () => {
    expect(nextProject(list, 'a')?.slug).toBe('b');
  });
  it('o último volta ao primeiro', () => {
    expect(nextProject(list, 'c')?.slug).toBe('a');
  });
  it('com um só projeto não há próximo', () => {
    expect(nextProject(list.slice(0, 1), 'a')).toBeNull();
  });
  it('slug desconhecido lança', () => {
    expect(() => nextProject(list, 'zzz')).toThrow(/zzz/);
  });
});

describe('showComingSoon', () => {
  it('mostra "Em breve" só quando não há nenhum projeto', () => {
    expect(showComingSoon([])).toBe(true);
    expect(showComingSoon(buildProjects({ 'a.json': base('a', 1) }))).toBe(false);
  });
});
