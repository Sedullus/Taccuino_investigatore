import { useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import { generatoreDefault } from '../../rules/dice';
import { Dialogo } from '../comuni/Dialogo';
import comuni from '../../theme/comuni.module.css';

interface Props {
  onChiudi: () => void;
  onTiraINT: () => void;
}

export function TiroSanitaDialogo({ onChiudi, onTiraINT }: Props) {
  const eseguiTiroSanita = useInvestigatoreStore((s) => s.eseguiTiroSanitaInvestigatore);
  const [formato, setFormato] = useState('0/1D6');
  const [esito, setEsito] = useState<ReturnType<typeof eseguiTiroSanita> | null>(null);

  function tira() {
    const roll = generatoreDefault(100);
    setEsito(eseguiTiroSanita(formato, roll));
  }

  return (
    <Dialogo titolo="Tiro Sanità" onChiudi={onChiudi}>
      {!esito ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className={comuni.etichetta}>PERDITA — FORMATO SUCCESSO/FALLIMENTO</span>
            <input className={comuni.input} value={formato} onChange={(e) => setFormato(e.target.value)} placeholder="es. 0/1D6" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
            <button type="button" className={comuni.bottoneTesto} onClick={onChiudi}>
              Annulla
            </button>
            <button type="button" className={comuni.bottoneTestoAttivo} onClick={tira}>
              Tira
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ borderLeft: '2px solid var(--colore-accento)', paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="cifre" style={{ fontSize: 26 }}>
              {esito.disastro ? 'Disastro' : esito.riuscito ? 'Successo' : 'Fallimento'}
            </span>
            <span style={{ fontSize: 14, color: 'var(--colore-testo-attenuato)' }}>Perdita di SAN: {esito.perdita}.</span>
            {esito.richiedeINT && <span style={{ fontSize: 14, color: 'var(--colore-pericolo-testo)' }}>Perdita di 5 o più: serve un tiro INT.</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
            {esito.richiedeINT && (
              <button type="button" className={comuni.bottoneTestoAttivo} onClick={onTiraINT}>
                Tira INT
              </button>
            )}
            <button type="button" className={comuni.bottoneTesto} onClick={onChiudi}>
              Chiudi
            </button>
          </div>
        </>
      )}
    </Dialogo>
  );
}
