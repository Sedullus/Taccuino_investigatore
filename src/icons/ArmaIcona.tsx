// Trattamento a incisione in cinque strati (§2, livello 1), applicato alle
// sagome curate di game-icons.net. Vedi docs/decisioni.md per la licenza
// (CC BY 3.0) e LICENSES.md per il testo completo.

import { useId } from 'react';
import { trovaVoce } from './catalogo';
import { CORPI_GAME_ICONS } from './corpiCurati.generated';

export type Dettaglio = 'auto' | 'ricco' | 'piano';

interface Props {
  iconaId: string;
  dimensione?: number;
  dettaglio?: Dettaglio;
  className?: string;
  /** true se il nome è già scritto accanto e l'icona è solo decorativa. */
  decorativa?: boolean;
}

export function ArmaIcona({ iconaId, dimensione = 32, dettaglio = 'auto', className, decorativa }: Props) {
  const idBase = useId();
  const voce = trovaVoce(iconaId);
  const corpo = voce?.sorgente === 'game-icons' && voce.nomeGameIcons ? CORPI_GAME_ICONS[voce.nomeGameIcons] : undefined;

  if (!voce || !corpo) {
    return <IconaSegnaposto dimensione={dimensione} className={className} etichetta={voce?.etichetta} decorativa={decorativa} />;
  }

  const risolto = dettaglio === 'auto' ? (dimensione > 32 ? 'ricco' : 'piano') : dettaglio;
  const [, , vwStr, vhStr] = corpo.viewBox.split(' ');
  const vw = Number(vwStr);
  const vh = Number(vhStr);
  const scala = vw / 64;
  const clipId = `${idBase}-clip`;
  const sfondoId = `${idBase}-sfondo`;
  const tratteggioId = `${idBase}-tratteggio`;

  return (
    <svg
      width={dimensione}
      height={dimensione}
      viewBox={corpo.viewBox}
      className={className}
      role={decorativa ? undefined : 'img'}
      aria-hidden={decorativa ? true : undefined}
      aria-label={decorativa ? undefined : voce.etichetta}
    >
      <defs>
        <radialGradient id={sfondoId} cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="var(--icona-fondo-chiaro)" />
          <stop offset="100%" stopColor="var(--icona-fondo)" />
        </radialGradient>
        <clipPath id={clipId}>
          {corpo.percorsi.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        {risolto === 'ricco' && (
          <pattern id={tratteggioId} width={3 * scala} height={3 * scala} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={3 * scala} stroke="var(--icona-tratto)" strokeWidth={scala * 0.9} />
          </pattern>
        )}
      </defs>

      {/* 1. carta — con un bordo sensibile al tema, così la lastra si stacca
          sempre dallo sfondo dell'app attorno, chiaro o scuro che sia. */}
      <rect x={0} y={0} width={vw} height={vh} fill={`url(#${sfondoId})`} />
      <rect x={scala} y={scala} width={vw - 2 * scala} height={vh - 2 * scala} fill="none" stroke="var(--colore-bordo-forte)" strokeWidth={scala * 0.6} />

      {/* 2. corpo */}
      <g fill="var(--icona-corpo)">
        {corpo.percorsi.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* 3. tratteggio, ritagliato dentro la sagoma */}
      {risolto === 'ricco' && (
        <g clipPath={`url(#${clipId})`}>
          <rect x={0} y={0} width={vw} height={vh} fill={`url(#${tratteggioId})`} opacity={0.55} />
        </g>
      )}

      {/* 4. contorno */}
      <g fill="none" stroke="var(--icona-contorno)" strokeWidth={risolto === 'ricco' ? 2 * scala : 2.5 * scala} strokeLinejoin="round">
        {corpo.percorsi.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

function IconaSegnaposto({ dimensione, className, etichetta, decorativa }: { dimensione: number; className?: string; etichetta?: string; decorativa?: boolean }) {
  return (
    <svg width={dimensione} height={dimensione} viewBox="0 0 64 64" className={className} role={decorativa ? undefined : 'img'} aria-hidden={decorativa ? true : undefined} aria-label={decorativa ? undefined : (etichetta ?? 'Icona sconosciuta')}>
      <rect x={2} y={2} width={60} height={60} rx={10} fill="var(--icona-fondo)" />
      <rect x={2} y={2} width={60} height={60} rx={10} fill="none" stroke="var(--icona-contorno)" strokeWidth={2.5} />
      <text x={32} y={41} textAnchor="middle" fontSize={28} fill="var(--icona-contorno)" fontFamily="serif">
        ?
      </text>
    </svg>
  );
}
