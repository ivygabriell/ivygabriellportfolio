import { describe, expect, it } from 'vitest';
import { controlPoint, dividerPath } from '../../src/lib/divider-path';

describe('dividerPath', () => {
  it('em repouso é uma reta: controle no meio, na altura 100', () => {
    expect(dividerPath(800)).toBe('M0,100 Q400,100 800,100');
  });

  it('usa o ponto de controle informado, inclusive x = 0', () => {
    expect(dividerPath(800, 120, 40)).toBe('M0,100 Q120,40 800,100');
    expect(dividerPath(800, 0, 40)).toBe('M0,100 Q0,40 800,100');
  });
});

describe('controlPoint', () => {
  it('mouse acima da linha: viés +50 e o controle desce com o dobro do deslocamento', () => {
    expect(controlPoint(300, 60, 0)).toEqual({ x: 300, y: 70, bias: 50 });
  });

  it('mouse na linha ou abaixo: viés -50', () => {
    expect(controlPoint(300, 140, 0)).toEqual({ x: 300, y: 130, bias: -50 });
  });

  it('mantém o viés da primeira medida durante o mesmo hover', () => {
    expect(controlPoint(300, 140, 50)).toEqual({ x: 300, y: 230, bias: 50 });
  });
});
