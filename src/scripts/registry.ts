import type { MotionFlags } from '../lib/capabilities';

type Cleanup = void | (() => void);
export type Init = (root: ParentNode, flags: MotionFlags) => Cleanup;

const inits: Init[] = [];
let cleanups: (() => void)[] = [];

export function register(init: Init): void {
  inits.push(init);
}

export function unmount(): void {
  const pending = cleanups;
  cleanups = [];
  for (const cleanup of pending.reverse()) {
    try {
      cleanup();
    } catch (error) {
      console.error('[motion] cleanup failed', error);
    }
  }
}

export function mount(root: ParentNode, flags: MotionFlags): void {
  unmount();
  for (const init of inits) {
    try {
      const cleanup = init(root, flags);
      if (typeof cleanup === 'function') cleanups.push(cleanup);
    } catch (error) {
      console.error('[motion] init failed', error);
    }
  }
}
