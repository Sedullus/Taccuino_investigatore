// Casi di test §14, righe 6–12, 35, 36, 38, 39.
import { describe, expect, it } from 'vitest';
import { livelloOttenuto, puoForzareTiro, puoSpendereFortuna, valutaTiro } from '../checks';

describe('checks — livello ottenuto ed esito (§5.3)', () => {
  it('caso 6: valore 55, tiro 45, difficoltà Normale → Normale, successo', () => {
    const esito = valutaTiro(55, 45, 'normale');
    expect(esito.livello).toBe('NORMALE');
    expect(esito.riuscito).toBe(true);
  });

  it('caso 7: valore 55, tiro 24 → Arduo', () => {
    expect(livelloOttenuto(55, 24)).toBe('ARDUO');
  });

  it('caso 8: valore 55, tiro 11 → Estremo', () => {
    expect(livelloOttenuto(55, 11)).toBe('ESTREMO');
  });

  it('caso 9: valore 55, tiro 1 → Critico', () => {
    expect(livelloOttenuto(55, 1)).toBe('CRITICO');
  });

  it('caso 10: valore 45, Normale, tiro 96 → Disastro', () => {
    expect(valutaTiro(45, 96, 'normale').livello).toBe('DISASTRO');
  });

  it('caso 11: valore 60, Normale, tiro 96 → Fallimento (non Disastro)', () => {
    expect(valutaTiro(60, 96, 'normale').livello).toBe('FALLIMENTO');
  });

  it('caso 12: valore 60, Arduo (obiettivo 30), tiro 97 → Disastro', () => {
    const esito = valutaTiro(60, 97, 'arduo');
    expect(esito.obiettivo).toBe(30);
    expect(esito.livello).toBe('DISASTRO');
  });

  it('un Disastro non può mai sovrascrivere un successo vero e proprio', () => {
    // valore 100, Normale (obiettivo 100): un tiro di 100 è un successo per obiettivo,
    // quindi non può anche essere un Disastro (§5.3: Disastro < Fallimento < ... < Critico).
    const esito = valutaTiro(100, 100, 'normale');
    expect(esito.riuscito).toBe(true);
    expect(esito.livello).not.toBe('DISASTRO');
  });
});

describe('checks — tiro forzato (§5.5)', () => {
  it('caso 36: tentativo di forzare un tiro di combattimento → operazione non consentita', () => {
    expect(puoForzareTiro('attacco', false, false).consentito).toBe(false);
  });

  it('non si forza un tiro riuscito, né uno già forzato, né Sanità/Fortuna', () => {
    expect(puoForzareTiro('abilita', true, false).consentito).toBe(false);
    expect(puoForzareTiro('abilita', false, true).consentito).toBe(false);
    expect(puoForzareTiro('sanita', false, false).consentito).toBe(false);
    expect(puoForzareTiro('fortuna', false, false).consentito).toBe(false);
    expect(puoForzareTiro('abilita', false, false).consentito).toBe(true);
  });
});

describe('checks — spesa di Fortuna (§5.6)', () => {
  it('caso 35: valore 40, tiro 45, Fortuna 50 → costo 5, successo senza spunta', () => {
    const esito = valutaTiro(40, 45, 'normale');
    expect(esito.riuscito).toBe(false);
    const spesa = puoSpendereFortuna(esito, { tipo: 'abilita', livello: esito.livello, forzato: false, spesaFortunaAbilitata: true });
    expect(spesa.consentito).toBe(true);
    expect(spesa.costo).toBe(5);
    const nuovaFortuna = 50 - (spesa.costo ?? 0);
    expect(nuovaFortuna).toBe(45);
  });

  it('caso 38: spesa di Fortuna su un Disastro → non consentita', () => {
    const esito = valutaTiro(45, 96, 'normale');
    expect(esito.livello).toBe('DISASTRO');
    const spesa = puoSpendereFortuna(esito, { tipo: 'abilita', livello: esito.livello, forzato: false, spesaFortunaAbilitata: true });
    expect(spesa.consentito).toBe(false);
  });

  it('caso 39: spesa di Fortuna su un tiro di danno o su un tiro Sanità → non consentita', () => {
    const esitoDanno = valutaTiro(0, 50, 'normale');
    const spesaDanno = puoSpendereFortuna(esitoDanno, { tipo: 'danno', livello: esitoDanno.livello, forzato: false, spesaFortunaAbilitata: true });
    expect(spesaDanno.consentito).toBe(false);

    const esitoSanita = valutaTiro(40, 41, 'normale');
    const spesaSanita = puoSpendereFortuna(esitoSanita, { tipo: 'sanita', livello: esitoSanita.livello, forzato: false, spesaFortunaAbilitata: true });
    expect(spesaSanita.consentito).toBe(false);
  });
});
