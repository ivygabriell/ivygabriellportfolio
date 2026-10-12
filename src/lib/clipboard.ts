export interface ClipboardDeps {
  writeText?: (text: string) => Promise<void>;
  legacyCopy?: (text: string) => boolean;
}

export async function copyText(text: string, deps: ClipboardDeps): Promise<boolean> {
  if (deps.writeText) {
    try {
      await deps.writeText(text);
      return true;
    } catch {
      // segue para a cópia antiga
    }
  }
  if (deps.legacyCopy) {
    try {
      return deps.legacyCopy(text);
    } catch {
      return false;
    }
  }
  return false;
}

export function browserDeps(): ClipboardDeps {
  const clipboard = navigator.clipboard;
  return {
    writeText: clipboard?.writeText ? (text) => clipboard.writeText(text) : undefined,
    legacyCopy: (text) => {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.append(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    },
  };
}
