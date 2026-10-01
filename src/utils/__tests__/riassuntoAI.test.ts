import { describe, expect, it } from 'vitest';
import { analizzaRiassunto } from '../riassuntoAI';

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
