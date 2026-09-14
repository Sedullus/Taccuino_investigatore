// Stato del Pannello di tiro (§5), indipendente dallo store principale
// così da restare facile da testare e da estendere in Fase 2 (combattimento).

import type { Difficolta, Investigatore, Livello, TipoTiro } from '../rules/types';

export interface ConseguenzaTiro {
  condizione: keyof Investigatore['condizioni'];
  /** true se la condizione scatta quando il tiro riesce, false se scatta quando fallisce. */
  alSuccesso: boolean;
}

export interface TiroInCorso {
  tipo: TipoTiro;
  nome: string;
  /** Valore dell'abilità/caratteristica/arma usata per il tiro. */
  valore: number;
  skillId?: string;
  armaId?: string;
  /** Tiro COS/INT conseguente a un danno o a una perdita di SAN (§7, §8). */
  conseguenza?: ConseguenzaTiro;
  difficolta: Difficolta;
  /** Dadi bonus (positivo) o penalità (negativo), già nettizzati −2…+2. */
  dadiNetti: number;
  fisico: boolean;
  forzato: boolean;
  fortunaSpesa?: number;
  esito?: {
    roll: number;
    obiettivo: number;
    livello: Livello;
    riuscito: boolean;
    decine?: number[];
    unita?: number;
    sceltaIndex?: number;
  };
}

export function creaTiro(base: Omit<TiroInCorso, 'difficolta' | 'dadiNetti' | 'fisico' | 'forzato'>): TiroInCorso {
  return { ...base, difficolta: 'normale', dadiNetti: 0, fisico: false, forzato: false };
}
