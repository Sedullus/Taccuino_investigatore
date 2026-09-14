// Casi di test §14, righe 1–5.
import { describe, expect, it } from 'vitest';
import { combinaDadi, leggiD100, nettoBonusPenalita } from '../dice';

describe('dice — lettura del D100 (§5.1)', () => {
  it('caso 1: decina 00, unità 0 → 100', () => {
    expect(leggiD100(0, 0)).toBe(100);
  });

  it('caso 2: decina 00, unità 3 → 3', () => {
    expect(leggiD100(0, 3)).toBe(3);
  });
});

describe('dice — dadi bonus e penalità (§5.2)', () => {
  it('caso 3: bonus, unità 4, decine 40 e 20 → 24', () => {
    expect(combinaDadi(4, [40, 20], 1).scelto).toBe(24);
  });

  it('caso 4: penalità, unità 1, decine 20 e 40 → 41', () => {
    expect(combinaDadi(1, [20, 40], -1).scelto).toBe(41);
  });

  it('caso 5: bonus, unità 0, decine 00 e 30 → 30 (con penalità: 100)', () => {
    expect(combinaDadi(0, [0, 30], 1).scelto).toBe(30);
    expect(combinaDadi(0, [0, 30], -1).scelto).toBe(100);
  });

  it('bonus e penalità si annullano, il netto resta in −2…+2', () => {
    expect(nettoBonusPenalita(1, 1)).toBe(0);
    expect(nettoBonusPenalita(3, 0)).toBe(2);
    expect(nettoBonusPenalita(0, 3)).toBe(-2);
  });
});
