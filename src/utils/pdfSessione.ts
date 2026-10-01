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
import { analizzaRiassunto } from './riassuntoAI';

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

export async function generaPdfSessione(
  investigatore: Investigatore,
  avventura: Avventura,
  sessione: SessioneAvventura,
  foto: FotoPdf[],
  riassunto?: string,
): Promise<jsPDF> {
  const { jsPDF: Costruttore } = await import('jspdf');
  const doc = new Costruttore({ unit: 'mm', format: 'a4' });
  const larghezzaPagina = doc.internal.pageSize.getWidth();
  const larghezzaUtile = larghezzaPagina - MARGINE * 2;
  disegnaPaginaAntica(doc);
  let y = MARGINE;

  doc.setTextColor(...COLORE_TESTO_ATTENUATO);
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.text("Taccuino dell'Investigatore", MARGINE, y);
  y += 7;

  doc.setTextColor(...COLORE_TESTO);
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.text(avventura.titolo, MARGINE, y);
  y += 9;

  doc.setFont('times', 'normal');
  doc.setFontSize(15);
  doc.text(sessione.titolo, MARGINE, y);
  y += 7;

  const meta = [sessione.data, sessione.luogo].filter(Boolean).join(' · ');
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
  y += 10;

  doc.setTextColor(...COLORE_TESTO);
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  const testoRacconto = sessione.testo.trim() || '(nessun racconto scritto per questa sessione)';
  y = scriviTestoConPaginazione(doc, testoRacconto, MARGINE, y, larghezzaUtile, 6.2);

  if (riassunto) {
    y += 6;
    if (y > doc.internal.pageSize.getHeight() - MARGINE - 20) y = nuovaPagina(doc);
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...COLORE_BORDO);
    doc.text('RIASSUNTO (generato dall’AI)', MARGINE, y);
    y += 8;

    for (const sezione of analizzaRiassunto(riassunto)) {
      if (y > doc.internal.pageSize.getHeight() - MARGINE - 14) y = nuovaPagina(doc);
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
  }

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
