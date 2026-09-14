// Casi di test §14, righe 23, 24, 29, 30, 31, 43.
import { describe, expect, it } from 'vitest';
import {
  dannoEstremo,
  desPerIniziativa,
  esitoManovra,
  gittataRavvicinataPiedi,
  piediInMetriApprossimati,
  risolviDannoEstremo,
} from '../combat';

describe('combat — danno estremo (§10.4)', () => {
  it('caso 23: Randello 1D6, BD +1D4, livello Estremo → 10', () => {
    const esito = dannoEstremo('1D6', 'contundente', { full: '1D4', half: '1D2' });
    expect(esito.base).toBe(10);
    expect(esito.espressioneExtra).toBeUndefined();
  });

  it('caso 24: Coltello 1D4 (trafigge), BD +1D4, livello Estremo → 8 + 1D4', () => {
    const esito = dannoEstremo('1D4', 'trafigge', { full: '1D4', half: '1D2' });
    expect(esito.base).toBe(8);
    expect(esito.espressioneExtra).toBe('1D4');

    // Risolvendo anche il tiro aggiuntivo con un generatore deterministico:
    const rngFisso = () => 3;
    const risolto = risolviDannoEstremo('1D4', 'trafigge', { full: '1D4', half: '1D2' }, rngFisso);
    expect(risolto.totale).toBe(8 + 3);
  });

  it('il danno estremo non scende mai sotto 0 [VERIFICA §10.4]', () => {
    const esito = dannoEstremo('1D4', 'contundente', { full: '-2', half: '0' });
    expect(esito.base).toBeGreaterThanOrEqual(0);
  });
});

describe('combat — iniziativa e arma pronta (§10.1)', () => {
  it('caso 29: DES 50 con arma pronta → 100 per l\'ordine di turno', () => {
    expect(desPerIniziativa(50, true)).toBe(100);
  });
});

describe('combat — manovre contro la Struttura (§10.5)', () => {
  it('caso 30: Struttura 0 contro 1 → 1 dado penalità', () => {
    expect(esitoManovra(0, 1)).toEqual({ dadiPenalita: 1, inefficace: false });
  });

  it('caso 31: Struttura 0 contro 3 → manovra inefficace', () => {
    expect(esitoManovra(0, 3).inefficace).toBe(true);
  });
});

describe('combat — gittata ravvicinata (§10.3)', () => {
  it('caso 43: DES 60 → 12 piedi, mostrati come 12 ft o circa 3,6 m', () => {
    const piedi = gittataRavvicinataPiedi(60);
    expect(piedi).toBe(12);
    expect(piediInMetriApprossimati(piedi)).toBeCloseTo(3.6, 5);
  });
});
