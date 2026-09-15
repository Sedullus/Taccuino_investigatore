// Casi di test §11, righe 16, 17, 19, 21.
import { describe, expect, it } from 'vitest';
import { CATALOGO_ICONE, trovaVoce } from '../catalogo';
import { CORPI_GAME_ICONS } from '../corpiCurati.generated';
import { CORPI_PROTAGONISTE } from '../corpiProtagoniste.generated';
import { risolviDettaglio } from '../dettaglio';

describe('dettaglio (§3)', () => {
  it('caso 16: richiesta a 24px → resa piana, senza tratteggio', () => {
    expect(risolviDettaglio('auto', 24)).toBe('piano');
  });

  it('caso 17: richiesta a 48px → resa ricca, con tratteggio', () => {
    expect(risolviDettaglio('auto', 48)).toBe('ricco');
  });

  it('32px esatti → resa piana (default a 32px o meno)', () => {
    expect(risolviDettaglio('auto', 32)).toBe('piano');
  });

  it('la resa forzata vince sempre sulla dimensione', () => {
    expect(risolviDettaglio('ricco', 24)).toBe('ricco');
    expect(risolviDettaglio('piano', 64)).toBe('piano');
  });
});

describe('catalogo (§4, §11 caso 19)', () => {
  it('caso 19: un identificativo sconosciuto non è nel catalogo (ripiego, nessun errore)', () => {
    expect(trovaVoce('id-completamente-inventato')).toBeUndefined();
  });

  it('caso 21: ogni nomeGameIcons del catalogo esiste nei corpi estratti', () => {
    const voci = CATALOGO_ICONE.filter((v) => v.sorgente === 'game-icons');
    expect(voci.length).toBeGreaterThan(0);
    for (const v of voci) {
      expect(v.nomeGameIcons).toBeTruthy();
      expect(CORPI_GAME_ICONS[v.nomeGameIcons!]).toBeDefined();
    }
  });

  it('ogni protagonista (Livello 2) ha un corpo disegnato corrispondente', () => {
    const protagoniste = CATALOGO_ICONE.filter((v) => v.sorgente === 'manuale' && v.id !== 'ripiego');
    expect(protagoniste.length).toBe(12);
    for (const v of protagoniste) {
      expect(CORPI_PROTAGONISTE[v.id]).toBeDefined();
    }
  });

  it('il ripiego non ha un corpo disegnato: usa sempre il segnaposto', () => {
    expect(CORPI_PROTAGONISTE['ripiego']).toBeUndefined();
    expect(CORPI_GAME_ICONS['ripiego']).toBeUndefined();
  });
});
