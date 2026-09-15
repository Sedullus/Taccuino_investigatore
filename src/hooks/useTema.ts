// Tema chiaro/scuro (§ "Direzione visiva"): preferenza del dispositivo, non
// dell'investigatore — resta in localStorage, non nel JSON esportabile.

import { useCallback, useEffect, useState } from 'react';

export type Tema = 'sistema' | 'chiaro' | 'scuro';

const CHIAVE = 'taccuino-tema';

function leggiTemaSalvato(): Tema {
  try {
    const v = localStorage.getItem(CHIAVE);
    if (v === 'chiaro' || v === 'scuro' || v === 'sistema') return v;
  } catch {
    // localStorage non disponibile (privacy mode, ecc.): degrado a "sistema".
  }
  return 'sistema';
}

function applicaTema(tema: Tema) {
  const radice = document.documentElement;
  if (tema === 'sistema') delete radice.dataset.tema;
  else radice.dataset.tema = tema;
}

export function useTema() {
  const [tema, setTemaState] = useState<Tema>(() => leggiTemaSalvato());

  useEffect(() => {
    applicaTema(tema);
  }, [tema]);

  const setTema = useCallback((t: Tema) => {
    setTemaState(t);
    try {
      localStorage.setItem(CHIAVE, t);
    } catch {
      // ignorato: la preferenza resta valida solo per questa sessione.
    }
  }, []);

  return { tema, setTema };
}
