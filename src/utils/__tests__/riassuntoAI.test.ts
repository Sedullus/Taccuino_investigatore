import { describe, expect, it } from 'vitest';
import { analizzaRiassunto, ETICHETTE_SEZIONI_RIASSUNTO_FINALE } from '../riassuntoAI';

describe('riassuntoAI — analizzaRiassunto', () => {
  it('divide il testo nelle quattro sezioni etichettate', () => {
    const testo = [
      'NARRAZIONE: Siamo arrivati a Innsmouth e abbiamo parlato col farmacista.',
      'INDIZI:',
      '- Un libro con simboli strani',
      '- Rumori dal porto di notte',
      'PERSONAGGI:',
      '- Il farmacista Zadok',
      'FILONI APERTI:',
      '- Chi si incontra al porto?',
    ].join('\n');

    const sezioni = analizzaRiassunto(testo);
    expect(sezioni.map((s) => s.titolo)).toEqual(['NARRAZIONE', 'INDIZI', 'PERSONAGGI', 'FILONI APERTI']);
    expect(sezioni[0].corpo).toContain('Innsmouth');
    expect(sezioni[1].corpo).toContain('Un libro con simboli strani');
    expect(sezioni[1].corpo).toContain('Rumori dal porto di notte');
    expect(sezioni[2].corpo).toContain('Zadok');
    expect(sezioni[3].corpo).toContain('porto');
  });

  it('ripiega su un\'unica sezione RIASSUNTO se il formato non viene rispettato', () => {
    const sezioni = analizzaRiassunto('Un riassunto scritto in prosa libera, senza etichette.');
    expect(sezioni).toHaveLength(1);
    expect(sezioni[0].titolo).toBe('RIASSUNTO');
    expect(sezioni[0].corpo).toContain('prosa libera');
  });

  it('accetta etichette senza distinguere maiuscole/minuscole', () => {
    const sezioni = analizzaRiassunto('Narrazione: Prova.\nIndizi:\n- Nessuno');
    expect(sezioni.map((s) => s.titolo)).toEqual(['NARRAZIONE', 'INDIZI']);
  });
});

describe('riassuntoAI — analizzaRiassunto con le etichette del riassunto finale', () => {
  it('riconosce le sezioni del riassunto finale', () => {
    const testo = [
      'TRAMA: Gli investigatori arrivano a Innsmouth.',
      'Scoprono il culto e fuggono.',
      'PERSONAGGI:',
      '- Zadok Allen: farmacista, li aiuta.',
      'LUOGHI E OGGETTI:',
      '- Il faro: covo del culto.',
      'MISTERI SVELATI:',
      '- Il culto esiste.',
      'QUESTIONI APERTE:',
      '- Che fine ha fatto Zadok?',
    ].join('\n');
    const sezioni = analizzaRiassunto(testo, ETICHETTE_SEZIONI_RIASSUNTO_FINALE);
    expect(sezioni.map((s) => s.titolo)).toEqual(['TRAMA', 'PERSONAGGI', 'LUOGHI E OGGETTI', 'MISTERI SVELATI', 'QUESTIONI APERTE']);
    expect(sezioni[0].corpo).toContain('fuggono');
  });

  it('non confonde le etichette del riassunto di sessione con quelle del finale', () => {
    const sezioni = analizzaRiassunto('NARRAZIONE: testo di sessione.', ETICHETTE_SEZIONI_RIASSUNTO_FINALE);
    expect(sezioni).toEqual([{ titolo: 'RIASSUNTO', corpo: 'NARRAZIONE: testo di sessione.' }]);
  });
});
