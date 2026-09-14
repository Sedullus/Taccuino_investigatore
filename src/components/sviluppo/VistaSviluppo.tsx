import { useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import comuni from '../../theme/comuni.module.css';
import styles from './VistaSviluppo.module.css';

export function VistaSviluppo() {
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const eseguiSviluppoTutte = useInvestigatoreStore((s) => s.eseguiSviluppoTutte);
  const eseguiRecuperoFortuna = useInvestigatoreStore((s) => s.eseguiRecuperoFortuna);

  const [risultati, setRisultati] = useState<ReturnType<typeof eseguiSviluppoTutte> | null>(null);
  const [recupero, setRecupero] = useState<ReturnType<typeof eseguiRecuperoFortuna> | null>(null);

  if (!attivo) return null;
  const spuntate = attivo.abilita.filter((a) => a.spunta);
  const totaleAumentate = risultati?.filter((r) => r.aumenta).length ?? 0;
  const totaleSAN = risultati?.reduce((acc, r) => acc + (r.guadagnaSAN ? 1 : 0), 0) ?? 0;

  return (
    <div className={`${styles.blocco} animato`}>
      <div style={{ fontFamily: 'var(--font-prosa)', fontSize: 20, color: 'var(--colore-testo)' }}>Fine scenario. Conto quello che ho imparato.</div>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--colore-testo-attenuato)', maxWidth: '60ch' }}>
        Ogni abilità spuntata tira 1D100. Se il risultato supera il valore, oppure supera 95, guadagna 1D10. La spunta si toglie comunque.
      </p>

      {!risultati ? (
        spuntate.length === 0 ? (
          <div className={styles.vuoto}>Nessuna spunta. Questo scenario non mi ha insegnato niente.</div>
        ) : (
          <div>
            {spuntate.map((a) => (
              <div key={a.id} className={styles.riga}>
                <span style={{ flex: 1, fontSize: 16, color: 'var(--colore-testo)' }}>{a.nome}</span>
                <span className="cifre" style={{ fontSize: 14, color: 'var(--colore-testo-attenuato)' }}>
                  base {a.valore}
                </span>
              </div>
            ))}
          </div>
        )
      ) : (
        <div>
          {risultati.map((r, i) => (
            <div key={i} className={styles.riga}>
              <span style={{ flex: 1, fontSize: 16, color: 'var(--colore-testo)' }}>{r.nome}</span>
              <span className="cifre" style={{ fontSize: 14, color: 'var(--colore-testo-attenuato)' }}>
                {r.aumenta ? (r.guadagnaSAN ? '+SAN' : '') : 'nessun aumento'}
              </span>
              <span className="cifre" style={{ fontSize: 22, color: r.aumenta ? 'var(--colore-successo-testo)' : 'var(--colore-testo-attenuato)' }}>{r.nuovoValore}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.rigaAzioni}>
        <button
          type="button"
          className={comuni.bottoneTestoAttivo}
          disabled={spuntate.length === 0 || risultati != null}
          onClick={() => setRisultati(eseguiSviluppoTutte())}
        >
          Tira per tutte
        </button>
        {risultati && (
          <span className="cifre" style={{ color: 'var(--colore-successo-testo)' }}>
            {totaleAumentate} aumentate{totaleSAN > 0 ? ` · +2D6 SAN ×${totaleSAN}` : ''}
          </span>
        )}
      </div>

      <div className={styles.recupero}>
        <span className={comuni.etichetta}>RECUPERO DI FINE SESSIONE — OPZIONALE</span>
        <p style={{ fontFamily: 'var(--font-prosa)', fontSize: 17, lineHeight: 1.55, color: 'var(--colore-testo-attenuato)', maxWidth: '60ch' }}>
          Tiro 1D100 sulla Fortuna. Se il numero la supera, ne guadagno 1D10, fino a un massimo di 99. Se non la supera, resta come sta.
        </p>
        <div className={styles.rigaAzioni}>
          <button type="button" className={comuni.bottoneTestoAttivo} disabled={recupero != null} onClick={() => setRecupero(eseguiRecuperoFortuna())}>
            Tira il recupero
          </button>
          {recupero && (
            <span className="cifre" style={{ color: 'var(--colore-accento)' }}>
              tiro {recupero.tiro}
              {recupero.guadagna ? ` supera la Fortuna precedente · nuova Fortuna ${recupero.nuovaFortuna}` : ' non supera la Fortuna: resta com\'era'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
