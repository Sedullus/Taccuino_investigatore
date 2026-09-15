// Catalogo abilità anni '20 [MB] §4.2 — non numerato tra i 43 casi, ma coperto
// per rispettare "ogni regola marcata [RI]/[MB] ha almeno un test".
import { describe, expect, it } from 'vitest';
import type { Abilita, Arma } from '../types';
import {
  ABILITA_BASE,
  ABILITA_MULTI_ISTANZA,
  ABILITA_NON_COMUNI,
  NON_SPUNTABILI,
  abilitaMancantiPerArmi,
  abilitaSchedaNuova,
  nomeConSpecializzazione,
} from '../skills1920';

function armaDiProva(abilitaCollegata: string): Arma {
  return {
    id: 'x',
    nome: 'Arma di prova',
    abilitaCollegata,
    danno: '1D6',
    tipo: 'contundente',
    bdMode: 'completo',
    gittataBase: 'contatto',
    attacchiPerRound: 1,
    caricatore: 0,
    munizioni: 0,
    malfunzionamento: 100,
    inceppata: false,
  };
}

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

  describe('abilitaMancantiPerArmi — riconciliazione armi/abilità', () => {
    it('propone Armi da Fuoco (Fucile/Shotgun) a base 25 se un arma la richiede e non è sulla scheda', () => {
      const abilita: Abilita[] = [];
      const armi: Arma[] = [armaDiProva('Armi da Fuoco (Fucile/Shotgun)')];
      const mancanti = abilitaMancantiPerArmi(abilita, armi);
      expect(mancanti).toHaveLength(1);
      expect(mancanti[0]).toMatchObject({
        nome: 'Armi da Fuoco (Fucile/Shotgun)',
        radice: 'Armi da Fuoco',
        specializzazione: 'Fucile/Shotgun',
        base: 25,
        valore: 25,
      });
    });

    it('non propone nulla se l\'abilità collegata è già sulla scheda', () => {
      const abilita: Abilita[] = [
        { id: '1', nome: 'Combattere (Rissa)', radice: 'Combattere', specializzazione: 'Rissa', base: 25, valore: 25, spunta: false, preferita: false, nonSpuntabile: false },
      ];
      const armi: Arma[] = [armaDiProva('Combattere (Rissa)')];
      expect(abilitaMancantiPerArmi(abilita, armi)).toHaveLength(0);
    });

    it('non duplica se più armi condividono la stessa abilità mancante', () => {
      const armi: Arma[] = [armaDiProva('Armi da Fuoco (Pistola)'), armaDiProva('Armi da Fuoco (Pistola)')];
      expect(abilitaMancantiPerArmi([], armi)).toHaveLength(1);
    });

    it('ignora un abilitaCollegata che non corrisponde a nessuna voce del catalogo multi-istanza', () => {
      const armi: Arma[] = [armaDiProva('Qualcosa di inventato')];
      expect(abilitaMancantiPerArmi([], armi)).toHaveLength(0);
    });
  });

  describe('abilitaSchedaNuova — precompilazione di una scheda nuova', () => {
    it('include tutte le abilità a istanza singola, a valore base e non allenate', () => {
      const abilita = abilitaSchedaNuova();
      for (const voce of ABILITA_BASE) {
        const trovata = abilita.find((a) => a.nome === voce.nome);
        expect(trovata).toMatchObject({ base: voce.base, valore: voce.base, spunta: false, preferita: false });
      }
    });

    it('include Combattere (Rissa) e le due Armi da Fuoco più comuni, a valore base', () => {
      const abilita = abilitaSchedaNuova();
      expect(abilita.find((a) => a.nome === 'Combattere (Rissa)')).toMatchObject({ base: 25, valore: 25 });
      expect(abilita.find((a) => a.nome === 'Armi da Fuoco (Pistola)')).toMatchObject({ base: 20, valore: 20 });
      expect(abilita.find((a) => a.nome === 'Armi da Fuoco (Fucile/Shotgun)')).toMatchObject({ base: 25, valore: 25 });
    });

    it('non include specializzazioni multi-istanza senza un default (es. Arti e Mestieri, Scienza)', () => {
      const abilita = abilitaSchedaNuova();
      expect(abilita.some((a) => a.radice === 'Arti e Mestieri')).toBe(false);
      expect(abilita.some((a) => a.radice === 'Scienza')).toBe(false);
    });

    it('ogni id è unico', () => {
      const abilita = abilitaSchedaNuova();
      expect(new Set(abilita.map((a) => a.id)).size).toBe(abilita.length);
    });
  });
});
