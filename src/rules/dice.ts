// Dadi: lettura del D100, dadi bonus/penalità, parser di espressioni (§5.1, 5.2, 5.9).

/** Genera un intero uniforme tra 1 e facce (incluso). Iniettabile per test deterministici. */
export type GeneratoreCasuale = (facce: number) => number;

export const generatoreDefault: GeneratoreCasuale = (facce) => {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return (arr[0] % facce) + 1;
};

/**
 * Lettura del D100 (§5.1): la decina è il valore del dado delle decine
 * (0, 10, 20, … 90 — "00" si passa come 0), l'unità è il dado 0–9.
 * decina 0 e unità 0 vale 100, non 0.
 */
export function leggiD100(decina: number, unita: number): number {
  if (decina === 0 && unita === 0) return 100;
  return decina + unita;
}

/**
 * Applica dadi bonus/penalità (§5.2): ogni dado bonus o penalità tira una
 * decina aggiuntiva; l'unità resta una sola. Con i bonus si tiene il valore
 * combinato minore, con le penalità il maggiore. netDadi è già il netto
 * bonus−penalità, limitato altrove all'intervallo −2…+2.
 */
export function combinaDadi(unita: number, decine: readonly number[], netDadi: number): { scelto: number; valori: number[] } {
  const valori = decine.map((d) => leggiD100(d, unita));
  let scelto = valori[0]!;
  if (netDadi > 0) scelto = Math.min(...valori);
  else if (netDadi < 0) scelto = Math.max(...valori);
  return { scelto, valori };
}

/** Bonus e penalità si annullano a vicenda; il netto è limitato a −2…+2 (§5.2). */
export function nettoBonusPenalita(dadiBonus: number, dadiPenalita: number): number {
  const netto = dadiBonus - dadiPenalita;
  return Math.max(-2, Math.min(2, netto));
}

/** Tira un D100 con dadi bonus/penalità netti, usando il generatore fornito. */
export function tiraD100Con(rng: GeneratoreCasuale, netDadi: number): { unita: number; decine: number[]; valori: number[]; scelto: number } {
  const unita = rng(10) - 1;
  const numeroDecine = Math.abs(netDadi) + 1;
  const decine: number[] = [];
  for (let i = 0; i < numeroDecine; i++) decine.push((rng(10) - 1) * 10);
  const { scelto, valori } = combinaDadi(unita, decine, netDadi);
  return { unita, decine, valori, scelto };
}

export interface ContestoBD {
  /** Espressione del BD pieno, es. "1D4", "0". */
  full: string;
  /** Espressione di metà BD, es. "1D2". */
  half: string;
}

/** BD nullo o negativo: non c'è "metà" da tirare, vale 0. */
export function metaBD(bdFull: string): string {
  if (bdFull === '0' || bdFull.startsWith('-')) return '0';
  if (bdFull === '1D4') return '1D2';
  if (bdFull === '1D6') return '1D3';
  const m = /^(\d+)D6$/i.exec(bdFull);
  if (m) {
    const n = parseInt(m[1]!, 10);
    const meta = Math.max(1, Math.floor(n / 2));
    return `${meta}D6`;
  }
  return bdFull;
}

/**
 * Formato "successo/fallimento" (§5.9), es. "0/1D6". Se non c'è '/', l'intera
 * espressione vale sia per il successo sia per il fallimento (usato altrove,
 * es. danno delle armi, dove il formato x/y non si applica).
 */
export function parseFormatoXY(expr: string): { successo: string; fallimento: string } {
  const i = expr.indexOf('/');
  if (i === -1) return { successo: expr, fallimento: expr };
  return { successo: expr.slice(0, i).trim(), fallimento: expr.slice(i + 1).trim() };
}

function sostituisciTokenBD(expr: string, bd: ContestoBD): string {
  return expr.replace(/½BD/gi, bd.half).replace(/\bBD\b/gi, bd.full);
}

interface Termine {
  negativo: boolean;
  numeroDadi?: number;
  facce?: number;
  costante?: number;
}

function scomponi(espressioneSostituita: string): Termine[] {
  const parti = espressioneSostituita.split(/(?=[+-])/);
  const termini: Termine[] = [];
  for (const raw of parti) {
    const t = raw.trim();
    if (!t || t === '+' || t === '-') continue;
    const senzaPiu = t.replace(/^\+/, '');
    const negativo = senzaPiu.startsWith('-');
    const corpo = senzaPiu.replace(/^-/, '').trim();
    if (!corpo) continue;
    const dado = /^(\d*)[dD](\d+)$/.exec(corpo);
    if (dado) {
      termini.push({ negativo, numeroDadi: dado[1] ? parseInt(dado[1], 10) : 1, facce: parseInt(dado[2]!, 10) });
    } else if (!isNaN(parseInt(corpo, 10))) {
      termini.push({ negativo, costante: parseInt(corpo, 10) });
    }
  }
  return termini;
}

/**
 * Tira l'espressione (NdX, costanti, +/−, BD, ½BD) usando il generatore fornito.
 * Il totale non scende mai sotto 0 [VERIFICA §10.4 — vedi docs/decisioni.md]:
 * la clamp è qui in modo che tutte le funzioni di combat.ts la ereditino.
 */
export function tira(expr: string, bd: ContestoBD, rng: GeneratoreCasuale): { totale: number; dettaglio: string } {
  const sostituita = sostituisciTokenBD(expr, bd);
  const termini = scomponi(sostituita);
  let totale = 0;
  const dettagli: string[] = [];
  for (const t of termini) {
    if (t.numeroDadi != null && t.facce != null) {
      let somma = 0;
      for (let i = 0; i < t.numeroDadi; i++) somma += rng(t.facce);
      totale += t.negativo ? -somma : somma;
      dettagli.push(`${t.negativo ? '-' : ''}${t.numeroDadi}D${t.facce}=${somma}`);
    } else if (t.costante != null) {
      totale += t.negativo ? -t.costante : t.costante;
      dettagli.push(`${t.negativo ? '-' : ''}${t.costante}`);
    }
  }
  return { totale: Math.max(0, totale), dettaglio: dettagli.join(' ') };
}

/** Il massimo possibile dell'espressione (usato per il danno estremo, §10.4). */
export function massimo(expr: string, bd: ContestoBD): number {
  const sostituita = sostituisciTokenBD(expr, bd);
  const termini = scomponi(sostituita);
  let totale = 0;
  for (const t of termini) {
    if (t.numeroDadi != null && t.facce != null) {
      const somma = t.numeroDadi * t.facce;
      totale += t.negativo ? -somma : somma;
    } else if (t.costante != null) {
      totale += t.negativo ? -t.costante : t.costante;
    }
  }
  return Math.max(0, totale);
}
