// Esportazione PDF di una sessione del Taccuino (§ "Esporta PDF"): racconto
// e riassunto AI su pagine "color carta invecchiata" (stessa identità visiva
// della pagina del racconto a schermo), poi le foto allegate in fondo, una
// per pagina con didascalia.
//
// jsPDF (~330 KB minificato) è importata dinamicamente, non in testa al
// file: come il catalogo completo delle icone armi, non deve pesare sul
// caricamento iniziale dell'app per chi non esporta mai un PDF.

import type { jsPDF } from 'jspdf';
import type { Avventura, Investigatore, SessioneAvventura } from '../rules/types';
import { analizzaRiassunto, ETICHETTE_SEZIONI_RIASSUNTO_FINALE } from './riassuntoAI';

const MARGINE = 20;
const COLORE_SFONDO: [number, number, number] = [239, 228, 200];
const COLORE_BORDO: [number, number, number] = [85, 65, 35];
const COLORE_TESTO: [number, number, number] = [43, 32, 21];
const COLORE_TESTO_ATTENUATO: [number, number, number] = [90, 70, 40];

export interface FotoPdf {
  dataUrl: string;
  didascalia?: string;
}

function disegnaPaginaAntica(doc: jsPDF) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFillColor(...COLORE_SFONDO);
  doc.rect(0, 0, w, h, 'F');
  doc.setDrawColor(...COLORE_BORDO);
  doc.setLineWidth(0.4);
  doc.rect(8, 8, w - 16, h - 16);
}

function nuovaPagina(doc: jsPDF): number {
  doc.addPage();
  disegnaPaginaAntica(doc);
  return MARGINE + 4;
}

function scriviTestoConPaginazione(doc: jsPDF, testo: string, x: number, yIniziale: number, larghezza: number, interlinea: number): number {
  const altezzaPagina = doc.internal.pageSize.getHeight();
  const righe = doc.splitTextToSize(testo, larghezza) as string[];
  let y = yIniziale;
  for (const riga of righe) {
    if (y > altezzaPagina - MARGINE) y = nuovaPagina(doc);
    doc.text(riga, x, y);
    y += interlinea;
  }
  return y;
}

function dimensioniImmagine(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error('Immagine non leggibile.'));
    img.src = dataUrl;
  });
}

export function nomeFilePdf(sessione: SessioneAvventura): string {
  const pulito = sessione.titolo.trim().replace(/[\\/:*?"<>|]+/g, '-');
  return `${pulito || 'sessione'}.pdf`;
}

async function nuovoDocumento(): Promise<jsPDF> {
  const { jsPDF: Costruttore } = await import('jspdf');
  const doc = new Costruttore({ unit: 'mm', format: 'a4' });
  disegnaPaginaAntica(doc);
  return doc;
}

/** Intestazione comune ai PDF del Taccuino; restituisce la y da cui proseguire. */
function scriviIntestazione(doc: jsPDF, investigatore: Investigatore, titolo: string, sottotitolo: string, meta: string): number {
  const larghezzaPagina = doc.internal.pageSize.getWidth();
  let y = MARGINE;

  doc.setTextColor(...COLORE_TESTO_ATTENUATO);
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.text("Taccuino dell'Investigatore", MARGINE, y);
  y += 7;

  doc.setTextColor(...COLORE_TESTO);
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.text(titolo, MARGINE, y);
  y += 9;

  doc.setFont('times', 'normal');
  doc.setFontSize(15);
  doc.text(sottotitolo, MARGINE, y);
  y += 7;

  if (meta) {
    doc.setTextColor(...COLORE_TESTO_ATTENUATO);
    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    doc.text(meta, MARGINE, y);
    y += 8;
  } else {
    y += 3;
  }

  doc.setDrawColor(...COLORE_BORDO);
  doc.setLineWidth(0.2);
  doc.line(MARGINE, y, larghezzaPagina - MARGINE, y);
  y += 8;

  doc.setTextColor(...COLORE_TESTO_ATTENUATO);
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text(`Investigatore: ${investigatore.anagrafica.nome || 'senza nome'}`, MARGINE, y);
  return y + 10;
}

/**
 * Riassunto AI diviso in sezioni, oppure — se manca — la nota che spiega
 * perché: il PDF dichiara sempre, nero su carta invecchiata, se e perché
 * manca il riassunto AI. Un messaggio in-app che sparisce dopo il download
 * non basta, chi riapre il PDF più tardi deve poterlo capire comunque.
 */
function scriviRiassunto(doc: jsPDF, yIniziale: number, titolo: string, riassunto: string | undefined, nota: string | undefined, etichette?: readonly string[]): number {
  const larghezzaUtile = doc.internal.pageSize.getWidth() - MARGINE * 2;
  const altezzaPagina = doc.internal.pageSize.getHeight();
  let y = yIniziale;

  if (riassunto) {
    y += 6;
    if (y > altezzaPagina - MARGINE - 20) y = nuovaPagina(doc);
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...COLORE_BORDO);
    doc.text(titolo, MARGINE, y);
    y += 8;

    for (const sezione of analizzaRiassunto(riassunto, etichette)) {
      if (y > altezzaPagina - MARGINE - 14) y = nuovaPagina(doc);
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...COLORE_TESTO_ATTENUATO);
      doc.text(sezione.titolo, MARGINE, y);
      y += 5.5;
      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...COLORE_TESTO);
      y = scriviTestoConPaginazione(doc, sezione.corpo || '—', MARGINE, y, larghezzaUtile, 5.6);
      y += 4;
    }
  } else if (nota) {
    y += 6;
    if (y > altezzaPagina - MARGINE - 16) y = nuovaPagina(doc);
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...COLORE_TESTO_ATTENUATO);
    y = scriviTestoConPaginazione(doc, nota, MARGINE, y, larghezzaUtile, 5.2);
  }
  return y;
}

export async function generaPdfSessione(
  investigatore: Investigatore,
  avventura: Avventura,
  sessione: SessioneAvventura,
  foto: FotoPdf[],
  riassunto?: string,
  notaRiassunto?: string,
): Promise<jsPDF> {
  const doc = await nuovoDocumento();
  const larghezzaPagina = doc.internal.pageSize.getWidth();
  const larghezzaUtile = larghezzaPagina - MARGINE * 2;
  const meta = [sessione.data, sessione.luogo].filter(Boolean).join(' · ');
  let y = scriviIntestazione(doc, investigatore, avventura.titolo, sessione.titolo, meta);

  doc.setTextColor(...COLORE_TESTO);
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  const testoRacconto = sessione.testo.trim() || '(nessun racconto scritto per questa sessione)';
  y = scriviTestoConPaginazione(doc, testoRacconto, MARGINE, y, larghezzaUtile, 6.2);

  scriviRiassunto(doc, y, 'RIASSUNTO (generato dall’AI)', riassunto, notaRiassunto);

  for (const f of foto) {
    const yFoto = nuovaPagina(doc);
    const areaX = MARGINE;
    const areaW = larghezzaUtile;
    const areaH = doc.internal.pageSize.getHeight() - yFoto - MARGINE - 16;
    let dim: { w: number; h: number };
    try {
      dim = await dimensioniImmagine(f.dataUrl);
    } catch {
      continue;
    }
    const scala = Math.min(areaW / dim.w, areaH / dim.h, 1);
    const w = dim.w * scala;
    const h = dim.h * scala;
    const cx = areaX + (areaW - w) / 2;
    doc.addImage(f.dataUrl, 'JPEG', cx, yFoto, w, h);
    if (f.didascalia) {
      doc.setFont('times', 'italic');
      doc.setFontSize(11);
      doc.setTextColor(...COLORE_TESTO);
      doc.text(f.didascalia, larghezzaPagina / 2, yFoto + h + 10, { align: 'center' });
    }
  }

  return doc;
}

export function nomeFilePdfRiassuntoFinale(avventura: Avventura): string {
  const pulito = avventura.titolo.trim().replace(/[\\/:*?"<>|]+/g, '-');
  return `${pulito || 'avventura'} - riassunto finale.pdf`;
}

/**
 * Riassunto finale dell'avventura (§ "Riassunto finale"): l'elenco delle
 * sessioni giocate, poi la lettura d'insieme generata dall'AI, divisa nelle
 * sezioni di ETICHETTE_SEZIONI_RIASSUNTO_FINALE. Niente foto: restano nei
 * PDF delle singole sessioni.
 */
export async function generaPdfRiassuntoFinale(
  investigatore: Investigatore,
  avventura: Avventura,
  riassunto?: string,
  notaRiassunto?: string,
): Promise<jsPDF> {
  const doc = await nuovoDocumento();
  const larghezzaUtile = doc.internal.pageSize.getWidth() - MARGINE * 2;
  const sessioni = [...avventura.sessioni].sort((a, b) => a.creata.localeCompare(b.creata));
  const meta = sessioni.length === 1 ? '1 sessione' : `${sessioni.length} sessioni`;
  let y = scriviIntestazione(doc, investigatore, avventura.titolo, 'Riassunto finale', meta);

  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORE_TESTO_ATTENUATO);
  doc.text('SESSIONI GIOCATE', MARGINE, y);
  y += 5.5;
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORE_TESTO);
  for (const s of sessioni) {
    const dettagli = [s.data, s.luogo].filter(Boolean).join(' · ');
    y = scriviTestoConPaginazione(doc, `- ${s.titolo}${dettagli ? ` (${dettagli})` : ''}`, MARGINE, y, larghezzaUtile, 5.6);
  }

  scriviRiassunto(doc, y + 2, 'RIASSUNTO FINALE (generato dall’AI)', riassunto, notaRiassunto, ETICHETTE_SEZIONI_RIASSUNTO_FINALE);
  return doc;
}
