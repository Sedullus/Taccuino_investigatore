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

// ── Riconoscimento nomi (§ "Riassunto AI nel PDF"): un'euristica leggera,
// non un vero riconoscimento di entità — individua parole capitalizzate a
// metà frase come possibili nomi propri, poi cerca quegli stessi candidati
// per intero nella cronologia dell'avventura (non solo nelle sessioni
// recenti incluse da costruisciContestoAvventura). Tutto locale, nessuna
// chiamata di rete: solo gli estratti trovati vengono allegati al prompt,
// ed è il modello stesso a decidere cosa è davvero un nome pertinente e
// cosa è rumore — vedi docs/decisioni.md. ──

const MASSIMO_CANDIDATI = 8;
const MASSIMO_RIFERIMENTI_PER_NOME = 3;
const LUNGHEZZA_MASSIMA_ESTRATTO = 400;
const PAROLE_DA_IGNORARE = new Set(['Io', 'Tu', 'Lui', 'Lei', 'Noi', 'Voi', 'Loro', 'Dio', 'Dottor', 'Dottoressa', 'Signor', 'Signora', 'Signorina']);
const PATTERN_PAROLA_CAPITALIZZATA = /^[A-ZÀ-Ü][a-zà-ü'’-]{2,}$/;

function pulisciParola(parola: string): string {
  return parola.replace(/[^\wà-üÀ-Ü'’-]/g, '');
}

/**
 * Candidati nome dal racconto di una sessione: parole capitalizzate che non
 * aprono la frase (per scartare le maiuscole dovute solo all'inizio
 * periodo), unite alla parola successiva se anch'essa capitalizzata (per
 * "Nome Cognome"). Ordinati per frequenza, i più ricorrenti per primi.
 */
export function estraiCandidatiNome(testo: string): string[] {
  const conteggi = new Map<string, number>();
  const frasi = testo.split(/(?<=[.!?\n])\s+/);
  for (const frase of frasi) {
    const parole = frase.trim().split(/\s+/).filter(Boolean);
    for (let i = 1; i < parole.length; i++) {
      const parola = pulisciParola(parole[i]);
      if (!PATTERN_PAROLA_CAPITALIZZATA.test(parola) || PAROLE_DA_IGNORARE.has(parola)) continue;
      let nome = parola;
      const prossima = pulisciParola(parole[i + 1] ?? '');
      if (PATTERN_PAROLA_CAPITALIZZATA.test(prossima) && !PAROLE_DA_IGNORARE.has(prossima)) {
        nome = `${parola} ${prossima}`;
        i++;
      }
      conteggi.set(nome, (conteggi.get(nome) ?? 0) + 1);
    }
  }
  return [...conteggi.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MASSIMO_CANDIDATI)
    .map(([nome]) => nome);
}

function estraiEstratti(testo: string, nome: string): string[] {
  const nomeMinuscolo = nome.toLowerCase();
  return testo
    .split(/\n{1,}/)
    .map((p) => p.trim())
    .filter((p) => p && p.toLowerCase().includes(nomeMinuscolo))
    .map((p) => (p.length > LUNGHEZZA_MASSIMA_ESTRATTO ? `${p.slice(0, LUNGHEZZA_MASSIMA_ESTRATTO)}…` : p));
}

/**
 * Cerca ciascun candidato in tutta la cronologia dell'avventura (tutte le
 * sessioni tranne quella corrente, non solo le ultime N): se trova
 * corrispondenze, le allega come materiale di contesto per il riassunto.
 */
export function cercaRiferimentiNomi(avventura: Avventura, sessioneCorrenteId: string, candidati: string[]): string {
  if (candidati.length === 0) return '';
  const altreSessioni = sessioniInOrdine(avventura).filter((s) => s.id !== sessioneCorrenteId);
  const blocchi: string[] = [];
  for (const nome of candidati) {
    const righe: string[] = [];
    for (const sessione of altreSessioni) {
      if (righe.length >= MASSIMO_RIFERIMENTI_PER_NOME) break;
      for (const estratto of estraiEstratti(sessione.testo, nome)) {
        if (righe.length >= MASSIMO_RIFERIMENTI_PER_NOME) break;
        righe.push(`- (${sessione.titolo}) ${estratto}`);
      }
    }
    if (righe.length > 0) blocchi.push(`### ${nome}\n${righe.join('\n')}`);
  }
  if (blocchi.length === 0) return '';
  return `# Riferimenti trovati nella cronologia per nomi ricorrenti\n\n${blocchi.join('\n\n')}`;
}

/**
 * Contesto completo per il riassunto AI: il riepilogo delle sessioni
 * recenti (`costruisciContestoAvventura`) più i riferimenti trovati in
 * tutta la cronologia per i nomi ricorrenti nel racconto della sessione
 * corrente (`cercaRiferimentiNomi`). Quello che usa `VistaTaccuino.tsx`.
 */
export function costruisciContestoCompleto(avventura: Avventura, sessioneCorrenteId: string, limiteSessioniComplete = 5): string {
  const contestoRecente = costruisciContestoAvventura(avventura, sessioneCorrenteId, limiteSessioniComplete);
  const sessioneCorrente = avventura.sessioni.find((s) => s.id === sessioneCorrenteId);
  const candidati = sessioneCorrente ? estraiCandidatiNome(sessioneCorrente.testo) : [];
  const riferimenti = cercaRiferimentiNomi(avventura, sessioneCorrenteId, candidati);
  return [contestoRecente, riferimenti].filter(Boolean).join('\n\n');
}
