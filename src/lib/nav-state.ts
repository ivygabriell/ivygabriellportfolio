export interface NavState {
  fixed: boolean;
  visible: boolean;
}

export function nextNavState(y: number, lastY: number, prev: NavState): NavState {
  if (y <= 0) return { fixed: false, visible: false };
  if (y === lastY) return prev;
  return { fixed: true, visible: lastY > y };
}
