// Migrazioni tra versioni dello schema. Vuoto finché esiste solo la
// versione 1: quando la versione 2 nascerà, si aggiunge qui il passo
// 1 → 2 senza toccare il resto dell'app.

import { VERSIONE_SCHEMA_CORRENTE } from './schema';

type PassoMigrazione = (dati: Record<string, unknown>) => Record<string, unknown>;

const MIGRAZIONI: Record<number, PassoMigrazione> = {};

export function applicaMigrazioni(dati: Record<string, unknown>, versioneIniziale: number): Record<string, unknown> {
  let corrente = dati;
  let v = versioneIniziale;
  while (v < VERSIONE_SCHEMA_CORRENTE) {
    const passo = MIGRAZIONI[v];
    if (!passo) break;
    corrente = passo(corrente);
    v += 1;
  }
  return corrente;
}
