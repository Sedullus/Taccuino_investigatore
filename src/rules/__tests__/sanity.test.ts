// Casi di test §14, righe 28, 37.
import { describe, expect, it } from 'vitest';
import { eFolliaIndefinita, eFolliaPermanente, sogliaFolliaIndefinita, valutaTiroSanita } from '../sanity';

describe('sanity — tiro Sanità (§7)', () => {
  it('caso 28: SAN 40, tiro 41 → tiro Sanità fallito', () => {
    const esito = valutaTiroSanita(40, 41, '0/1D6');
    expect(esito.riuscito).toBe(false);
    expect(esito.espressionePerdita).toBe('1D6');
  });
});

describe('sanity — Follia Indefinita (§7) [VERIFICA arrotondamento risolto con floor]', () => {
  it('caso 37: SAN inizio giornata 60, perdite 4 + 8 → Follia Indefinita (12 ≥ 12)', () => {
    expect(sogliaFolliaIndefinita(60)).toBe(12);
    expect(eFolliaIndefinita(4 + 8, 60)).toBe(true);
  });

  it('sotto soglia non scatta la Follia Indefinita', () => {
    expect(eFolliaIndefinita(11, 60)).toBe(false);
  });
});

describe('sanity — SAN a 0 (§7)', () => {
  it('SAN a 0 → Follia Permanente', () => {
    expect(eFolliaPermanente(0)).toBe(true);
    expect(eFolliaPermanente(1)).toBe(false);
  });
});
