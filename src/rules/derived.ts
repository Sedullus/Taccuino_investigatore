// Valori derivati: Metà/Quinto, PF/PM/SAN massimi, BD e Struttura, MOV,
// Schivare, Lingua Madre, Valore di Credito (§2, §3, §4.3).

import type { ChiaveOverride, Caratteristica } from './types';

export function meta(valore: number): number {
  return Math.floor(valore / 2);
}

export function quinto(valore: number): number {
  return Math.floor(valore / 5);
}

export function pfMassimi(TAG: number, COS: number): number {
  return Math.floor((TAG + COS) / 10);
}

export function pmMassimi(POT: number): number {
  return Math.floor(POT / 5);
}

export function sanMassima(mitiDiCthulhu: number): number {
  return 99 - mitiDiCthulhu;
}

export function schivareBase(DES: number): number {
  return Math.floor(DES / 2);
}

export function linguaMadreBase(IST: number): number {
  return IST;
}

export interface BonusDannoEStruttura {
  bd: string;
  struttura: number;
}

/**
 * Bonus al Danno e Struttura da FOR+TAG (§3.1). Oltre 364 ogni +80 aggiunge
 * +1D6 al BD e +1 alla Struttura, come da tabella [MB].
 */
export function bonusDannoEStruttura(FOR: number, TAG: number): BonusDannoEStruttura {
  const somma = FOR + TAG;
  if (somma <= 64) return { bd: '-2', struttura: -2 };
  if (somma <= 84) return { bd: '-1', struttura: -1 };
  if (somma <= 124) return { bd: '0', struttura: 0 };
  if (somma <= 164) return { bd: '1D4', struttura: 1 };
  if (somma <= 204) return { bd: '1D6', struttura: 2 };
  if (somma <= 284) return { bd: '2D6', struttura: 3 };
  if (somma <= 364) return { bd: '3D6', struttura: 4 };
  const passiOltre = Math.ceil((somma - 364) / 80);
  return { bd: `${3 + passiOltre}D6`, struttura: 4 + passiOltre };
}

/**
 * Movimento (§3.2). Le Regole Introduttive semplificano a 8 fisso: qui si
 * applica sempre il calcolo completo del Manuale Base, sovrascrivibile
 * tramite override come ogni altro valore derivato.
 */
export function movimento(DES: number, FOR: number, TAG: number, eta: number): number {
  let mov = 8;
  if (DES < TAG && FOR < TAG) mov = 7;
  else if (DES > TAG && FOR > TAG) mov = 9;
  if (eta >= 80) mov -= 5;
  else if (eta >= 70) mov -= 4;
  else if (eta >= 60) mov -= 3;
  else if (eta >= 50) mov -= 2;
  else if (eta >= 40) mov -= 1;
  return mov;
}

/** Applica un override manuale se presente, altrimenti ritorna il valore calcolato. */
export function applicaOverride(
  chiave: ChiaveOverride,
  override: Partial<Record<ChiaveOverride, number>>,
  calcolato: number,
): number {
  const v = override[chiave];
  return v != null ? v : calcolato;
}

export interface ValoriDerivati {
  pfMax: number;
  pmMax: number;
  sanMax: number;
  bd: string;
  struttura: number;
  mov: number;
  schivare: number;
}

/** Calcola tutti i valori derivati insieme, senza applicare eventuali override. */
export function calcolaDerivati(
  caratteristiche: Record<Caratteristica, number>,
  eta: number,
  mitiDiCthulhu: number,
): ValoriDerivati {
  const c = caratteristiche;
  const { bd, struttura } = bonusDannoEStruttura(c.FOR, c.TAG);
  return {
    pfMax: pfMassimi(c.TAG, c.COS),
    pmMax: pmMassimi(c.POT),
    sanMax: sanMassima(mitiDiCthulhu),
    bd,
    struttura,
    mov: movimento(c.DES, c.FOR, c.TAG, eta),
    schivare: schivareBase(c.DES),
  };
}

// ── Valore di Credito (§4.3) ────────────────────────────────────────────

interface FasciaVdc {
  max: number;
  condizione: string;
  livelloVita: string;
  spesaGiornaliera: number;
  moltContanti?: number;
  moltBeni?: number;
}

const FASCE_VDC: readonly FasciaVdc[] = [
  { max: 0, condizione: 'Squattrinato', livelloVita: 'Miserabile', spesaGiornaliera: 0.5 },
  { max: 9, condizione: 'Povero', livelloVita: 'Povero', spesaGiornaliera: 2, moltContanti: 1, moltBeni: 10 },
  { max: 49, condizione: 'Medio', livelloVita: 'Medio', spesaGiornaliera: 10, moltContanti: 2, moltBeni: 50 },
  { max: 89, condizione: 'Benestante', livelloVita: 'Benestante', spesaGiornaliera: 30, moltContanti: 5, moltBeni: 200 },
  { max: 98, condizione: 'Ricco', livelloVita: 'Ricco', spesaGiornaliera: 250, moltContanti: 20, moltBeni: 2000 },
  { max: 99, condizione: 'Nababbo', livelloVita: 'Sfacciatamente ricco', spesaGiornaliera: 5000 },
];

export function condizioneSociale(vdc: number): string {
  return (FASCE_VDC.find((f) => vdc <= f.max) ?? FASCE_VDC[FASCE_VDC.length - 1]!).condizione;
}

export interface SuggerimentoDenaro {
  livelloVita: string;
  condizioneSociale: string;
  spesaGiornaliera: number;
  contanti: number;
  /** true quando "beni" è un minimo indicativo ("5.000.000 $ o più"), non un valore esatto. */
  beniOPiu: boolean;
  beni: number;
}

/**
 * Suggerimento di contanti/beni dal Valore di Credito (§4.3). Il
 * moltiplicatore si applica al punteggio esatto di VdC, non al minimo della
 * fascia. I campi restano comunque modificabili a mano nella scheda.
 */
export function suggerimentoDenaro(vdc: number): SuggerimentoDenaro {
  const fascia = FASCE_VDC.find((f) => vdc <= f.max) ?? FASCE_VDC[FASCE_VDC.length - 1]!;
  if (vdc === 0) {
    return { livelloVita: fascia.livelloVita, condizioneSociale: fascia.condizione, spesaGiornaliera: fascia.spesaGiornaliera, beniOPiu: false, beni: 0, contanti: 0.5 };
  }
  if (vdc === 99) {
    return { livelloVita: fascia.livelloVita, condizioneSociale: fascia.condizione, spesaGiornaliera: fascia.spesaGiornaliera, beniOPiu: true, beni: 5_000_000, contanti: 50_000 };
  }
  const moltContanti = fascia.moltContanti ?? 0;
  const moltBeni = fascia.moltBeni ?? 0;
  return {
    livelloVita: fascia.livelloVita,
    condizioneSociale: fascia.condizione,
    spesaGiornaliera: fascia.spesaGiornaliera,
    beniOPiu: false,
    contanti: vdc * moltContanti,
    beni: vdc * moltBeni,
  };
}
