import styles from './Tracker.module.css';

interface Props {
  etichetta: string;
  valore: number;
  massimo?: number;
  onMeno: () => void;
  onPiu: () => void;
  onValore?: () => void;
}

export function Tracker({ etichetta, valore, massimo, onMeno, onPiu, onValore }: Props) {
  return (
    <div className={styles.blocco}>
      <span className={styles.etichetta}>{etichetta}</span>
      <div className={styles.riga}>
        <button type="button" className={styles.pulsante} onClick={onMeno} aria-label={`${etichetta} meno`}>
          −
        </button>
        <span
          className={`${styles.valore} cifre`}
          role={onValore ? 'button' : undefined}
          tabIndex={onValore ? 0 : undefined}
          onClick={onValore}
          onKeyDown={onValore ? (e) => (e.key === 'Enter' || e.key === ' ') && onValore() : undefined}
          style={onValore ? { cursor: 'pointer' } : undefined}
        >
          {valore}
          {massimo != null && <span className={styles.max}>/{massimo}</span>}
        </span>
        <button type="button" className={styles.pulsante} onClick={onPiu} aria-label={`${etichetta} più`}>
          +
        </button>
      </div>
    </div>
  );
}
