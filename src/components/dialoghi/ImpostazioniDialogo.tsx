import { useInvestigatoreStore } from '../../store/investigatoreStore';
import { Dialogo } from '../comuni/Dialogo';
import comuni from '../../theme/comuni.module.css';

interface Props {
  onChiudi: () => void;
}

export function ImpostazioniDialogo({ onChiudi }: Props) {
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const toggleImpostazione = useInvestigatoreStore((s) => s.toggleImpostazione);
  const setUnitaDistanza = useInvestigatoreStore((s) => s.setUnitaDistanza);

  if (!attivo) return null;

  return (
    <Dialogo titolo="Impostazioni" onChiudi={onChiudi}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', borderBottom: '1px solid var(--colore-bordo)', paddingBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 17, color: 'var(--colore-testo)' }}>Spesa di Fortuna</span>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--colore-testo-debole)' }}>Regola opzionale: dopo un fallimento posso comprare il successo pagando la differenza.</span>
          </div>
          <button type="button" className={comuni.bottone} onClick={() => toggleImpostazione('spesaFortuna')}>
            {attivo.impostazioni.spesaFortuna ? 'Attiva' : 'Disattiva'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', borderBottom: '1px solid var(--colore-bordo)', paddingBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 17, color: 'var(--colore-testo)' }}>Dadi fisici come default</span>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--colore-testo-debole)' }}>Apre il pannello di tiro già in modalità dadi fisici.</span>
          </div>
          <button type="button" className={comuni.bottone} onClick={() => toggleImpostazione('dadiFisici')}>
            {attivo.impostazioni.dadiFisici ? 'Attivi' : 'Disattivi'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className={comuni.etichetta}>UNITÀ DELLA GITTATA RAVVICINATA</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['metri', 'piedi'] as const).map((u) => (
              <button key={u} type="button" className={attivo.impostazioni.unitaDistanza === u ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={() => setUnitaDistanza(u)}>
                {u}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--colore-testo-debole)', maxWidth: '52ch' }}>Il calcolo resta DES diviso 5 in piedi: questo interruttore cambia solo come leggo il numero.</span>
        </div>
      </div>
    </Dialogo>
  );
}
