import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import styles from './Dialogo.module.css';

interface Props {
  titolo: string;
  onChiudi: () => void;
  children: ReactNode;
}

export function Dialogo({ titolo, onChiudi, children }: Props) {
  const rif = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rif.current?.focus();
    function suEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onChiudi();
    }
    document.addEventListener('keydown', suEsc);
    return () => document.removeEventListener('keydown', suEsc);
  }, [onChiudi]);

  return (
    <div className={styles.sfondo} onClick={onChiudi}>
      <div
        ref={rif}
        className={`${styles.finestra} animato`}
        role="dialog"
        aria-modal="true"
        aria-label={titolo}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.titolo}>{titolo}</div>
        {children}
      </div>
    </div>
  );
}
