import en from '../content/en.json';
import pt from '../content/pt.json';
import type { Locale } from './i18n';

export type Copy = typeof pt;

// A atribuição de `en` a `Copy` faz o TypeScript recusar um en.json com formato diferente do pt.json.
export const copy: Record<Locale, Copy> = { pt, en };
