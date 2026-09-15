// Archivio su IndexedDB (idb-keyval): elenco investigatori, scheda attiva, ritratti.

import { createStore, del, get, keys, set } from 'idb-keyval';
import type { Investigatore } from '../rules/types';

const store = createStore('taccuino-investigatore', 'schede');
const CHIAVE_ATTIVO = 'investigatore-attivo';

function chiaveInvestigatore(id: string): string {
  return `investigatore:${id}`;
}

export async function salvaInvestigatore(investigatore: Investigatore): Promise<void> {
  await set(chiaveInvestigatore(investigatore.id), investigatore, store);
}

export async function caricaInvestigatore(id: string): Promise<Investigatore | undefined> {
  return get<Investigatore>(chiaveInvestigatore(id), store);
}

export async function eliminaInvestigatore(id: string): Promise<void> {
  await del(chiaveInvestigatore(id), store);
}

export async function elencaInvestigatori(): Promise<Investigatore[]> {
  const tutte = await keys(store);
  const idInvestigatori = tutte.filter((k): k is string => typeof k === 'string' && k.startsWith('investigatore:'));
  const investigatori = await Promise.all(idInvestigatori.map((k) => get<Investigatore>(k, store)));
  return investigatori.filter((i): i is Investigatore => i != null);
}

export async function leggiIdAttivo(): Promise<string | undefined> {
  return get<string>(CHIAVE_ATTIVO, store);
}

export async function scriviIdAttivo(id: string): Promise<void> {
  await set(CHIAVE_ATTIVO, id, store);
}

// ── Ritratti (§11, Fase 3): salvati separatamente dall'investigatore, come
// data URL, referenziati da anagrafica.ritratto (chiave di questo archivio). ──

export async function salvaRitratto(chiave: string, dataUrl: string): Promise<void> {
  await set(`ritratto:${chiave}`, dataUrl, store);
}

export async function leggiRitratto(chiave: string): Promise<string | undefined> {
  return get<string>(`ritratto:${chiave}`, store);
}

// ── Note manoscritte (§ "Note e indizi"): il disegno a mano libera, come il
// ritratto, salvato a parte e non incluso nel JSON di export. ──

export async function salvaManoscritto(chiave: string, dataUrl: string): Promise<void> {
  await set(`manoscritto:${chiave}`, dataUrl, store);
}

export async function leggiManoscritto(chiave: string): Promise<string | undefined> {
  return get<string>(`manoscritto:${chiave}`, store);
}

export async function eliminaManoscritto(chiave: string): Promise<void> {
  await del(`manoscritto:${chiave}`, store);
}
