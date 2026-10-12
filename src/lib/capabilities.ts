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

export function motionFlags(env: Env, options: { late?: boolean } = {}): MotionFlags {
  const motion = !env.reducedMotion;
  return {
    // `late`: a página já foi mostrada pelo timeout de segurança; refazer os estados iniciais faria o conteúdo piscar.
    animations: motion && !options.late,
    smoothScroll: motion && !env.touch,
    cursor: motion && env.finePointer && !env.touch,
  };
}
