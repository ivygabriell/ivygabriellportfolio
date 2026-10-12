export interface Env {
  reducedMotion: boolean;
  finePointer: boolean;
  touch: boolean;
}

export interface MotionFlags {
  animations: boolean;
  smoothScroll: boolean;
  cursor: boolean;
}

export function readEnv(win: { matchMedia(query: string): { matches: boolean } }): Env {
  const matches = (query: string) => win.matchMedia(query).matches;
  return {
    reducedMotion: matches('(prefers-reduced-motion: reduce)'),
    finePointer: matches('(pointer: fine)'),
    touch: matches('(pointer: coarse)'),
  };
}

export function motionFlags(env: Env): MotionFlags {
  const animations = !env.reducedMotion;
  return {
    animations,
    smoothScroll: animations && !env.touch,
    cursor: animations && env.finePointer && !env.touch,
  };
}
