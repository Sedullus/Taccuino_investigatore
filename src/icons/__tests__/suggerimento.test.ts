// Casi di test §11, righe 1–15 (suggerimento automatico).
import { describe, expect, it } from 'vitest';
import { punteggioVoce, suggerisciIcone } from '../suggerimento';
import { trovaVoce } from '../catalogo';

function primi(nome: string, contesto?: Parameters<typeof suggerisciIcone>[1]) {
  return suggerisciIcone(nome, contesto).map((v) => v.id);
}

describe('suggerimento icone — casi §11', () => {
  it('caso 1: "Revolver .38" → il revolver primo tra i suggerimenti', () => {
    expect(primi('Revolver .38')[0]).toBe('revolver');
  });

  it('caso 2: "revolver 38" senza punto → stesso risultato', () => {
    expect(primi('revolver 38')[0]).toBe('revolver');
  });

  it('caso 3: "Rivoltella" → il revolver primo', () => {
    expect(primi('Rivoltella')[0]).toBe('revolver');
  });

  it('caso 4: "Colt M1911" → pistola semiautomatica prima', () => {
    expect(primi('Colt M1911')[0]).toBe('pistola-semiautomatica');
  });

  it('caso 5: "Fucile a canne mozze" → canne mozze prima, fucile a pompa dopo', () => {
    const risultato = primi('Fucile a canne mozze');
    expect(risultato[0]).toBe('fucile-canne-mozze');
    expect(risultato).toContain('fucile-a-pompa');
  });

  it('caso 6: "Thompson" → mitra primo', () => {
    expect(primi('Thompson')[0]).toBe('mitra');
  });

  it('caso 7: "Coltello a serramanico" → coltello primo', () => {
    expect(primi('Coltello a serramanico')[0]).toBe('coltello');
  });

  it('caso 8: "Bastone da passeggio" → bastone primo, randello dopo', () => {
    const risultato = primi('Bastone da passeggio');
    expect(risultato[0]).toBe('bastone-da-passeggio');
  });

  it('caso 9: "Senza armi" → pugno chiuso', () => {
    expect(primi('Senza armi')[0]).toBe('pugno-chiuso');
  });

  it('caso 10: "Molotov" → molotov prima', () => {
    expect(primi('Molotov')[0]).toBe('molotov');
  });

  it('caso 11: "Revolvre" (refuso) → il revolver ancora tra i suggerimenti', () => {
    expect(primi('Revolvre')).toContain('revolver');
  });

  it('caso 12: "Zzzz" → nessun suggerimento, si usa il ripiego', () => {
    expect(primi('Zzzz')).toEqual([]);
  });

  it('caso 13: abilità Combattere aggiunge punti a una voce di mischia (a parità di corrispondenza sul nome)', () => {
    const coltello = trovaVoce('coltello')!;
    const senzaAbilita = punteggioVoce(coltello, 'coltello', undefined);
    const conCombattere = punteggioVoce(coltello, 'coltello', 'mischia');
    const conArmiFuoco = punteggioVoce(coltello, 'coltello', 'fuoco');
    expect(conCombattere).toBe(senzaAbilita + 3);
    expect(conArmiFuoco).toBe(senzaAbilita);
  });
});
