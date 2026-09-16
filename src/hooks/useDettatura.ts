// Dettatura vocale (Web Speech API): l'unica eccezione alla regola "nessuna
// chiamata di rete a runtime" del progetto — su Chrome/Edge il riconoscimento
// gira sui server di Google, non sul dispositivo (Safari/Firefox desktop lo
// fanno on-device, ma il comportamento non è garantito dallo standard). Per
// questo il pulsante è sempre facoltativo, mai attivo di default: vedi
// docs/decisioni.md. L'API non è nei tipi DOM di TypeScript (non standard,
// prefissata "webkit" su Chrome): i tipi minimi servono qui sotto.

import { useCallback, useEffect, useRef, useState } from 'react';

interface RisultatoRiconoscimento {
  isFinal: boolean;
  0: { transcript: string };
}

interface EventoRiconoscimento {
  resultIndex: number;
  results: ArrayLike<RisultatoRiconoscimento>;
}

interface MotoreRiconoscimento {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: EventoRiconoscimento) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type CostruttoreMotore = new () => MotoreRiconoscimento;

function costruttoreDisponibile(): CostruttoreMotore | null {
  const w = window as unknown as { SpeechRecognition?: CostruttoreMotore; webkitSpeechRecognition?: CostruttoreMotore };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useDettatura(onTestoRiconosciuto: (testo: string) => void) {
  const [supportata] = useState(() => typeof window !== 'undefined' && costruttoreDisponibile() != null);
  const [inAscolto, setInAscolto] = useState(false);
  const motoreRef = useRef<MotoreRiconoscimento | null>(null);
  const onTestoRef = useRef(onTestoRiconosciuto);

  // Il ref si aggiorna dopo il render (mai durante): l'evento onresult, che lo
  // legge, scatta sempre più tardi in modo asincrono, quindi trova già il
  // valore fresco senza bisogno di riavviare il riconoscimento a ogni render.
  useEffect(() => {
    onTestoRef.current = onTestoRiconosciuto;
  });

  useEffect(() => () => motoreRef.current?.stop(), []);

  const avvia = useCallback(() => {
    const Costruttore = costruttoreDisponibile();
    if (!Costruttore) return;
    const motore = new Costruttore();
    motore.lang = 'it-IT';
    motore.continuous = true;
    motore.interimResults = false;
    motore.onresult = (e) => {
      let testo = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const risultato = e.results[i];
        if (risultato.isFinal) testo += risultato[0].transcript;
      }
      if (testo.trim()) onTestoRef.current(testo.trim());
    };
    motore.onerror = () => setInAscolto(false);
    motore.onend = () => setInAscolto(false);
    motoreRef.current = motore;
    motore.start();
    setInAscolto(true);
  }, []);

  const interrompi = useCallback(() => {
    motoreRef.current?.stop();
    setInAscolto(false);
  }, []);

  return { supportata, inAscolto, avvia, interrompi };
}
