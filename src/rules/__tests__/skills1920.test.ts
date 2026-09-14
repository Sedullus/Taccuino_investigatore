// Catalogo abilità anni '20 [MB] §4.2 — non numerato tra i 43 casi, ma coperto
// per rispettare "ogni regola marcata [RI]/[MB] ha almeno un test".
import { describe, expect, it } from 'vitest';
import { ABILITA_BASE, ABILITA_MULTI_ISTANZA, ABILITA_NON_COMUNI, NON_SPUNTABILI, nomeConSpecializzazione } from '../skills1920';

describe('skills1920 — catalogo abilità (§4.2)', () => {
  it('valori base di riferimento', () => {
    const base = (nome: string) => ABILITA_BASE.find((a) => a.nome === nome)?.base;
    expect(base('Ascoltare')).toBe(20);
    expect(base('Individuare')).toBe(25);
    expect(base('Primo Soccorso')).toBe(30);
    expect(base('Miti di Cthulhu')).toBe(0);
    expect(base('Valore di Credito')).toBe(0);
  });

  it('Miti di Cthulhu e Valore di Credito non ricevono la spunta esperienza', () => {
    expect(NON_SPUNTABILI.has('Miti di Cthulhu')).toBe(true);
    expect(NON_SPUNTABILI.has('Valore di Credito')).toBe(true);
    expect(NON_SPUNTABILI.has('Ascoltare')).toBe(false);
  });

  it('Combattere (Rissa) e Armi da Fuoco (Pistola), non "Combattimento"', () => {
    const rissa = ABILITA_MULTI_ISTANZA['Combattere']?.find((s) => s.nome === 'Rissa');
    expect(rissa?.base).toBe(25);
    expect(nomeConSpecializzazione('Combattere', 'Rissa')).toBe('Combattere (Rissa)');
    const pistola = ABILITA_MULTI_ISTANZA['Armi da Fuoco']?.find((s) => s.nome === 'Pistola');
    expect(pistola?.base).toBe(20);
  });

  it('Pilotare è nella lista principale (multi-istanza), non tra le non comuni', () => {
    expect(ABILITA_MULTI_ISTANZA['Pilotare']?.length).toBeGreaterThan(0);
    expect(ABILITA_NON_COMUNI.some((a) => a.nome === 'Pilotare')).toBe(false);
  });

  it('le abilità non comuni includono Artiglieria e Ipnosi', () => {
    expect(ABILITA_NON_COMUNI.some((a) => a.nome === 'Artiglieria')).toBe(true);
    expect(ABILITA_NON_COMUNI.some((a) => a.nome === 'Ipnosi')).toBe(true);
  });
});
