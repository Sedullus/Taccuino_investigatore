// Sanità: tiro Sanità, perdita, controllo INT, Follia Indefinita, SAN a 0 (§7).

import { eSogliaDisastro } from './checks';
import type { ContestoBD } from './dice';
import { massimo, parseFormatoXY, tira, type GeneratoreCasuale } from './dice';

export interface EsitoTiroSanita {
  riuscito: boolean;
  disastro: boolean;
  /** Espressione di perdita applicabile (parte sinistra se riuscito, destra se fallito). */
  espressionePerdita: string;
}

/**
 * Tiro Sanità (§7): riesce se roll ≤ SAN attuale (obiettivo = SAN attuale,
 * come un tiro Normale). Con un Disastro si perde il massimo della parte a
 * destra invece di tirarla. Non si forza e non ammette spesa di Fortuna
 * (questi due vincoli sono applicati a monte, in checks.ts, passando
 * `tipo: 'sanita'`).
 */
export function valutaTiroSanita(sanAttuale: number, roll: number, formatoPerdita: string): EsitoTiroSanita {
  const { successo, fallimento } = parseFormatoXY(formatoPerdita);
  const riuscito = roll <= sanAttuale || roll === 1;
  const disastro = !riuscito && eSogliaDisastro(roll, sanAttuale);
  return { riuscito, disastro, espressionePerdita: riuscito ? successo : fallimento };
}

/** Applica la perdita di SAN del tiro Sanità, tirando (o massimizzando, con un Disastro) l'espressione. */
export function risolviPerditaSanita(esito: EsitoTiroSanita, bd: ContestoBD, rng: GeneratoreCasuale): { perdita: number; dettaglio: string } {
  if (esito.disastro) {
    const perdita = massimo(esito.espressionePerdita, bd);
    return { perdita, dettaglio: `Disastro · massimo ${esito.espressionePerdita} = ${perdita}` };
  }
  const { totale, dettaglio } = tira(esito.espressionePerdita, bd, rng);
  return { perdita: totale, dettaglio: dettaglio || String(totale) };
}

/** Una perdita di 5 o più punti in un solo tiro richiede un tiro INT (§7). */
export function richiedeTiroINT(perdita: number): boolean {
  return perdita >= 5;
}

/**
 * Esito del tiro INT dopo una grande perdita di SAN (§7): se riesce,
 * l'investigatore entra in Follia Temporanea per 1D10 ore (comprende
 * l'orrore appieno); se fallisce, non c'è follia immediata.
 */
export function follaTemporaneaDaINT(riuscitoTiroINT: boolean): boolean {
  return riuscitoTiroINT;
}

/**
 * Soglia di Follia Indefinita (§7): floor(SAN inizio giornata / 5)
 * [VERIFICA arrotondamento — risolto con floor, vedi docs/decisioni.md].
 */
export function sogliaFolliaIndefinita(sanInizioGiornata: number): number {
  return Math.floor(sanInizioGiornata / 5);
}

export function eFolliaIndefinita(perditaCumulataGiorno: number, sanInizioGiornata: number): boolean {
  return perditaCumulataGiorno >= sogliaFolliaIndefinita(sanInizioGiornata);
}

/** SAN a 0 → Follia Permanente (§7). */
export function eFolliaPermanente(san: number): boolean {
  return san <= 0;
}
