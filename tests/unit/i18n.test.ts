import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE, HTML_LANG, homePath, isLocale, otherLocale, pickLocale,
  projectPath, switchLocalePath, withHash,
} from '../../src/lib/i18n';

describe('rotas', () => {
  it('monta o caminho da home e do projeto em cada idioma', () => {
    expect(homePath('pt')).toBe('/pt/');
    expect(homePath('en')).toBe('/en/');
    expect(projectPath('pt', 'aurora')).toBe('/pt/projetos/aurora/');
    expect(projectPath('en', 'aurora')).toBe('/en/projects/aurora/');
  });

  it('expõe o lang do HTML e o idioma padrão', () => {
    expect(HTML_LANG).toEqual({ pt: 'pt-BR', en: 'en' });
    expect(DEFAULT_LOCALE).toBe('pt');
  });

  it('isLocale e otherLocale', () => {
    expect(isLocale('pt')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(otherLocale('pt')).toBe('en');
    expect(otherLocale('en')).toBe('pt');
  });
});

describe('pickLocale', () => {
  it.each([
    [['pt-BR'], 'pt'],
    [['pt-PT'], 'pt'],
    [['PT'], 'pt'],
    [['en-US'], 'en'],
    [['fr-CA'], 'en'],
    [['en-US', 'pt-BR'], 'en'],
    [['pt-BR', 'en-US'], 'pt'],
    [['', ' ', 'pt'], 'pt'],
    [[], 'pt'],
  ])('%j -> %s', (langs, expected) => {
    expect(pickLocale(langs as string[])).toBe(expected);
  });

  it('não lança com entradas estranhas', () => {
    expect(() => pickLocale([undefined as unknown as string, 'x'])).not.toThrow();
  });
});

describe('withHash', () => {
  it('acrescenta o hash quando existe', () => {
    expect(withHash('/en/', '#projetos')).toBe('/en/#projetos');
    expect(withHash('/en/', 'projetos')).toBe('/en/#projetos');
  });
  it('ignora hash vazio', () => {
    expect(withHash('/en/', '')).toBe('/en/');
    expect(withHash('/en/', '#')).toBe('/en/');
  });
});

describe('switchLocalePath', () => {
  it('troca home e projeto de idioma', () => {
    expect(switchLocalePath('/pt/', 'en')).toBe('/en/');
    expect(switchLocalePath('/en/', 'pt')).toBe('/pt/');
    expect(switchLocalePath('/pt/projetos/aurora/', 'en')).toBe('/en/projects/aurora/');
    expect(switchLocalePath('/en/projects/aurora/', 'pt')).toBe('/pt/projetos/aurora/');
  });
  it('lança em caminho sem idioma ou desconhecido', () => {
    expect(() => switchLocalePath('/', 'en')).toThrow(/locale/);
    expect(() => switchLocalePath('/pt/outra/coisa/', 'en')).toThrow(/cannot switch/);
  });
});
