import { describe, expect, it } from 'vitest';
import type { Avventura, SessioneAvventura } from '../../rules/types';
import {
  cercaRiferimentiNomi,
  costruisciContestoAvventura,
  costruisciContestoCompleto,
  esportaCronologiaMd,
  estraiCandidatiNome,
  nomeFileCronologia,
} from '../cronologiaAvventura';

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

describe('cronologiaAvventura — riconoscimento nomi', () => {
  it('estraiCandidatiNome ignora la prima parola di ogni frase', () => {
    const candidati = estraiCandidatiNome('Il farmacista si chiama Zadok Allen. Zadok vive vicino al porto.');
    expect(candidati).toContain('Zadok Allen');
    expect(candidati).not.toContain('Il');
  });

  it('estraiCandidatiNome ordina per frequenza e rispetta il limite massimo', () => {
    const frasi = Array.from({ length: 10 }, (_, i) => `Oggi abbiamo incontrato Marco ${i === 0 ? 'e Luigi' : ''}.`);
    const candidati = estraiCandidatiNome(frasi.join(' '));
    expect(candidati[0]).toBe('Marco');
    expect(candidati.length).toBeLessThanOrEqual(8);
  });

  it('cercaRiferimentiNomi trova corrispondenze anche in sessioni molto precedenti', () => {
    const vecchie: SessioneAvventura[] = [];
    for (let i = 1; i <= 6; i++) {
      vecchie.push(sessione({ id: `s${i}`, creata: `2024-01-0${i}T00:00:00.000Z`, titolo: `Sessione ${i}`, testo: `Niente di rilevante qui.` }));
    }
    vecchie[0] = { ...vecchie[0], testo: 'Abbiamo conosciuto il farmacista Zadok Allen, molto reticente.' };
    const corrente = sessione({ id: 's7', creata: '2024-01-07T00:00:00.000Z', titolo: 'Sessione 7', testo: 'Zadok Allen ci ha dato un indizio.' });

    const riferimenti = cercaRiferimentiNomi(avventura([...vecchie, corrente]), 's7', ['Zadok Allen']);
    expect(riferimenti).toContain('Zadok Allen');
    expect(riferimenti).toContain('reticente');
  });

  it('cercaRiferimentiNomi è vuoto senza candidati o senza corrispondenze', () => {
    const s1 = sessione({ id: 's1', creata: '2024-01-01T00:00:00.000Z', testo: 'Racconto senza nomi particolari.' });
    expect(cercaRiferimentiNomi(avventura([s1]), 's1', [])).toBe('');
    expect(cercaRiferimentiNomi(avventura([s1]), 's1', ['NomeInesistente'])).toBe('');
  });

  it('costruisciContestoCompleto unisce il riepilogo recente e i riferimenti trovati', () => {
    const s1 = sessione({ id: 's1', creata: '2024-01-01T00:00:00.000Z', titolo: 'Arrivo', testo: 'Abbiamo conosciuto Zadok Allen al porto.' });
    const s2 = sessione({ id: 's2', creata: '2024-01-08T00:00:00.000Z', titolo: 'Ritorno', testo: 'Siamo tornati a cercare Zadok Allen.' });

    const contesto = costruisciContestoCompleto(avventura([s1, s2]), 's2');
    expect(contesto).toContain('Avanzamento di');
    expect(contesto).toContain('Riferimenti trovati nella cronologia');
    expect(contesto).toContain('Zadok Allen');
  });
});
