// Trattamento a incisione in cinque strati (§2). ArmaIcona risolve
// l'IconaArma salvata su un'arma (catalogo curato, o corpo diretto per una
// scelta dal catalogo completo); TrattamentoIncisione accetta un corpo
// direttamente, per riuso dal selettore quando cerca nel catalogo completo
// di game-icons.net (src/icons/CercaCatalogoCompleto.tsx). Vedi
// docs/decisioni.md per la licenza (CC BY 3.0) e LICENSES.md per il testo
// completo.

import { useId } from 'react';
import { trovaVoce } from './catalogo';
import type { CorpoIcona } from './corpiCurati.generated';
import { CORPI_GAME_ICONS } from './corpiCurati.generated';
import { CORPI_PROTAGONISTE } from './corpiProtagoniste.generated';
import { risolviDettaglio, type Dettaglio } from './dettaglio';
import type { IconaArma } from '../rules/types';

export type { Dettaglio };

interface Props {
  icona: IconaArma | undefined;
  dimensione?: number;
  dettaglio?: Dettaglio;
  className?: string;
  /** true se il nome è già scritto accanto e l'icona è solo decorativa. */
  decorativa?: boolean;
}

export function ArmaIcona({ icona, dimensione = 32, dettaglio = 'auto', className, decorativa }: Props) {
  const voce = icona ? trovaVoce(icona.id) : undefined;
  const daProtagonista = voce?.sorgente === 'manuale' ? CORPI_PROTAGONISTE[voce.id] : undefined;
  const daGameIcons = voce?.sorgente === 'game-icons' && voce.nomeGameIcons ? CORPI_GAME_ICONS[voce.nomeGameIcons] : undefined;
  const daCorpoDiretto = !voce && icona?.corpo ? icona.corpo : undefined;
  const corpo = daProtagonista ?? daGameIcons ?? daCorpoDiretto;
  const accento = daProtagonista?.accento;
  const etichetta = voce?.etichetta ?? icona?.id;

  if (!corpo) {
    return <IconaSegnaposto dimensione={dimensione} className={className} etichetta={etichetta} decorativa={decorativa} />;
  }

  return (
    <TrattamentoIncisione
      corpo={corpo}
      accento={accento}
      etichetta={etichetta ?? 'Icona'}
      dimensione={dimensione}
      dettaglio={dettaglio}
      className={className}
      decorativa={decorativa}
    />
  );
}

interface PropsTrattamento {
  corpo: CorpoIcona;
  accento?: string[];
  etichetta: string;
  dimensione?: number;
  dettaglio?: Dettaglio;
  className?: string;
  decorativa?: boolean;
}

/** Le cinque strati applicati a un corpo qualsiasi (non solo del catalogo curato). */
export function TrattamentoIncisione({ corpo, accento, etichetta, dimensione = 32, dettaglio = 'auto', className, decorativa }: PropsTrattamento) {
  const idBase = useId();
  const risolto = risolviDettaglio(dettaglio, dimensione);
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
      aria-label={decorativa ? undefined : etichetta}
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

      {/* 5. accento (solo protagoniste) */}
      {accento && accento.length > 0 && (
        <g fill="var(--icona-accento)">
          {accento.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      )}
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
