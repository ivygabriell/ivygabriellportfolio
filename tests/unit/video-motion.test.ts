import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const on = { animations: true, smoothScroll: true, cursor: true };
const touch = { animations: true, smoothScroll: false, cursor: false };
const reduced = { animations: false, smoothScroll: false, cursor: false };

async function load(file: string) {
  const { mount, unmount } = await import('../../src/scripts/registry');
  await import(file);
  return { mount, unmount };
}

function fakeVideo(extra: Record<string, unknown> = {}) {
  return {
    dataset: {
      srcDesktop: '/media/d.mp4',
      srcMobile: '/media/m.mp4',
      posterDesktop: '/media/d.jpg',
      posterMobile: '/media/m.jpg',
    },
    src: '',
    poster: '',
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    load: vi.fn(),
    removeAttribute: vi.fn(),
    getAttribute: vi.fn(),
    ...extra,
  };
}

describe('highlight-video', () => {
  let changeListener: (() => void) | undefined;
  let ioCallback: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
  let loadListener: (() => void) | undefined;
  let windowListeners: Record<string, () => void> = {};
  const removeChange = vi.fn();
  const disconnect = vi.fn();
  const observe = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    changeListener = ioCallback = loadListener = undefined;
    windowListeners = {};
    vi.useFakeTimers();
    removeChange.mockClear();
    disconnect.mockClear();
    observe.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function stub(options: { mobile?: boolean; ready?: string } = {}) {
    const state = { mobile: options.mobile ?? false };
    vi.stubGlobal('document', { readyState: options.ready ?? 'complete' });
    vi.stubGlobal('window', {
      matchMedia: () => ({
        get matches() {
          return state.mobile;
        },
        addEventListener: (_: string, fn: () => void) => (changeListener = fn),
        removeEventListener: removeChange,
      }),
      addEventListener: (event: string, fn: () => void) => {
        windowListeners[event] = fn;
        if (event === 'load') loadListener = fn;
      },
      removeEventListener: vi.fn(),
      setTimeout: (fn: () => void, ms: number) => globalThis.setTimeout(fn, ms),
      clearTimeout: (id: number) => globalThis.clearTimeout(id),
    });
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: typeof ioCallback) {
          ioCallback = cb;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    return state;
  }
  const video = (extra: Record<string, unknown> = {}) => {
    const v: any = {
      dataset: { srcDesktop: '/media/d.mp4', srcMobile: '/media/m.mp4' },
      src: '',
      classList: { add: vi.fn(), remove: vi.fn() },
      listeners: {} as Record<string, () => void>,
      addEventListener(event: string, fn: () => void) {
        v.listeners[event] = fn;
      },
      removeEventListener: vi.fn(),
      play: vi.fn(() => Promise.resolve()),
      pause: vi.fn(),
      getAttribute: vi.fn(),
      ...extra,
    };
    return v;
  };
  const rootWith = (v: unknown) => ({ querySelector: () => v }) as unknown as ParentNode;
  const settle = () => vi.advanceTimersByTime(3000);

  it('não baixa nem toca nada enquanto o painel não está perto da tela', async () => {
    stub();
    const v = video();
    const { mount } = await load('../../src/scripts/highlight-video');
    mount(rootWith(v), on);
    settle();
    expect(observe).toHaveBeenCalledWith(v);
    expect(v.src).toBe('');
    expect(v.play).not.toHaveBeenCalled();
  });

  it('não começa a observar logo depois do load: espera 3 s para não competir com a carga da página', async () => {
    stub();
    const v = video();
    const { mount } = await load('../../src/scripts/highlight-video');
    mount(rootWith(v), on);
    vi.advanceTimersByTime(2999);
    expect(observe).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(observe).toHaveBeenCalledWith(v);
  });

  it('a primeira interação do visitante antecipa o início (e só uma vez)', async () => {
    stub();
    const v = video();
    const { mount } = await load('../../src/scripts/highlight-video');
    mount(rootWith(v), on);
    expect(Object.keys(windowListeners)).toEqual(expect.arrayContaining(['pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll']));
    windowListeners.scroll();
    expect(observe).toHaveBeenCalledTimes(1);
    settle();
    expect(observe).toHaveBeenCalledTimes(1);
  });

  it('quando o painel chega perto da tela usa o vídeo 16:9 (desktop) e toca', async () => {
    stub();
    const v = video();
    const { mount } = await load('../../src/scripts/highlight-video');
    mount(rootWith(v), on);
    settle();
    ioCallback?.([{ isIntersecting: true }]);
    expect(v.src).toBe('/media/d.mp4');
    expect(v.play).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
  });

  it('no celular usa o vídeo 4:5', async () => {
    stub({ mobile: true });
    const v = video();
    const { mount } = await load('../../src/scripts/highlight-video');
    mount(rootWith(v), on);
    settle();
    ioCallback?.([{ isIntersecting: true }]);
    expect(v.src).toBe('/media/m.mp4');
  });

  it('espera o load da página para começar a observar', async () => {
    stub({ ready: 'loading' });
    const v = video();
    const { mount } = await load('../../src/scripts/highlight-video');
    mount(rootWith(v), on);
    expect(observe).not.toHaveBeenCalled();
    loadListener?.();
    expect(observe).not.toHaveBeenCalled();
    settle();
    expect(observe).toHaveBeenCalledWith(v);
  });

  it('ao cruzar o breakpoint depois de começar troca de vídeo; antes de começar não faz nada', async () => {
    const state = stub();
    const v = video();
    const { mount } = await load('../../src/scripts/highlight-video');
    mount(rootWith(v), on);
    settle();
    state.mobile = true;
    changeListener?.();
    expect(v.src).toBe('');
    ioCallback?.([{ isIntersecting: true }]);
    expect(v.src).toBe('/media/m.mp4');
    state.mobile = false;
    changeListener?.();
    expect(v.src).toBe('/media/d.mp4');
  });

  it('o vídeo só aparece (is-playing) quando começa a tocar', async () => {
    stub();
    const v = video();
    const { mount } = await load('../../src/scripts/highlight-video');
    mount(rootWith(v), on);
    expect(v.classList.add).not.toHaveBeenCalled();
    v.listeners.playing?.();
    expect(v.classList.add).toHaveBeenCalledWith('is-playing');
  });

  it('com movimento reduzido fica só a capa: nada é observado nem baixado', async () => {
    stub();
    const v = video();
    const { mount } = await load('../../src/scripts/highlight-video');
    mount(rootWith(v), reduced);
    expect(observe).not.toHaveBeenCalled();
    expect(v.src).toBe('');
  });

  it('sem o vídeo na página não faz nada', async () => {
    stub();
    const { mount } = await load('../../src/scripts/highlight-video');
    expect(() => mount(rootWith(null), on)).not.toThrow();
  });

  it('a limpeza remove os ouvintes, desconecta o observador e pausa', async () => {
    stub();
    const v = video();
    const { mount, unmount } = await load('../../src/scripts/highlight-video');
    mount(rootWith(v), on);
    settle();
    unmount();
    expect(removeChange).toHaveBeenCalled();
    expect(v.removeEventListener).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
    expect(v.pause).toHaveBeenCalled();
  });

  it('um play() rejeitado (autoplay bloqueado) não lança erro', async () => {
    stub();
    const v = video({ play: vi.fn(() => Promise.reject(new Error('blocked'))) });
    const { mount } = await load('../../src/scripts/highlight-video');
    mount(rootWith(v), on);
    settle();
    expect(() => ioCallback?.([{ isIntersecting: true }])).not.toThrow();
    await Promise.resolve();
  });
});

describe('card-autoplay', () => {
  let callback: ((entries: unknown[]) => void) | undefined;
  const observe = vi.fn();
  const disconnect = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    callback = undefined;
    observe.mockClear();
    disconnect.mockClear();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: unknown[]) => void) {
          callback = cb;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  const videos = [fakeVideo(), fakeVideo()];
  const root = { querySelectorAll: () => videos } as unknown as ParentNode;

  it('com mouse (hover) não observa nada: quem toca é o card-video', async () => {
    const { mount } = await load('../../src/scripts/card-autoplay');
    mount(root, on);
    expect(observe).not.toHaveBeenCalled();
  });

  it('com movimento reduzido não toca nada', async () => {
    const { mount } = await load('../../src/scripts/card-autoplay');
    mount(root, reduced);
    expect(observe).not.toHaveBeenCalled();
  });

  it('em toque observa cada cartão: toca quando aparece e pausa quando sai', async () => {
    const { mount } = await load('../../src/scripts/card-autoplay');
    mount(root, touch);
    expect(observe).toHaveBeenCalledTimes(2);
    callback?.([{ isIntersecting: true, target: videos[0] }, { isIntersecting: false, target: videos[1] }]);
    expect(videos[0].play).toHaveBeenCalled();
    expect(videos[1].pause).toHaveBeenCalled();
  });

  it('a limpeza desconecta o observador e pausa os vídeos', async () => {
    const { mount, unmount } = await load('../../src/scripts/card-autoplay');
    mount(root, touch);
    unmount();
    expect(disconnect).toHaveBeenCalled();
    for (const v of videos) expect(v.pause).toHaveBeenCalled();
  });
});
