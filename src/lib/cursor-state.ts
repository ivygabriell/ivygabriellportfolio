export type CursorIcon = 'play' | 'arrow-up-right' | 'times';

export interface CursorState {
  icon: CursorIcon | null;
}

const KNOWN: readonly string[] = ['play', 'arrow-up-right', 'times'];

type Closest = { closest(selector: string): { dataset: Record<string, string | undefined> } | null };

export function resolveCursorState(el: Closest | null): CursorState {
  const icon = el?.closest('[data-cursor-icon]')?.dataset.cursorIcon;
  return { icon: icon && KNOWN.includes(icon) ? (icon as CursorIcon) : null };
}

const svg = (path: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

export const ICONS: Record<CursorIcon, string> = {
  play: svg('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>'),
  'arrow-up-right': svg('<path d="M7 17 17 7M8.5 7H17v8.5"/>'),
  times: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
};
