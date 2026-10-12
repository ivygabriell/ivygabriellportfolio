import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { loadProjects } from '../../src/lib/projects';

function leaves(value: unknown, prefix = ''): [string, unknown][] {
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${prefix}[${i}]`));
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
  return [[prefix, value]];
}

describe('textos', () => {
  it('pt.json e en.json têm exatamente as mesmas chaves', () => {
    expect(leaves(pt).map(([k]) => k)).toEqual(leaves(en).map(([k]) => k));
  });

  it('nenhum texto está vazio', () => {
    for (const [lang, json] of [['pt', pt], ['en', en]] as const)
      for (const [key, value] of leaves(json))
        expect(typeof value === 'string' && value.trim().length > 0, `${lang}:${key}`).toBe(true);
  });
});

describe('projetos', () => {
  const projects = loadProjects();

  it('nenhum projeto de exemplo é publicado', () => {
    for (const p of projects) expect(p.example, p.slug).toBe(false);
  });

  it('toda mídia referenciada existe em public/', () => {
    for (const p of projects)
      for (const file of [p.cover, ...p.shots])
        expect(existsSync(`public${file}`), `${p.slug}: ${file}`).toBe(true);
  });
});

describe('textos finais', () => {
  it('o hero mostra o nome, o cargo e a frase aprovados', () => {
    expect(pt.hero.title).toBe('Ivy Gabriel, Desenvolvedor Full Stack.');
    expect(pt.hero.subtitle).toBe('Eu transformo a sua ideia em um produto digital além do convencional.');
    expect(en.hero.title).toBe('Ivy Gabriel, Full Stack Developer.');
    expect(en.hero.subtitle).toBe('I turn your idea into a digital product beyond the conventional.');
  });

  it('o Sobre usa o texto aprovado', () => {
    expect(pt.about.text).toBe("Gosto de software que resolve problemas de verdade. Por isso, antes de programar, eu escuto: o que trava o seu dia, o que poderia ser automático, o que você imagina e ainda não existe. Trabalho em todas as camadas, e explico tudo em linguagem simples. Você acompanha cada passo e sabe exatamente o que está sendo construído.");
    expect(en.about.text).toBe("I like software that solves real problems. That's why, before I code, I listen: what holds up your day, what could be automatic, what you imagine that doesn't exist yet. I work across every layer, and I explain everything in plain language. You follow each step and know exactly what is being built.");
  });

  it('o Sobre não tem habilidades', () => {
    for (const about of [pt.about, en.about]) {
      expect(about).not.toHaveProperty('skills');
      expect(about).not.toHaveProperty('skillsLabel');
    }
  });

  it('a seção de serviços se chama "Serviços" (EN: "Services") e tem os 4 serviços aprovados', () => {
    expect(pt.services.title).toBe('Serviços');
    expect(en.services.title).toBe('Services');
    expect(pt.services.items.map((i) => i.title)).toEqual([
      'Sites e landing pages',
      'Aplicações web',
      'Apps mobile',
      'Automações e integrações',
    ]);
    expect(en.services.items.map((i) => i.title)).toEqual([
      'Websites and landing pages',
      'Web applications',
      'Mobile apps',
      'Automations and integrations',
    ]);
  });

  it('não sobram textos das seções removidas (Projetos e "Explorar")', () => {
    for (const t of [pt, en]) {
      expect(t).not.toHaveProperty('projects');
      expect(t.nav).not.toHaveProperty('projects');
      expect(t.services).not.toHaveProperty('explore');
      for (const item of t.services.items) expect(item).not.toHaveProperty('href');
    }
  });

  it('o texto do Contato usa a frase aprovada', () => {
    expect(pt.outro.text).toBe("Me conte como as coisas estão hoje, aonde você quer chegar e o que está te impedindo.");
    expect(en.outro.text).toBe("Tell me how things are today, where you want to get to and what is holding you back.");
  });

  it('o contato tem o botão e a mensagem de WhatsApp em cada idioma', () => {
    expect(pt.outro.whatsappCta).toBe('Chamar no WhatsApp');
    expect(en.outro.whatsappCta).toBe('Message on WhatsApp');
    expect(pt.outro.whatsappMessage).toContain('Ivy');
    expect(en.outro.whatsappMessage).toContain('Ivy');
    expect(en.outro.title).toBe('Have an idea to get off the ground?');
  });

  it('o footer não tem mais localização separada: o país vai ao lado do © 2026', () => {
    for (const t of [pt, en]) {
      expect(t.footer).not.toHaveProperty('location');
      expect(t.footer).not.toHaveProperty('locationLabel');
      expect(t.footer).not.toHaveProperty('emailLabel');
    }
    expect(pt.footer.rights).toBe('© 2026 Ivy Gabriel, Brasil');
    expect(en.footer.rights).toBe('© 2026 Ivy Gabriel, Brazil');
  });
});
