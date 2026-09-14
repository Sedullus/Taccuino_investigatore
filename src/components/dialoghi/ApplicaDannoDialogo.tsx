import { useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import { Dialogo } from '../comuni/Dialogo';
import comuni from '../../theme/comuni.module.css';

interface Props {
  onChiudi: () => void;
  onTiraCOS: () => void;
}

export function ApplicaDannoDialogo({ onChiudi, onTiraCOS }: Props) {
  const applicaDanno = useInvestigatoreStore((s) => s.applicaDannoInvestigatore);
  const [valore, setValore] = useState('');
  const [esito, setEsito] = useState<ReturnType<typeof applicaDanno> | null>(null);

  function applica() {
    const n = Math.max(0, parseInt(valore, 10) || 0);
    setEsito(applicaDanno(n));
  }

  return (
    <Dialogo titolo="Applica danno" onChiudi={onChiudi}>
      {!esito ? (
        <>
          <input
            className={comuni.input}
            type="number"
            autoFocus
            placeholder="Punti danno"
            value={valore}
            onChange={(e) => setValore(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applica()}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
            <button type="button" className={comuni.bottoneTesto} onClick={onChiudi}>
              Annulla
            </button>
            <button type="button" className={comuni.bottoneTestoAttivo} onClick={applica}>
              Applica
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ borderLeft: '2px solid var(--colore-accento)', paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="cifre" style={{ fontSize: 26 }}>
              {esito.morto ? 'Morto' : esito.morente ? 'Morente' : esito.privoDiSensi ? 'Privo di sensi' : esito.feritaGrave ? 'Ferita Grave' : 'Nessun effetto grave'}
            </span>
            <span style={{ fontSize: 14, color: 'var(--colore-testo-attenuato)' }}>PF ora a {esito.pf}.</span>
            {esito.richiedeTiroCOS && <span style={{ fontSize: 14, color: 'var(--colore-pericolo-testo)' }}>Serve un tiro COS: il fallimento porta Privo di sensi.</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
            {esito.richiedeTiroCOS && (
              <button type="button" className={comuni.bottoneTestoAttivo} onClick={onTiraCOS}>
                Tira COS
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
