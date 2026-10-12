import { withHash } from '../lib/i18n';
import { register } from './registry';

// Mantém a âncora atual (#projetos etc.) ao trocar de idioma: os ids das seções são iguais nos dois.
register(() => {
  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('[data-lang-switch]');
    if (!link?.dataset.base) return;
    link.href = withHash(link.dataset.base, location.hash);
  };
  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
});
