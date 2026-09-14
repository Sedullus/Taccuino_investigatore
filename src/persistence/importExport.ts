// Export/import JSON validati, con controllo di versioneSchema e migrazioni (§13).

import type { Investigatore } from '../rules/types';
import { applicaMigrazioni } from './migrazioni';
import { VERSIONE_SCHEMA_CORRENTE, investigatoreSchema } from './schema';

export function esportaJSON(investigatore: Investigatore): string {
  return JSON.stringify(investigatore, null, 2);
}

export type RisultatoImport = { ok: true; investigatore: Investigatore } | { ok: false; errore: string };

export function importaJSON(testo: string): RisultatoImport {
  let dati: unknown;
  try {
    dati = JSON.parse(testo);
  } catch {
    return { ok: false, errore: 'Questo file non è un JSON leggibile.' };
  }
  if (typeof dati !== 'object' || dati === null || Array.isArray(dati)) {
    return { ok: false, errore: 'Questo file non è una scheda leggibile.' };
  }
  const record = dati as Record<string, unknown>;
  const versione = record.versioneSchema;
  if (typeof versione !== 'number') {
    return { ok: false, errore: 'Manca il numero di versione dello schema.' };
  }
  if (versione > VERSIONE_SCHEMA_CORRENTE) {
    return { ok: false, errore: 'Il file è più recente di quello che questa scheda sa leggere.' };
  }
  const migrato = applicaMigrazioni(record, versione);
  const risultato = investigatoreSchema.safeParse(migrato);
  if (!risultato.success) {
    return { ok: false, errore: 'Questo file non è una scheda leggibile.' };
  }
  return { ok: true, investigatore: risultato.data as Investigatore };
}
