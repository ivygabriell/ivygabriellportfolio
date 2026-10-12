import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { site } from '../../src/content/site';
import { loadProjects } from '../../src/lib/projects';
import { read } from './dist';

describe('base da home', () => {
  it('o fechamento tem o botão de copiar e um link mailto como alternativa', () => {
    const html = read('pt/index.html');
    expect(html).toContain('id="contato"');
    expect(html).toContain(`data-clipboard-copy="${site.email}"`);
    expect(html).toContain(`href="mailto:${site.email}"`);
  });

  it('o footer tem e-mail, localização e redes', () => {
    const html = read('pt/index.html');
    expect(html).toContain('<footer');
    expect(html).toContain(pt.footer.location);
    for (const s of site.socials) expect(html).toContain(s.url);
  });
});
