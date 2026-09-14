// Fase di sviluppo: +1D10 oltre soglia 95, +2D6 SAN al superamento di 90 (§6).

export interface EsitoSviluppo {
  aumenta: boolean;
  nuovoValore: number;
  /** true se il valore attraversa la soglia 90 salendo da sotto a 90 o più. */
  guadagnaSAN: boolean;
}

/**
 * Sviluppa una singola abilità spuntata (§6): si tira 1D100; se il
 * risultato è maggiore del valore attuale oppure maggiore di 95, l'abilità
 * guadagna l'aumento (già tirato, `aumentoD10`). Se il nuovo valore
 * raggiunge o supera 90 partendo da sotto, si guadagnano +2D6 SAN. La
 * spunta si toglie sempre, a monte, indipendentemente dall'esito.
 */
export function sviluppaAbilita(valoreAttuale: number, tiroD100: number, aumentoD10: number): EsitoSviluppo {
  const aumenta = tiroD100 > valoreAttuale || tiroD100 > 95;
  if (!aumenta) return { aumenta: false, nuovoValore: valoreAttuale, guadagnaSAN: false };
  const nuovoValore = valoreAttuale + aumentoD10;
  const guadagnaSAN = valoreAttuale < 90 && nuovoValore >= 90;
  return { aumenta: true, nuovoValore, guadagnaSAN };
}

/** Recupero di fine sessione della Fortuna, opzionale (§5.6): 1D100 > Fortuna attuale dà +1D10, massimo 99. */
export function recuperoFortuna(fortunaAttuale: number, tiroD100: number, guadagnoD10: number): { guadagna: boolean; nuovaFortuna: number } {
  if (tiroD100 <= fortunaAttuale) return { guadagna: false, nuovaFortuna: fortunaAttuale };
  return { guadagna: true, nuovaFortuna: Math.min(99, fortunaAttuale + guadagnoD10) };
}
