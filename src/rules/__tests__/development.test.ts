// Casi di test §14, righe 25–27.
import { describe, expect, it } from 'vitest';
import { sviluppaAbilita } from '../development';

describe('development — fase di sviluppo (§6)', () => {
  it('caso 25: valore 45, tiro 43 → nessun aumento', () => {
    const esito = sviluppaAbilita(45, 43, 7);
    expect(esito.aumenta).toBe(false);
    expect(esito.nuovoValore).toBe(45);
  });

  it('caso 26: valore 97, tiro 96 → aumento (tiro > 95)', () => {
    const esito = sviluppaAbilita(97, 96, 4);
    expect(esito.aumenta).toBe(true);
  });

  it('caso 27: da 88 a 93 → +1D10 già applicato e +2D6 SAN', () => {
    const esito = sviluppaAbilita(88, 89, 5);
    expect(esito.aumenta).toBe(true);
    expect(esito.nuovoValore).toBe(93);
    expect(esito.guadagnaSAN).toBe(true);
  });

  it('non guadagna SAN se resta sotto 90, né se era già a 90 o più', () => {
    expect(sviluppaAbilita(70, 71, 5).guadagnaSAN).toBe(false);
    expect(sviluppaAbilita(92, 93, 3).guadagnaSAN).toBe(false);
  });
});
