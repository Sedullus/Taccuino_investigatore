// Combattimento: ordine di DES, colpi multipli, gittata ravvicinata,
// danno estremo, manovre e Struttura (§10).
//
// Nota di implementazione: il campo `danno` di un'arma contiene solo
// l'espressione dei dadi propri dell'arma (es. "1D6"), senza il token BD.
// Il Bonus al Danno si applica sempre come termine separato, secondo
// `bdMode` (§10.2) — è l'unica lettura che rende corretta la formula del
// danno estremo (§10.4, casi di test 23 e 24): se il BD fosse incorporato
// nella stringa via token "+BD" si rischierebbe di contarlo due volte nel
// danno estremo delle armi contundenti. Il parser di dice.ts continua a
// supportare i token BD/½BD per le espressioni libere (§5.9), ma le
// funzioni di questo file non li richiedono nel campo danno dell'arma.

import type { ContestoBD } from './dice';
import { massimo, tira, type GeneratoreCasuale } from './dice';
import type { ModalitaBD, TipoDanno } from './types';

/** DES per l'ordine di turno: con un'arma da fuoco pronta si somma 50 (§10.1). */
export function desPerIniziativa(DES: number, armaFuocoPronta: boolean): number {
  return armaFuocoPronta ? DES + 50 : DES;
}

/** Con 2 o 3 colpi in un round, ogni colpo prende un dado penalità (§10.3). */
export function dadoPerColpiMultipli(colpiPerRound: number): number {
  return colpiPerRound >= 2 ? -1 : 0;
}

/**
 * Gittata ravvicinata in piedi (§10.3): DES/5, dipende dal tiratore, non
 * dall'arma. Il calcolo resta in piedi; la conversione in metri è solo di
 * presentazione (fattore ~0,3 m/piede, come indicato esplicitamente dalla
 * specifica — non i 0,3048 m esatti — per restare coerenti con l'esempio "12
 * piedi ≈ 3,6 m").
 */
export function gittataRavvicinataPiedi(DES: number): number {
  return DES / 5;
}

export function piediInMetriApprossimati(piedi: number): number {
  return piedi * 0.3;
}

/** L'arma è inceppata se il tiro è pari o superiore al valore di malfunzionamento (§10.3). */
export function eMalfunzionamento(roll: number, valoreMalfunzionamento: number): boolean {
  return roll >= valoreMalfunzionamento;
}

/** Il contesto BD "effettivo" da applicare all'arma, secondo `bdMode` (§10.2). */
export function contestoBDPerModalita(bd: ContestoBD, modalita: ModalitaBD): ContestoBD {
  if (modalita === 'nessuno') return { full: '0', half: '0' };
  if (modalita === 'metà') return { full: bd.half, half: bd.half };
  return bd;
}

const CONTESTO_NULLO: ContestoBD = { full: '0', half: '0' };

/** Danno normale (§10.4): si tira l'espressione dell'arma e si aggiunge il BD effettivo. */
export function dannoNormale(espressioneDanno: string, bdEffettivo: ContestoBD, rng: GeneratoreCasuale): { totale: number; dettaglio: string } {
  const daArma = tira(espressioneDanno, CONTESTO_NULLO, rng);
  if (bdEffettivo.full === '0') return daArma;
  const daBD = tira(bdEffettivo.full, CONTESTO_NULLO, rng);
  return { totale: Math.max(0, daArma.totale + daBD.totale), dettaglio: `${daArma.dettaglio} + BD ${daBD.dettaglio || daBD.totale}` };
}

export interface DannoEstremo {
  /** Massimo del danno dell'arma + massimo del BD effettivo. */
  base: number;
  /** Solo per armi che trafiggono: espressione del danno dell'arma da tirare di nuovo. */
  espressioneExtra?: string;
}

/**
 * Danno estremo (§10.4): livello Estremo o Critico sull'attacco.
 * - contundenti: massimo(danno) + massimo(BD);
 * - trafiggenti: massimo(danno) + massimo(BD) + un ulteriore tiro del danno dell'arma.
 * Il totale non scende mai sotto 0 [VERIFICA §10.4 — vedi docs/decisioni.md]:
 * la clamp è già in `massimo`/`tira` di dice.ts, ereditata qui.
 */
export function dannoEstremo(espressioneDanno: string, tipo: TipoDanno, bdEffettivo: ContestoBD): DannoEstremo {
  const base = massimo(espressioneDanno, CONTESTO_NULLO) + massimo(bdEffettivo.full, CONTESTO_NULLO);
  if (tipo === 'trafigge') return { base, espressioneExtra: espressioneDanno };
  return { base };
}

/** Risolve anche il tiro aggiuntivo del danno estremo per un'arma che trafigge. */
export function risolviDannoEstremo(
  espressioneDanno: string,
  tipo: TipoDanno,
  bdEffettivo: ContestoBD,
  rng: GeneratoreCasuale,
): { totale: number; dettaglio: string } {
  const { base, espressioneExtra } = dannoEstremo(espressioneDanno, tipo, bdEffettivo);
  if (!espressioneExtra) return { totale: base, dettaglio: `massimo ${base}` };
  const extra = tira(espressioneExtra, CONTESTO_NULLO, rng);
  return { totale: Math.max(0, base + extra.totale), dettaglio: `massimo ${base} + ${espressioneExtra} (${extra.totale})` };
}

export interface EsitoManovra {
  dadiPenalita: number;
  inefficace: boolean;
}

/**
 * Manovra contro la Struttura dell'avversario (§10.5): un dado penalità per
 * ogni punto di differenza (fino a 2), inefficace da 3 in su.
 */
export function esitoManovra(strutturaPropria: number, strutturaAvversario: number): EsitoManovra {
  const diff = strutturaAvversario - strutturaPropria;
  if (diff <= 0) return { dadiPenalita: 0, inefficace: false };
  if (diff >= 3) return { dadiPenalita: 0, inefficace: true };
  return { dadiPenalita: diff, inefficace: false };
}
