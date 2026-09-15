// Selettore di icona (§6): set curato in cima, ricerca sul catalogo completo
// sotto. Si apre toccando l'icona dell'arma in Modalità Modifica.

import { CATALOGO_ICONE, type Categoria } from './catalogo';
import { ArmaIcona } from './ArmaIcona';
import { CercaCatalogoCompleto } from './CercaCatalogoCompleto';
import { Dialogo } from '../components/comuni/Dialogo';
import comuni from '../theme/comuni.module.css';
import type { IconaArma } from '../rules/types';

const ETICHETTE_CATEGORIA: Record<Categoria, string> = {
  fuoco: 'Armi da fuoco',
  mischia: 'Mischia',
  lancio: 'Lancio',
  altro: 'Altro',
};

const ORDINE_CATEGORIE: Categoria[] = ['fuoco', 'mischia', 'lancio', 'altro'];

interface Props {
  onScegli: (icona: IconaArma) => void;
  onNessuna: () => void;
  onRipristinaSuggerimento: () => void;
  onChiudi: () => void;
}

export function IconaSelezionatore({ onScegli, onNessuna, onRipristinaSuggerimento, onChiudi }: Props) {
  const curate = CATALOGO_ICONE.filter((v) => v.id !== 'ripiego');

  return (
    <Dialogo titolo="Scegli un'icona" onChiudi={onChiudi}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {ORDINE_CATEGORIE.map((cat) => {
          const voci = curate.filter((v) => v.categoria === cat);
          if (voci.length === 0) return null;
          return (
            <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className={comuni.etichetta}>{ETICHETTE_CATEGORIA[cat].toUpperCase()}</span>
              <div role="listbox" aria-label={ETICHETTE_CATEGORIA[cat]} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {voci.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    role="option"
                    aria-selected={false}
                    aria-label={v.etichetta}
                    onClick={() => onScegli({ id: v.id, sorgente: v.sorgente, bloccata: true })}
                    style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 68 }}
                  >
                    <ArmaIcona icona={{ id: v.id, sorgente: v.sorgente, bloccata: false }} dimensione={40} decorativa />
                    <span style={{ fontSize: 11, color: 'var(--colore-testo-attenuato)', textAlign: 'center' }}>{v.etichetta}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <div style={{ borderTop: '1px solid var(--colore-bordo)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className={comuni.etichetta}>CERCA NEL CATALOGO COMPLETO</span>
          <CercaCatalogoCompleto onScegli={(nome, corpo) => onScegli({ id: nome, sorgente: 'game-icons', bloccata: true, corpo })} />
        </div>

        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', borderTop: '1px solid var(--colore-bordo)', paddingTop: 16, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <button type="button" className={comuni.bottoneTesto} onClick={onNessuna}>
              Nessuna icona
            </button>
            <button type="button" className={comuni.bottoneTesto} onClick={onRipristinaSuggerimento}>
              Torna al suggerimento automatico
            </button>
          </div>
          <button type="button" className={comuni.bottoneTesto} onClick={onChiudi}>
            Chiudi
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
