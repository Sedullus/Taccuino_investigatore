// Livello ottenuto, esito, Disastro, tiro forzato, spesa di Fortuna, tiro Fortuna (§5.3–§5.7).

import type { Difficolta, Livello, TipoTiro } from './types';
import { ORDINE_LIVELLI } from './types';

export function obiettivoPer(valore: number, difficolta: Difficolta): number {
  if (difficolta === 'estremo') return Math.floor(valore / 5);
  if (difficolta === 'arduo') return Math.floor(valore / 2);
  return valore;
}

/**
 * Livello ottenuto dal tiro (§5.3): calcolato sempre sul valore pieno
 * dell'abilità, indipendentemente dalla difficoltà richiesta dal Custode —
 * è quest'ultima a decidere solo l'obiettivo per il successo/fallimento.
 */
export function livelloOttenuto(valore: number, roll: number): Livello {
  if (roll === 1) return 'CRITICO';
  if (roll <= Math.floor(valore / 5)) return 'ESTREMO';
  if (roll <= Math.floor(valore / 2)) return 'ARDUO';
  if (roll <= valore) return 'NORMALE';
  return 'FALLIMENTO';
}

/**
 * Soglia di Disastro (§5.3), calcolata sull'obiettivo della difficoltà
 * richiesta dal Custode, non sul valore pieno dell'abilità.
 */
export function eSogliaDisastro(roll: number, obiettivo: number): boolean {
  if (roll === 100) return true;
  return obiettivo < 50 && roll >= 96;
}

export interface EsitoTiro {
  valore: number;
  difficolta: Difficolta;
  obiettivo: number;
  roll: number;
  livello: Livello;
  riuscito: boolean;
}

/**
 * Esito completo di un tiro. Un Disastro non può mai sovrascrivere un
 * successo vero e proprio: l'ordine dei livelli (§5.3) lo pone come il
 * peggiore di tutti, quindi la soglia di Disastro si applica solo quando il
 * tiro sarebbe comunque un fallimento.
 */
export function valutaTiro(valore: number, roll: number, difficolta: Difficolta): EsitoTiro {
  const obiettivo = obiettivoPer(valore, difficolta);
  const riuscito = roll <= obiettivo || roll === 1;
  let livello = livelloOttenuto(valore, roll);
  if (!riuscito && eSogliaDisastro(roll, obiettivo)) livello = 'DISASTRO';
  return { valore, difficolta, obiettivo, roll, livello, riuscito };
}

/** Tiri contrastati (§5.4): vince il livello migliore, poi l'abilità più alta. */
export function confrontoRapido(
  livelloA: Livello,
  valoreA: number,
  livelloB: Livello,
  valoreB: number,
): 'A' | 'B' | 'pareggio' {
  const rangoA = ORDINE_LIVELLI.indexOf(livelloA);
  const rangoB = ORDINE_LIVELLI.indexOf(livelloB);
  if (rangoA !== rangoB) return rangoA > rangoB ? 'A' : 'B';
  if (valoreA !== valoreB) return valoreA > valoreB ? 'A' : 'B';
  return 'pareggio';
}

export interface EsitoConsentito {
  consentito: boolean;
  motivo?: string;
}

/** Tiro forzato (§5.5): solo su un fallimento di abilità/caratteristica, una sola volta. */
export function puoForzareTiro(tipo: TipoTiro, riuscito: boolean, giaForzato: boolean): EsitoConsentito {
  if (riuscito) return { consentito: false, motivo: 'Si forza solo un tiro fallito.' };
  if (giaForzato) return { consentito: false, motivo: 'Questo tiro è già stato forzato.' };
  if (tipo === 'attacco' || tipo === 'danno') return { consentito: false, motivo: 'I tiri di combattimento non si forzano.' };
  if (tipo === 'sanita') return { consentito: false, motivo: 'I tiri Sanità non si forzano.' };
  if (tipo === 'fortuna') return { consentito: false, motivo: 'I tiri Fortuna non si forzano.' };
  return { consentito: true };
}

export interface ContestoSpesaFortuna {
  tipo: TipoTiro;
  livello: Livello;
  forzato: boolean;
  spesaFortunaAbilitata: boolean;
  /** true se il tiro è (anche) una perdita di Sanità, oltre a un tiro Sanità vero e proprio. */
  perditaSanita?: boolean;
}

export interface EsitoSpesaFortuna extends EsitoConsentito {
  costo?: number;
}

/** Spesa di Fortuna (§5.6), regola opzionale. */
export function puoSpendereFortuna(esito: EsitoTiro, ctx: ContestoSpesaFortuna): EsitoSpesaFortuna {
  if (!ctx.spesaFortunaAbilitata) return { consentito: false, motivo: 'La spesa di Fortuna è disattivata nelle impostazioni.' };
  if (esito.riuscito) return { consentito: false, motivo: 'Il tiro è già un successo.' };
  if (esito.livello === 'DISASTRO') return { consentito: false, motivo: 'Su un Disastro la Fortuna non si spende: il tiro è già andato oltre il fallimento.' };
  if (ctx.tipo === 'sanita' || ctx.perditaSanita) return { consentito: false, motivo: 'Sui tiri Sanità e sulla perdita di SAN la Fortuna non si spende: la lucidità non si compra.' };
  if (ctx.tipo === 'fortuna') return { consentito: false, motivo: 'Non si spende Fortuna per superare un tiro Fortuna.' };
  if (ctx.tipo === 'danno') return { consentito: false, motivo: 'I tiri di danno non si comprano con la Fortuna.' };
  if (ctx.forzato) return { consentito: false, motivo: 'Il tiro è già stato forzato: la Fortuna non interviene due volte.' };
  if (ctx.tipo === 'attacco') return { consentito: false, motivo: 'Sui tiri di combattimento la Fortuna non si spende.' };
  const costo = esito.roll - esito.obiettivo;
  return { consentito: true, costo };
}

/** Tiro Fortuna (§5.7): riesce con un risultato pari o inferiore alla Fortuna attuale. */
export function esitoTiroFortuna(fortunaAttuale: number, roll: number): boolean {
  return roll <= fortunaAttuale;
}
