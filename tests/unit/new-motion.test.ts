import { beforeEach, describe, expect, it, vi } from 'vitest';

const chain = () => {
  const api: any = new Proxy(function () {}, { get: () => api, apply: () => api });
  return api;
};

const create = vi.fn();
const set = vi.fn();
const to = vi.fn();
const timeline = vi.fn(() => chain());

vi.mock('../../src/scripts/gsap', () => ({
  gsap: {
    set,
    to,
    killTweensOf: vi.fn(),
    timeline,
    matchMedia: () => ({ add: (_query: string, run: () => void) => run(), revert: vi.fn() }),
  },
  ScrollTrigger: { create },
  SplitText: {},
}));

const on = { animations: true, smoothScroll: true, cursor: true };
const off = { animations: false, smoothScroll: false, cursor: false };

async function load(file: string) {
  const { mount } = await import('../../src/scripts/registry');
  await import(file);
  return mount;
}

describe('border-reveal', () => {
  beforeEach(() => {
    vi.resetModules();
    create.mockClear();
    set.mockClear();
  });

  const lines = [{ dataset: { reveal: 'border' } }, { dataset: { reveal: 'border' } }];
  const root = { querySelectorAll: () => lines } as unknown as ParentNode;

  it('sem animações não cria nada', async () => {
    const mount = await load('../../src/scripts/border-reveal');
    mount(root, off);
    expect(create).not.toHaveBeenCalled();
  });

  it('cada linha começa com scaleX 0 e cresce uma vez ao entrar na tela', async () => {
    const mount = await load('../../src/scripts/border-reveal');
    mount(root, on);
    for (const line of lines) expect(set).toHaveBeenCalledWith(line, { scaleX: 0, transformOrigin: 'left center' });
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[0][0]).toMatchObject({ once: true });
  });
});

describe('work-scrub', () => {
  beforeEach(() => {
    vi.resetModules();
    create.mockClear();
  });

  const card = () => ({
    querySelector: () => ({}),
    querySelectorAll: () => [{}, {}],
  });
  const cards = [card(), card(), card()];
  const root = { querySelectorAll: () => cards } as unknown as ParentNode;

  it('sem animações não cria nada', async () => {
    const mount = await load('../../src/scripts/work-scrub');
    mount(root, off);
    expect(create).not.toHaveBeenCalled();
  });

  it('cria um scrub por cartão, atrelado à rolagem', async () => {
    const mount = await load('../../src/scripts/work-scrub');
    mount(root, on);
    expect(create).toHaveBeenCalledTimes(3);
    expect(create.mock.calls[0][0]).toMatchObject({ scrub: 1 });
  });

  it('sem cartões na página não faz nada', async () => {
    const mount = await load('../../src/scripts/work-scrub');
    mount({ querySelectorAll: () => [] } as unknown as ParentNode, on);
    expect(create).not.toHaveBeenCalled();
  });
});

describe('divider', () => {
  beforeEach(() => {
    vi.resetModules();
    create.mockClear();
  });

  function fakeDivider() {
    const node = () => ({ append: vi.fn(), setAttribute: vi.fn() });
    const el: any = {
      offsetWidth: 800,
      classList: { add: vi.fn(), remove: vi.fn() },
      append: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      ownerDocument: { createElementNS: vi.fn(() => node()) },
    };
    return el;
  }

  it('com cursor segue o mouse e volta ao sair; remove os ouvintes na limpeza', async () => {
    const el = fakeDivider();
    const mount = await load('../../src/scripts/divider');
    const { unmount } = await import('../../src/scripts/registry');
    mount({ querySelectorAll: () => [el] } as unknown as ParentNode, on);
    const events = el.addEventListener.mock.calls.map((c: unknown[]) => c[0]);
    expect(events).toEqual(expect.arrayContaining(['mousemove', 'mouseleave']));
    unmount();
    const removed = el.removeEventListener.mock.calls.map((c: unknown[]) => c[0]);
    expect(removed).toEqual(expect.arrayContaining(['mousemove', 'mouseleave']));
  });

  it('em dispositivo de toque a linha aparece mas não escuta o mouse', async () => {
    const el = fakeDivider();
    const mount = await load('../../src/scripts/divider');
    mount({ querySelectorAll: () => [el] } as unknown as ParentNode, { ...on, cursor: false });
    expect(el.addEventListener).not.toHaveBeenCalledWith('mousemove', expect.anything());
    expect(el.classList.add).toHaveBeenCalledWith('is-live');
  });

  it('a entrada por scaleX só roda com animações ligadas', async () => {
    const el = fakeDivider();
    const mount = await load('../../src/scripts/divider');
    mount({ querySelectorAll: () => [el] } as unknown as ParentNode, { ...on, animations: false });
    expect(create).not.toHaveBeenCalled();
    const el2 = fakeDivider();
    vi.resetModules();
    const mount2 = await load('../../src/scripts/divider');
    mount2({ querySelectorAll: () => [el2] } as unknown as ParentNode, on);
    expect(create).toHaveBeenCalledTimes(1);
  });
});
