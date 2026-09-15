import { useEffect, useState } from 'react';
import { CATALOGO_ICONE } from './catalogo';
import { ArmaIcona } from './ArmaIcona';

const DUBBIE = new Set(['garrota', 'sigillo']);

export function AnteprimaIcone() {
  const [tema, setTema] = useState<'chiaro' | 'scuro'>('scuro');
  useEffect(() => {
    document.documentElement.dataset.tema = tema;
  }, [tema]);
  const voci = CATALOGO_ICONE.filter((v) => v.sorgente === 'game-icons');
  const protagoniste = CATALOGO_ICONE.filter((v) => v.sorgente === 'manuale' && v.id !== 'ripiego');
  const ripiego = CATALOGO_ICONE.find((v) => v.id === 'ripiego')!;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--colore-sfondo)', color: 'var(--colore-testo)', fontFamily: 'var(--font-ui)', padding: 24 }}>
      <h1 style={{ fontFamily: 'var(--font-prosa)', fontWeight: 400 }}>Anteprima icone armi — Livello 1 (game-icons.net)</h1>
      <p style={{ color: 'var(--colore-testo-attenuato)', maxWidth: '70ch' }}>
        Trattamento a cinque strati applicato alle sagome verificate. Le due voci evidenziate in rosso sono mappature incerte da confermare (§4.2): non
        esiste un'icona "garrota" vera in game-icons, ed è usato un pentagramma come sigillo generico.
      </p>
      <button type="button" onClick={() => setTema((t) => (t === 'scuro' ? 'chiaro' : 'scuro'))} style={{ padding: '8px 14px', marginBottom: 24, cursor: 'pointer' }}>
        Cambia tema app: {tema}
      </button>

      <h2 style={{ fontFamily: 'var(--font-prosa)', fontWeight: 400 }}>Tre esempi, a tutte le dimensioni e resa</h2>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 32 }}>
        {['libro', 'spada', 'granata'].map((id) => (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <strong>{id}</strong>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <Etichettata px={24}>
                <ArmaIcona iconaId={id} dimensione={24} />
              </Etichettata>
              <Etichettata px={32}>
                <ArmaIcona iconaId={id} dimensione={32} />
              </Etichettata>
              <Etichettata px={48}>
                <ArmaIcona iconaId={id} dimensione={48} />
              </Etichettata>
              <Etichettata px={64}>
                <ArmaIcona iconaId={id} dimensione={64} />
              </Etichettata>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--colore-testo-debole)' }}>forzata piana, 48px</div>
                <ArmaIcona iconaId={id} dimensione={48} dettaglio="piano" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--colore-testo-debole)' }}>forzata ricca, 24px</div>
                <ArmaIcona iconaId={id} dimensione={24} dettaglio="ricco" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: 'var(--font-prosa)', fontWeight: 400 }}>Ripiego (nessun'icona "punto interrogativo" in game-icons)</h2>
      <div style={{ marginBottom: 32 }}>
        <ArmaIcona iconaId={ripiego.id} dimensione={48} />
        <p style={{ fontSize: 13, color: 'var(--colore-testo-attenuato)', maxWidth: '60ch' }}>
          Proposta: un "?" disegnato con lo stesso stile di lastra, invece di una sagoma dal catalogo (che non esiste).
        </p>
      </div>

      <h2 style={{ fontFamily: 'var(--font-prosa)', fontWeight: 400 }}>Protagoniste (Livello 2 — non ancora disegnate, segnaposto)</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        {protagoniste.map((v) => (
          <div key={v.id} style={{ textAlign: 'center' }}>
            <ArmaIcona iconaId={v.id} dimensione={48} />
            <div style={{ fontSize: 12 }}>{v.etichetta}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: 'var(--font-prosa)', fontWeight: 400 }}>Intero catalogo Livello 1 (32px)</h2>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {voci.map((v) => (
          <div key={v.id} style={{ textAlign: 'center', width: 100, border: DUBBIE.has(v.id) ? '1px solid var(--colore-pericolo)' : undefined, padding: 6, borderRadius: 4 }}>
            <ArmaIcona iconaId={v.id} dimensione={32} />
            <div style={{ fontSize: 12 }}>{v.etichetta}</div>
            <div style={{ fontSize: 10, color: 'var(--colore-testo-debole)' }}>{v.nomeGameIcons}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Etichettata({ px, children }: { px: number; children: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div>{children}</div>
      <div style={{ fontSize: 11, color: 'var(--colore-testo-debole)' }}>{px}px</div>
    </div>
  );
}
