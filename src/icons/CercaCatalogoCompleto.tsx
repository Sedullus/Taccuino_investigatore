// Ricerca nel catalogo completo di game-icons.net (oltre 4.100 icone),
// caricato solo qui via import() dinamico — mai importato staticamente
// altrove — così non pesa sul caricamento iniziale dell'app (§6). Il
// Service Worker lo precachea comunque, quindi resta disponibile offline
// dopo il primo avvio.

import { useMemo, useRef, useState } from 'react';
import type { CorpoIcona } from './corpiCurati.generated';
import { TrattamentoIncisione } from './ArmaIcona';

const LIMITE_RISULTATI = 60;

interface Props {
  onScegli: (nomeGameIcons: string, corpo: CorpoIcona) => void;
}

export function CercaCatalogoCompleto({ onScegli }: Props) {
  const [termine, setTermine] = useState('');
  const [corpi, setCorpi] = useState<Record<string, CorpoIcona> | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const richiestoRif = useRef(false);

  function suModificaTermine(valore: string) {
    setTermine(valore);
    // Il caricamento parte alla prima interazione con la ricerca, non
    // all'apertura del selettore: così sfogliare solo il set curato non
    // scarica mai il catalogo completo. Innescato dall'evento, non da un
    // effect, perché è un'azione (avvia un side-effect), non una
    // sincronizzazione dello stato con qualcosa di esterno.
    if (richiestoRif.current || valore.trim().length === 0) return;
    richiestoRif.current = true;
    setCaricamento(true);
    void import('./corpiCompleti.generated').then((modulo) => {
      setCorpi(modulo.CORPI_CATALOGO_COMPLETO);
      setCaricamento(false);
    });
  }

  const risultati = useMemo(() => {
    if (!corpi) return [];
    const t = termine.trim().toLowerCase().replace(/\s+/g, '-');
    if (!t) return [];
    const nomi = Object.keys(corpi).filter((n) => n.includes(t));
    return nomi.slice(0, LIMITE_RISULTATI);
  }, [corpi, termine]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        className="input-ricerca-catalogo"
        style={{ minHeight: 44, padding: '10px 12px', background: 'var(--colore-sfondo)', border: '1px solid var(--colore-bordo-forte)', borderRadius: 'var(--raggio)', color: 'var(--colore-testo)' }}
        placeholder="Cerca in tutto il catalogo (in inglese, es. lantern, dagger…)"
        value={termine}
        onChange={(e) => suModificaTermine(e.target.value)}
        aria-label="Cerca in tutto il catalogo di icone"
      />
      {caricamento && <span style={{ fontSize: 13, color: 'var(--colore-testo-attenuato)' }}>Carico il catalogo completo…</span>}
      {corpi && termine.trim() && (
        <>
          <div role="listbox" aria-label="Risultati della ricerca" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, maxHeight: 260, overflowY: 'auto' }}>
            {risultati.map((nome) => (
              <button
                key={nome}
                type="button"
                role="option"
                aria-selected={false}
                title={nome}
                onClick={() => onScegli(nome, corpi[nome]!)}
                style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 72 }}
              >
                <TrattamentoIncisione corpo={corpi[nome]!} etichetta={nome} dimensione={40} />
                <span style={{ fontSize: 10, color: 'var(--colore-testo-debole)', wordBreak: 'break-word', textAlign: 'center' }}>{nome}</span>
              </button>
            ))}
          </div>
          {risultati.length === 0 && <span style={{ fontSize: 13, color: 'var(--colore-testo-debole)' }}>Nessun risultato.</span>}
          {risultati.length === LIMITE_RISULTATI && <span style={{ fontSize: 12, color: 'var(--colore-testo-debole)' }}>Mostro i primi {LIMITE_RISULTATI} risultati — restringi la ricerca per vedere gli altri.</span>}
        </>
      )}
    </div>
  );
}
