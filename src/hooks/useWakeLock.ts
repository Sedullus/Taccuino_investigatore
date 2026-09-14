// Screen Wake Lock API (§ requisiti PWA): interruttore "Tieni lo schermo
// acceso" con degradazione silenziosa se il browser non la supporta.

import { useCallback, useEffect, useRef, useState } from 'react';

export function useWakeLock() {
  const supportato = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [attivo, setAttivo] = useState(false);
  const sentinellaRif = useRef<WakeLockSentinel | null>(null);
  const richiestoRif = useRef(false);

  const richiedi = useCallback(async () => {
    if (!supportato) return;
    try {
      const sentinella = await navigator.wakeLock.request('screen');
      sentinellaRif.current = sentinella;
      setAttivo(true);
      sentinella.addEventListener('release', () => setAttivo(false));
    } catch {
      // Degradazione silenziosa: il browser può rifiutare (batteria, permessi, ecc.).
      setAttivo(false);
    }
  }, [supportato]);

  const rilascia = useCallback(async () => {
    richiestoRif.current = false;
    if (sentinellaRif.current && !sentinellaRif.current.released) {
      await sentinellaRif.current.release();
    }
    sentinellaRif.current = null;
    setAttivo(false);
  }, []);

  const toggle = useCallback(() => {
    if (richiestoRif.current) {
      void rilascia();
    } else {
      richiestoRif.current = true;
      void richiedi();
    }
  }, [richiedi, rilascia]);

  // Il wake lock si rilascia da solo quando la scheda perde il focus:
  // lo richiediamo di nuovo al ritorno, se l'interruttore era attivo.
  useEffect(() => {
    function suVisibilita() {
      if (richiestoRif.current && document.visibilityState === 'visible') void richiedi();
    }
    document.addEventListener('visibilitychange', suVisibilita);
    return () => document.removeEventListener('visibilitychange', suVisibilita);
  }, [richiedi]);

  useEffect(() => () => void rilascia(), [rilascia]);

  return { supportato, attivo, toggle };
}
