// Crediti per le icone armi (§9): attribuzione CC BY 3.0 per game-icons.net.

import { Dialogo } from '../comuni/Dialogo';
import comuni from '../../theme/comuni.module.css';

interface Props {
  onChiudi: () => void;
}

export function CreditiDialogo({ onChiudi }: Props) {
  return (
    <Dialogo titolo="Crediti" onChiudi={onChiudi}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 17, color: 'var(--colore-testo)' }}>Icone delle armi</span>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--colore-testo-attenuato)', margin: 0 }}>
            Molte delle icone armi ed equipaggiamento sono basate su sagome di{' '}
            <a href="https://game-icons.net" target="_blank" rel="noreferrer" style={{ color: 'var(--colore-accento)' }}>
              game-icons.net
            </a>
            , create principalmente da Lorc e Delapouite, con altri collaboratori, distribuite con licenza{' '}
            <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer" style={{ color: 'var(--colore-accento)' }}>
              Creative Commons BY 3.0
            </a>
            . Le sagome sono state modificate (contorno, tratteggio, colori) per questa applicazione. Il testo completo della licenza è in{' '}
            <code>LICENSES.md</code>.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--colore-bordo)', paddingTop: 14 }}>
          <span style={{ fontSize: 17, color: 'var(--colore-testo)' }}>Icone originali</span>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--colore-testo-attenuato)', margin: 0 }}>
            Le dodici icone protagoniste (armi da fuoco più comuni, coltello, randello, tirapugni, pugno chiuso, bastone da passeggio, ascia, bottiglia
            molotov) sono disegni originali di quest'app.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--colore-bordo)', paddingTop: 14 }}>
          <span style={{ fontSize: 17, color: 'var(--colore-testo)' }}>Caratteri tipografici</span>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--colore-testo-attenuato)', margin: 0 }}>
            Archivo Narrow, IBM Plex Mono e Source Serif 4, distribuiti con licenza SIL Open Font License 1.1, inclusi nell'app (nessun caricamento da
            Google Fonts a runtime).
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6 }}>
        <button type="button" className={comuni.bottoneTesto} onClick={onChiudi}>
          Chiudi
        </button>
      </div>
    </Dialogo>
  );
}
