import { beforeEach, describe, expect, it, vi } from 'vitest';

const chain = () => {
  const api: any = new Proxy(function () {}, { get: () => api, apply: () => api });
  return api;
};

vi.mock('../../src/scripts/gsap', () => ({
  gsap: { set: vi.fn(), timeline: () => chain(), to: vi.fn(), context: vi.fn() },
  ScrollTrigger: { create: vi.fn(), batch: vi.fn() },
  SplitText: {
    create: () => {
      throw new Error('SplitText exploded');
    },
  },
}));

const flags = { animations: true, smoothScroll: false, cursor: false };

describe('reveal', () => {
  beforeEach(() => vi.resetModules());

  it('um helper que falha não deixa nenhum elemento escondido para sempre', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { mount } = await import('../../src/scripts/registry');
    await import('../../src/scripts/reveal');
    const make = (reveal: string) => ({
      dataset: { reveal } as Record<string, string>,
      tagName: 'H1',
      removeAttribute: vi.fn(),
    });
    const failing = make('words');
    const fine = make('fade');
    const root = { querySelectorAll: () => [failing, fine] } as unknown as ParentNode;
    mount(root, flags);
    expect(failing.dataset.revealed).toBe('1');
    expect(fine.dataset.revealed).toBe('1');
  });
});
