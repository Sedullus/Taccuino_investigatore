// Casi di test §14, righe 19–22.
import { describe, expect, it } from 'vitest';
import { applicaDanno } from '../health';

describe('health — Applica danno (§8)', () => {
  it('caso 19: PF max 11, danno 6 → Ferita Grave', () => {
    const esito = applicaDanno({ pf: 11, pfMax: 11, feritaGrave: false }, 6);
    expect(esito.feritaGrave).toBe(true);
    expect(esito.morto).toBe(false);
  });

  it('caso 20: PF max 11, danno 5 → nessuna Ferita Grave', () => {
    const esito = applicaDanno({ pf: 11, pfMax: 11, feritaGrave: false }, 5);
    expect(esito.feritaGrave).toBe(false);
  });

  it('caso 21: PF max 10, danno 5 → Ferita Grave', () => {
    const esito = applicaDanno({ pf: 10, pfMax: 10, feritaGrave: false }, 5);
    expect(esito.feritaGrave).toBe(true);
  });

  it('caso 22: PF max 11, danno 11 → Morto', () => {
    const esito = applicaDanno({ pf: 11, pfMax: 11, feritaGrave: false }, 11);
    expect(esito.morto).toBe(true);
  });

  it('i PF non scendono mai sotto 0', () => {
    const esito = applicaDanno({ pf: 3, pfMax: 11, feritaGrave: false }, 9);
    expect(esito.pf).toBe(0);
    expect(esito.morto).toBe(false);
  });

  it('PF a 0 con Ferita Grave → Morente; PF a 0 senza → Privo di sensi', () => {
    const conFeritaGrave = applicaDanno({ pf: 2, pfMax: 11, feritaGrave: true }, 2);
    expect(conFeritaGrave.morente).toBe(true);
    expect(conFeritaGrave.privoDiSensi).toBe(false);

    const senzaFeritaGrave = applicaDanno({ pf: 2, pfMax: 11, feritaGrave: false }, 2);
    expect(senzaFeritaGrave.morente).toBe(false);
    expect(senzaFeritaGrave.privoDiSensi).toBe(true);
  });
});
