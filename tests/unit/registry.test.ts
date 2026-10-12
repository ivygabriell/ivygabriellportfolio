import { beforeEach, describe, expect, it, vi } from 'vitest';

const flags = { animations: true, smoothScroll: true, cursor: true };

describe('registry', () => {
  beforeEach(() => vi.resetModules());

  it('monta todas as inicializações com a raiz e as flags', async () => {
    const { register, mount } = await import('../../src/scripts/registry');
    const a = vi.fn();
    const b = vi.fn();
    register(a);
    register(b);
    const root = {} as ParentNode;
    mount(root, flags);
    expect(a).toHaveBeenCalledWith(root, flags);
    expect(b).toHaveBeenCalledWith(root, flags);
  });

  it('montar de novo roda o cleanup da montagem anterior (sem duplicar)', async () => {
    const { register, mount } = await import('../../src/scripts/registry');
    const cleanup = vi.fn();
    const init = vi.fn(() => cleanup);
    register(init);
    mount({} as ParentNode, flags);
    mount({} as ParentNode, flags);
    expect(init).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('um cleanup que falha não impede os outros nem lança', async () => {
    const { register, mount, unmount } = await import('../../src/scripts/registry');
    const ok = vi.fn();
    register(() => ok);
    register(() => () => {
      throw new Error('boom');
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    mount({} as ParentNode, flags);
    expect(() => unmount()).not.toThrow();
    expect(ok).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalled();
  });

  it('uma inicialização que falha não derruba as demais', async () => {
    const { register, mount } = await import('../../src/scripts/registry');
    const later = vi.fn();
    register(() => {
      throw new Error('init failed');
    });
    register(later);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => mount({} as ParentNode, flags)).not.toThrow();
    expect(later).toHaveBeenCalled();
  });

  it('unmount é idempotente', async () => {
    const { register, mount, unmount } = await import('../../src/scripts/registry');
    const cleanup = vi.fn();
    register(() => cleanup);
    mount({} as ParentNode, flags);
    unmount();
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
