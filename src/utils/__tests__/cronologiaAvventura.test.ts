import { describe, expect, it } from 'vitest';
import type { Avventura, SessioneAvventura } from '../../rules/types';
import { costruisciContestoAvventura, esportaCronologiaMd, nomeFileCronologia } from '../cronologiaAvventura';

function sessione(parziale: Partial<SessioneAvventura> & Pick<SessioneAvventura, 'id' | 'creata'>): SessioneAvventura {
  return { titolo: 'Sessione', data: '', luogo: '', testo: '', immagini: [], ...parziale };
}

function avventura(sessioni: SessioneAvventura[]): Avventura {
  return { id: 'av-1', titolo: 'Il faro sommerso', sessioni, creata: '2024-01-01T00:00:00.000Z' };
}

describe('cronologiaAvventura — contesto per il riassunto AI', () => {
  it('è vuoto per la prima sessione di un\'avventura', () => {
    const s1 = sessione({ id: 's1', creata: '2024-01-01T00:00:00.000Z', testo: 'Primo racconto.' });
    const contesto = costruisciContestoAvventura(avventura([s1]), 's1');
    expect(contesto).toBe('');
  });

  it('include per intero le sessioni precedenti, in ordine cronologico', () => {
    const s1 = sessione({ id: 's1', creata: '2024-01-01T00:00:00.000Z', titolo: 'Arrivo', testo: 'Siamo arrivati in città.' });
    const s2 = sessione({ id: 's2', creata: '2024-01-08T00:00:00.000Z', titolo: 'Indagini', testo: 'Abbiamo interrogato il farmacista.' });
    const contesto = costruisciContestoAvventura(avventura([s2, s1]), 's2');
    const posArrivo = contesto.indexOf('Arrivo');
    const posTesto = contesto.indexOf('Siamo arrivati in città.');
    expect(posArrivo).toBeGreaterThanOrEqual(0);
    expect(posTesto).toBeGreaterThan(posArrivo);
    expect(contesto).not.toContain('Indagini');
  });

  it('oltre il limite di sessioni complete, le più vecchie restano solo come titolo/data/luogo', () => {
    const sessioni: SessioneAvventura[] = [];
    for (let i = 1; i <= 7; i++) {
      sessioni.push(sessione({ id: `s${i}`, creata: `2024-01-0${i}T00:00:00.000Z`, titolo: `Sessione ${i}`, testo: `Racconto numero ${i}.` }));
    }
    const corrente = sessione({ id: 's8', creata: '2024-01-08T00:00:00.000Z', titolo: 'Sessione 8' });
    const contesto = costruisciContestoAvventura(avventura([...sessioni, corrente]), 's8', 3);

    // Le ultime 3 (5, 6, 7) per intero; le prime 4 (1-4) solo come titolo.
    expect(contesto).toContain('Racconto numero 5.');
    expect(contesto).toContain('Racconto numero 6.');
    expect(contesto).toContain('Racconto numero 7.');
    expect(contesto).not.toContain('Racconto numero 1.');
    expect(contesto).not.toContain('Racconto numero 4.');
    expect(contesto).toContain('Sessione 1');
  });
});

describe('cronologiaAvventura — esportazione .md', () => {
  it('include tutte le sessioni per intero, in ordine cronologico, con il titolo dell\'avventura', () => {
    const s1 = sessione({ id: 's1', creata: '2024-01-01T00:00:00.000Z', titolo: 'Arrivo', data: '3 ottobre 1924', luogo: 'Innsmouth', testo: 'Racconto uno.' });
    const s2 = sessione({ id: 's2', creata: '2024-01-08T00:00:00.000Z', titolo: 'Indagini', testo: 'Racconto due.' });
    const md = esportaCronologiaMd(avventura([s2, s1]));

    expect(md).toContain('# Il faro sommerso');
    expect(md).toContain('Innsmouth');
    const posArrivo = md.indexOf('Arrivo');
    const posIndagini = md.indexOf('Indagini');
    expect(posArrivo).toBeGreaterThanOrEqual(0);
    expect(posIndagini).toBeGreaterThan(posArrivo);
    expect(md).toContain('Racconto uno.');
    expect(md).toContain('Racconto due.');
  });

  it('segnala la mancanza di sessioni senza andare in errore', () => {
    const md = esportaCronologiaMd(avventura([]));
    expect(md).toContain('nessuna sessione');
  });

  it('il nome del file non contiene caratteri non validi', () => {
    const nome = nomeFileCronologia({ ...avventura([]), titolo: 'Caccia: il segreto/della casa?' });
    expect(nome).not.toMatch(/[\\/:*?"<>|]/);
    expect(nome.endsWith('.md')).toBe(true);
  });
});
