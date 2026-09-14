import { describe, expect, it } from 'vitest';
import { creaAdeleMarchetti } from '../../data/adeleMarchetti';
import { esportaJSON, importaJSON } from '../importExport';

describe('persistence — export/import (definizione di fatto)', () => {
  it('round-trip: export seguito da import restituisce un investigatore identico', () => {
    const originale = creaAdeleMarchetti('adele-1');
    const risultato = importaJSON(esportaJSON(originale));
    expect(risultato.ok).toBe(true);
    if (risultato.ok) expect(risultato.investigatore).toEqual(originale);
  });

  it('rifiuta un JSON malformato', () => {
    const risultato = importaJSON('{ non è json');
    expect(risultato.ok).toBe(false);
  });

  it('rifiuta un file senza numero di versione dello schema', () => {
    const risultato = importaJSON(JSON.stringify({ nome: 'senza versione' }));
    expect(risultato.ok).toBe(false);
  });

  it('rifiuta un file con versione dello schema più recente di quella supportata', () => {
    const originale = creaAdeleMarchetti('adele-2');
    const troppoRecente = { ...originale, versioneSchema: 999 };
    const risultato = importaJSON(JSON.stringify(troppoRecente));
    expect(risultato.ok).toBe(false);
  });
});
