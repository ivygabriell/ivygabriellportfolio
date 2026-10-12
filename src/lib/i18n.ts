export const LOCALES = ['pt', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'pt';

export const HTML_LANG: Record<Locale, string> = { pt: 'pt-BR', en: 'en' };

export const PROJECT_SEGMENT: Record<Locale, string> = { pt: 'projetos', en: 'projects' };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'pt' ? 'en' : 'pt';
}

export function homePath(locale: Locale): string {
  return `/${locale}/`;
}

export function projectPath(locale: Locale, slug: string): string {
  return `/${locale}/${PROJECT_SEGMENT[locale]}/${slug}/`;
}

/** Primeiro idioma preferido que não esteja vazio: português vira 'pt', qualquer outro vira 'en'. */
export function pickLocale(languages: readonly string[]): Locale {
  const first = languages
    .map((l) => (typeof l === 'string' ? l.trim() : ''))
    .find((l) => l.length > 0);
  if (!first) return DEFAULT_LOCALE;
  return first.toLowerCase().split('-')[0] === 'pt' ? 'pt' : 'en';
}

export function withHash(path: string, hash: string): string {
  if (!hash || hash === '#') return path;
  return path + (hash.startsWith('#') ? hash : `#${hash}`);
}

export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split('/').filter(Boolean);
  const from = parts[0];
  if (!isLocale(from)) throw new Error(`path has no locale prefix: ${pathname}`);
  if (parts.length === 1) return homePath(to);
  if (parts.length === 3 && parts[1] === PROJECT_SEGMENT[from]) return projectPath(to, parts[2]);
  throw new Error(`cannot switch locale for path: ${pathname}`);
}
