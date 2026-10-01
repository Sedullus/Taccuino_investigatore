// Cronologia di un'avventura (§ "Riassunto AI nel PDF"): costruita al volo
// dalle sessioni già scritte nel Taccuino, non da uno stato a parte che l'AI
// aggiornerebbe da sola — così non rischia mai di andare fuori sincrono da
// quello che l'utente ha scritto davvero. Usata per due scopi: dare
// all'AI il contesto delle sessioni precedenti quando genera il riassunto
// di una sessione, ed esportare la cronologia completa come file .md.

import type { Avventura, SessioneAvventura } from '../rules/types';

function sessioniInOrdine(avventura: Avventura): SessioneAvventura[] {
  return [...avventura.sessioni].sort((a, b) => a.creata.localeCompare(b.creata));
}

function voceSessione(sessione: SessioneAvventura, testoCompleto: boolean): string {
  const meta = [sessione.data, sessione.luogo].filter(Boolean).join(' · ');
  const intestazione = `## ${sessione.titolo}${meta ? ` (${meta})` : ''}`;
  if (!testoCompleto) return intestazione;
  const corpo = sessione.testo.trim() || '_(nessun racconto scritto per questa sessione)_';
  return `${intestazione}\n\n${corpo}`;
}

/**
 * Contesto per il riassunto AI della sessione `sessioneCorrenteId`: le
 * sessioni precedenti della stessa avventura (per data di creazione), le
 * ultime `limiteSessioniComplete` per intero, le altre solo come
 * titolo/data/luogo (per non far crescere senza limite il testo inviato
 * all'API su campagne lunghe). Stringa vuota se è la prima sessione.
 */
export function costruisciContestoAvventura(avventura: Avventura, sessioneCorrenteId: string, limiteSessioniComplete = 5): string {
  const ordinate = sessioniInOrdine(avventura);
  const indice = ordinate.findIndex((s) => s.id === sessioneCorrenteId);
  const precedenti = indice >= 0 ? ordinate.slice(0, indice) : ordinate.filter((s) => s.id !== sessioneCorrenteId);
  if (precedenti.length === 0) return '';

  const sogliaCompleta = Math.max(0, precedenti.length - limiteSessioniComplete);
  const voci = precedenti.map((s, i) => voceSessione(s, i >= sogliaCompleta));
  return `# Avanzamento di "${avventura.titolo}" (sessioni precedenti)\n\n${voci.join('\n\n')}`;
}

/** Cronologia completa dell'avventura per l'esportazione .md: tutte le sessioni per intero, in ordine cronologico. */
export function esportaCronologiaMd(avventura: Avventura): string {
  const ordinate = sessioniInOrdine(avventura);
  if (ordinate.length === 0) return `# ${avventura.titolo}\n\n_(nessuna sessione ancora registrata)_\n`;
  const voci = ordinate.map((s) => voceSessione(s, true));
  return `# ${avventura.titolo}\n\n${voci.join('\n\n---\n\n')}\n`;
}

export function nomeFileCronologia(avventura: Avventura): string {
  const pulito = avventura.titolo.trim().replace(/[\\/:*?"<>|]+/g, '-');
  return `${pulito || 'avventura'} - cronologia.md`;
}
