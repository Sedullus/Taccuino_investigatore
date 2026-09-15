// Risoluzione della resa "ricca" o "piana" in base alla dimensione (§3).

export type Dettaglio = 'auto' | 'ricco' | 'piano';
export type DettaglioRisolto = 'ricco' | 'piano';

/** Sopra i 32px: resa ricca (default). A 32px o meno: resa piana (default). */
export function risolviDettaglio(dettaglio: Dettaglio, dimensione: number): DettaglioRisolto {
  if (dettaglio !== 'auto') return dettaglio;
  return dimensione > 32 ? 'ricco' : 'piano';
}
