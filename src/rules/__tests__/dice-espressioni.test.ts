// Parser di espressioni di dado (§5.9): non numerato tra i 43 casi, ma
// esplicitamente richiesto dalla specifica ("Il parser deve supportare...").
import { describe, expect, it } from 'vitest';
import { massimo, metaBD, parseFormatoXY, tira } from '../dice';

const rngFisso = (v: number) => () => v;

describe('dice — parser di espressioni', () => {
  it('costanti e NdX semplici', () => {
    expect(tira('1D10', { full: '0', half: '0' }, rngFisso(7)).totale).toBe(7);
    expect(massimo('2D6+4', { full: '0', half: '0' })).toBe(16);
  });

  it('token BD e ½BD', () => {
    expect(tira('1D3+BD', { full: '4', half: '2' }, rngFisso(2)).totale).toBe(6);
    expect(tira('1D6+1+2D4', { full: '0', half: '0' }, rngFisso(1)).totale).toBe(1 + 1 + 1 + 1);
    expect(massimo('½BD', { full: '1D4', half: '1D2' })).toBe(2);
  });

  it('formato successo/fallimento "x/y"', () => {
    expect(parseFormatoXY('0/1D6')).toEqual({ successo: '0', fallimento: '1D6' });
    expect(parseFormatoXY('1D3/1D20')).toEqual({ successo: '1D3', fallimento: '1D20' });
    expect(parseFormatoXY('1D6')).toEqual({ successo: '1D6', fallimento: '1D6' });
  });

  it('il totale non scende mai sotto 0', () => {
    expect(tira('-5', { full: '0', half: '0' }, rngFisso(1)).totale).toBe(0);
  });

  it('metà BD segue la progressione ufficiale (1D4→1D2, ND6→⌊N/2⌋D6 min 1D6)', () => {
    expect(metaBD('1D4')).toBe('1D2');
    expect(metaBD('1D6')).toBe('1D3');
    expect(metaBD('2D6')).toBe('1D6');
    expect(metaBD('3D6')).toBe('1D6');
    expect(metaBD('4D6')).toBe('2D6');
    expect(metaBD('0')).toBe('0');
    expect(metaBD('-1')).toBe('0');
  });
});
