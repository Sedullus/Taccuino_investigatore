// Note e indizi (§ "Note e indizi"): tab a parte, con uno switch tra testo
// battuto e disegno a mano libera su una pagina in stile antico.

import { useEffect, useRef, useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import { leggiManoscritto } from '../../persistence/archivio';
import comuni from '../../theme/comuni.module.css';
import styles from './VistaNote.module.css';

type ModalitaNote = 'tastiera' | 'penna';

const CHIAVE_MODALITA = 'taccuino-note-modalita';
const COLORE_INCHIOSTRO = '#2b2015';
const ALTEZZA_TELA = 420;

function leggiModalitaSalvata(): ModalitaNote {
  try {
    const v = localStorage.getItem(CHIAVE_MODALITA);
    if (v === 'tastiera' || v === 'penna') return v;
  } catch {
    // localStorage non disponibile: degrado a "tastiera".
  }
  return 'tastiera';
}

function puntoLocale(e: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

export function VistaNote() {
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const aggiornaNote = useInvestigatoreStore((s) => s.aggiornaNote);
  const timbraOraNote = useInvestigatoreStore((s) => s.timbraOraNote);
  const salvaNoteManoscritte = useInvestigatoreStore((s) => s.salvaNoteManoscritte);
  const cancellaNoteManoscritte = useInvestigatoreStore((s) => s.cancellaNoteManoscritte);

  const [modalita, setModalitaState] = useState<ModalitaNote>(() => leggiModalitaSalvata());
  const contenitoreRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disegnando = useRef(false);
  const ultimoPunto = useRef<{ x: number; y: number } | null>(null);

  function setModalita(m: ModalitaNote) {
    setModalitaState(m);
    try {
      localStorage.setItem(CHIAVE_MODALITA, m);
    } catch {
      // preferenza valida solo per questa sessione
    }
  }

  // Dimensiona la tela sulla larghezza disponibile e ricarica il disegno
  // salvato, una volta sola quando si entra in modalità penna. Non reagisce
  // ai salvataggi successivi (altrimenti ogni tratto ricaricherebbe la tela
  // da IndexedDB, con uno sfarfallio visibile) né al ridimensionamento della
  // finestra: cambiare scheda e tornare rimisura di nuovo.
  useEffect(() => {
    if (modalita !== 'penna') return;
    const canvas = canvasRef.current;
    const contenitore = contenitoreRef.current;
    if (!canvas || !contenitore) return;
    let annullato = false;
    const dpr = window.devicePixelRatio || 1;
    const larghezza = contenitore.clientWidth;
    canvas.width = larghezza * dpr;
    canvas.height = ALTEZZA_TELA * dpr;
    canvas.style.width = `${larghezza}px`;
    canvas.style.height = `${ALTEZZA_TELA}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const chiave = useInvestigatoreStore.getState().attivo?.noteManoscritte;
    const promessa = chiave ? leggiManoscritto(chiave) : Promise.resolve(undefined);
    void promessa.then((dataUrl) => {
      if (annullato || !dataUrl || !ctx) return;
      const img = new Image();
      img.onload = () => {
        if (!annullato) ctx.drawImage(img, 0, 0, larghezza, ALTEZZA_TELA);
      };
      img.src = dataUrl;
    });
    return () => {
      annullato = true;
    };
  }, [modalita]);

  if (!attivo) return null;

  function suPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    disegnando.current = true;
    ultimoPunto.current = puntoLocale(e, canvas);
  }

  function suPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!disegnando.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !ultimoPunto.current) return;
    const p = puntoLocale(e, canvas);
    ctx.strokeStyle = COLORE_INCHIOSTRO;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(ultimoPunto.current.x, ultimoPunto.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ultimoPunto.current = p;
  }

  function suPointerUp() {
    if (!disegnando.current) return;
    disegnando.current = false;
    ultimoPunto.current = null;
    const canvas = canvasRef.current;
    if (canvas) void salvaNoteManoscritte(canvas.toDataURL('image/png'));
  }

  function suCancella() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    void cancellaNoteManoscritte();
  }

  return (
    <div className={`${styles.blocco} animato`}>
      <div className={styles.barraModalita} data-print-hide>
        <span className={comuni.etichetta}>NOTE E INDIZI</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className={modalita === 'tastiera' ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={() => setModalita('tastiera')}>
            Tastiera
          </button>
          <button type="button" className={modalita === 'penna' ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={() => setModalita('penna')}>
            Penna
          </button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {modalita === 'tastiera' && (
            <button type="button" className={comuni.bottoneTesto} onClick={timbraOraNote}>
              Segna l'ora
            </button>
          )}
          {modalita === 'penna' && (
            <button type="button" className={comuni.bottoneTestoPericolo} onClick={suCancella}>
              Cancella
            </button>
          )}
        </div>
      </div>

      <div ref={contenitoreRef} className={styles.paginaAntica}>
        {modalita === 'tastiera' ? (
          <textarea
            className={styles.testo}
            placeholder="Quello che ho visto stanotte, prima di dimenticarlo."
            value={attivo.note}
            onChange={(e) => aggiornaNote(e.target.value)}
          />
        ) : (
          <canvas
            ref={canvasRef}
            className={styles.tela}
            onPointerDown={suPointerDown}
            onPointerMove={suPointerMove}
            onPointerUp={suPointerUp}
            onPointerLeave={suPointerUp}
            onPointerCancel={suPointerUp}
          />
        )}
      </div>
      {modalita === 'penna' && <p className={styles.suggerimento}>Disegna con il dito, il mouse o una penna touch.</p>}
    </div>
  );
}
