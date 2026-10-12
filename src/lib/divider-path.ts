/** Linha do Divider: curva quadrática de (0,100) a (largura,100); o ponto de controle segue o mouse. */
export function dividerPath(width: number, x?: number, y?: number): string {
  return `M0,100 Q${x ?? width / 2},${y ?? 100} ${width},100`;
}

/**
 * Ponto de controle para a posição do mouse relativa ao SVG. O viés é decidido na primeira medida
 * do hover (mouse acima da linha empurra para baixo e vice-versa) e mantido até o mouse sair.
 */
export function controlPoint(localX: number, localY: number, bias: number): { x: number; y: number; bias: number } {
  const b = bias || (localY < 100 ? 50 : -50);
  return { x: localX, y: localY * 2 - 100 + b, bias: b };
}
