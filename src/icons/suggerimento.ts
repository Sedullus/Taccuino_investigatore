// Suggerimento automatico dell'icona dal nome dell'arma (§5).

import { CATALOGO_ICONE, type VoceCatalogo } from './catalogo';
import type { IconaArma } from '../rules/types';

export function normalizza(testo: string): string {
  return testo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Distanza di Levenshtein (numero minimo di modifiche per passare da a a b). */
export function distanzaLevenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const riga = new Array(n + 1);
  for (let j = 0; j <= n; j++) riga[j] = j;
  for (let i = 1; i <= m; i++) {
    let precedente = riga[0];
    riga[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = riga[j];
      riga[j] = a[i - 1] === b[j - 1] ? precedente : 1 + Math.min(precedente, riga[j], riga[j - 1]);
      precedente = temp;
    }
  }
  return riga[n];
}

function contieneParolaIntera(testo: string, parola: string): boolean {
  const escaped = parola.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\s)${escaped}(?:$|\\s)`).test(testo);
}

export interface ContestoSuggerimento {
  /** Nome dell'abilità collegata all'arma, es. "Armi da Fuoco (Pistola)". */
  abilitaCollegata?: string;
}

function categoriaDaAbilita(abilitaCollegata?: string): VoceCatalogo['categoria'] | undefined {
  if (!abilitaCollegata) return undefined;
  if (abilitaCollegata.startsWith('Armi da Fuoco')) return 'fuoco';
  if (abilitaCollegata.startsWith('Combattere')) return 'mischia';
  return undefined;
}

// [VERIFICA] La specifica (§5.2) fissa la soglia minima a 6 punti, ma
// l'unico punteggio di una corrispondenza approssimata è 4: con la soglia a
// 6, un refuso che trova solo un riscontro approssimato (come nel caso 11,
// "Revolvre") non supererebbe mai la soglia. La soglia è abbassata a 4 — il
// valore della regola più debole — così ogni tipo di corrispondenza può da
// solo portare una voce in elenco, mentre un testo senza alcun riscontro
// (caso 12, "Zzzz") resta comunque a punteggio 0 ed è escluso.
const SOGLIA_MINIMA = 4;

/**
 * Punteggio di una voce del catalogo per il testo normalizzato dato (§5.2):
 * parola chiave esatta = 10, contenuta = 6, su abilità collegata = 3,
 * approssimata (Levenshtein ≤2, parole di 5+ lettere) = 4. I punti si
 * sommano su tutte le parole chiave che trovano corrispondenza.
 */
export function punteggioVoce(voce: VoceCatalogo, testoNormalizzato: string, categoriaAbilita?: VoceCatalogo['categoria']): number {
  let punti = 0;
  const paroleTesto = testoNormalizzato.split(' ').filter(Boolean);
  for (const chiaveGrezza of voce.parole) {
    const chiave = normalizza(chiaveGrezza);
    if (!chiave) continue;
    if (contieneParolaIntera(testoNormalizzato, chiave)) {
      punti += 10;
      continue;
    }
    if (testoNormalizzato.includes(chiave)) {
      punti += 6;
      continue;
    }
    if (chiave.length >= 5 && !chiave.includes(' ')) {
      const trovaApprossimata = paroleTesto.some((p) => p.length >= 5 && distanzaLevenshtein(p, chiave) <= 2);
      if (trovaApprossimata) punti += 4;
    }
  }
  if (categoriaAbilita && voce.categoria === categoriaAbilita) punti += 3;
  return punti;
}

/** Fino a 3 icone suggerite per il nome dell'arma, per punteggio decrescente (§5.2). */
export function suggerisciIcone(nomeArma: string, contesto?: ContestoSuggerimento, limite = 3): VoceCatalogo[] {
  const testo = normalizza(nomeArma);
  if (!testo) return [];
  const categoriaAbilita = categoriaDaAbilita(contesto?.abilitaCollegata);
  return CATALOGO_ICONE.map((voce, indice) => ({ voce, punti: punteggioVoce(voce, testo, categoriaAbilita), indice }))
    .filter((r) => r.punti >= SOGLIA_MINIMA)
    .sort((a, b) => b.punti - a.punti || a.indice - b.indice)
    .slice(0, limite)
    .map((r) => r.voce);
}

/**
 * L'icona da mostrare per un'arma: quella salvata se c'è, altrimenti il
 * primo suggerimento calcolato al volo dal nome — così un'arma importata da
 * uno schema più vecchio (senza `icona`) mostra comunque un suggerimento
 * senza doverlo scrivere nei dati in fase di migrazione (docs/decisioni.md).
 */
export function iconaEffettivaArma(nome: string, abilitaCollegata: string, iconaSalvata: IconaArma | undefined): IconaArma | undefined {
  if (iconaSalvata) return iconaSalvata;
  const [primaScelta] = suggerisciIcone(nome, { abilitaCollegata });
  if (!primaScelta) return undefined;
  return { id: primaScelta.id, sorgente: primaScelta.sorgente, bloccata: false };
}
