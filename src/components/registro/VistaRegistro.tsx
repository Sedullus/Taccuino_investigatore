import { useInvestigatoreStore } from '../../store/investigatoreStore';
import comuni from '../../theme/comuni.module.css';
import styles from './VistaRegistro.module.css';

export function VistaRegistro() {
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const undo = useInvestigatoreStore((s) => s.undo);
  const undoStackLength = useInvestigatoreStore((s) => s.undoStack.length);

  if (!attivo) return null;

  return (
    <div className={`${styles.blocco} animato`}>
      <div className={styles.rigaAnnulla}>
        <button type="button" className={comuni.bottoneTestoAttivo} disabled={undoStackLength === 0} onClick={undo}>
          Annulla ultima azione
        </button>
        <span className="cifre" style={{ fontSize: 12, color: 'var(--colore-testo-attenuato)' }}>
          {undoStackLength} {undoStackLength === 1 ? 'passo' : 'passi'} disponibili
        </span>
      </div>

      {attivo.registro.length === 0 ? (
        <div className={styles.vuoto}>La serata non ha ancora lasciato tracce.</div>
      ) : (
        <div>
          {attivo.registro.map((r) => (
            <div key={r.id} className={styles.riga}>
              <span className="cifre" style={{ color: 'var(--colore-testo-attenuato)', flex: 'none' }}>
                {r.ora}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 15, color: 'var(--colore-testo)' }}>{r.tipo}</span>
                <span className="cifre" style={{ fontSize: 12, color: 'var(--colore-testo-attenuato)' }}>
                  {r.dettaglio}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
