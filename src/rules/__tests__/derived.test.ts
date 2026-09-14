// Casi di test §14, righe 13–18, 32–34, 40–42.
import { describe, expect, it } from 'vitest';
import { bonusDannoEStruttura, condizioneSociale, meta, movimento, pfMassimi, pmMassimi, quinto, suggerimentoDenaro } from '../derived';

describe('derived — Metà e Quinto (§2)', () => {
  it('caso 13: Metà e Quinto di 70 → 35 / 14', () => {
    expect(meta(70)).toBe(35);
    expect(quinto(70)).toBe(14);
  });
});

describe('derived — Punti Ferita e Punti Magia (§3)', () => {
  it('caso 14: TAG 50, COS 50 → PF 10', () => {
    expect(pfMassimi(50, 50)).toBe(10);
  });

  it('caso 15: TAG 55, COS 60 → PF 11', () => {
    expect(pfMassimi(55, 60)).toBe(11);
  });

  it('caso 16: POT 40 → PM 8', () => {
    expect(pmMassimi(40)).toBe(8);
  });
});

describe('derived — Bonus al Danno e Struttura (§3.1)', () => {
  it('caso 17: FOR 60 + TAG 70 → BD +1D4, Struttura 1', () => {
    expect(bonusDannoEStruttura(60, 70)).toEqual({ bd: '1D4', struttura: 1 });
  });

  it('caso 18: FOR+TAG 64 / 65 / 84 / 85 / 124 / 125 → −2 / −1 / −1 / 0 / 0 / +1D4', () => {
    expect(bonusDannoEStruttura(0, 64).bd).toBe('-2');
    expect(bonusDannoEStruttura(0, 65).bd).toBe('-1');
    expect(bonusDannoEStruttura(0, 84).bd).toBe('-1');
    expect(bonusDannoEStruttura(0, 85).bd).toBe('0');
    expect(bonusDannoEStruttura(0, 124).bd).toBe('0');
    expect(bonusDannoEStruttura(0, 125).bd).toBe('1D4');
  });
});

describe('derived — Movimento (§3.2)', () => {
  it('caso 32: DES 65, FOR 50, TAG 55, età 31 → MOV 8', () => {
    expect(movimento(65, 50, 55, 31)).toBe(8);
  });

  it('caso 33: DES 40, FOR 40, TAG 60, età 25 → MOV 7', () => {
    expect(movimento(40, 40, 60, 25)).toBe(7);
  });

  it('caso 34: DES 70, FOR 70, TAG 50, età 45 → MOV 8 (9 − 1)', () => {
    expect(movimento(70, 70, 50, 45)).toBe(8);
  });
});

describe('derived — Valore di Credito e denaro (§4.3)', () => {
  it('caso 40: VdC 35 → contanti 70 $, beni 1.750 $, spesa 10 $, "Medio"', () => {
    const d = suggerimentoDenaro(35);
    expect(d.contanti).toBe(70);
    expect(d.beni).toBe(1750);
    expect(d.spesaGiornaliera).toBe(10);
    expect(condizioneSociale(35)).toBe('Medio');
  });

  it('caso 41: VdC 60 → contanti 300 $, beni 12.000 $, spesa 30 $, "Benestante"', () => {
    const d = suggerimentoDenaro(60);
    expect(d.contanti).toBe(300);
    expect(d.beni).toBe(12_000);
    expect(d.spesaGiornaliera).toBe(30);
    expect(condizioneSociale(60)).toBe('Benestante');
  });

  it('caso 42: VdC 0 / VdC 99 → 0,50 $ e nessun bene / 50.000 $ e 5.000.000 $ o più', () => {
    const d0 = suggerimentoDenaro(0);
    expect(d0.contanti).toBe(0.5);
    expect(d0.beni).toBe(0);

    const d99 = suggerimentoDenaro(99);
    expect(d99.contanti).toBe(50_000);
    expect(d99.beni).toBe(5_000_000);
    expect(d99.beniOPiu).toBe(true);
  });
});
