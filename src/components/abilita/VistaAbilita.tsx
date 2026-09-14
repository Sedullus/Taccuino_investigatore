import { useMemo, useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import { meta, quinto } from '../../rules/derived';
import comuni from '../../theme/comuni.module.css';
import styles from './VistaAbilita.module.css';
import { AggiungiAbilitaDialogo } from './AggiungiAbilitaDialogo';

export function VistaAbilita() {
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const modalita = useInvestigatoreStore((s) => s.modalita);
  const apriTiro = useInvestigatoreStore((s) => s.apriTiro);
  const toggleSpunta = useInvestigatoreStore((s) => s.toggleSpuntaAbilita);
  const togglePreferita = useInvestigatoreStore((s) => s.togglePreferitaAbilita);
  const aggiornaValore = useInvestigatoreStore((s) => s.aggiornaValoreAbilita);

  const [ricerca, setRicerca] = useState('');
  const [soloAllenate, setSoloAllenate] = useState(false);
  const [aggiungiAperto, setAggiungiAperto] = useState(false);

  const lista = useMemo(() => {
    if (!attivo) return [];
    const q = ricerca.trim().toLowerCase();
    let l = attivo.abilita.filter((a) => {
      if (q && !a.nome.toLowerCase().includes(q)) return false;
      if (soloAllenate && a.valore <= a.base) return false;
      return true;
    });
    l = [...l].sort((a, b) => {
      if (a.preferita !== b.preferita) return a.preferita ? -1 : 1;
      return a.nome.localeCompare(b.nome, 'it');
    });
    return l;
  }, [attivo, ricerca, soloAllenate]);

  if (!attivo) return null;
  const gioco = modalita === 'gioco';

  return (
    <div className={`${styles.blocco} animato`}>
      <div className={styles.barraRicerca}>
        <input
          className={comuni.input}
          style={{ flex: 1, minWidth: 180 }}
          placeholder="Cerca un'abilità"
          value={ricerca}
          onChange={(e) => setRicerca(e.target.value)}
        />
        <button type="button" className={soloAllenate ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={() => setSoloAllenate((v) => !v)}>
          Solo allenate
        </button>
        <button type="button" className={comuni.bottoneTestoAttivo} onClick={() => setAggiungiAperto(true)}>
          Aggiungi abilità
        </button>
      </div>

      <div>
        {lista.map((a) => (
          <div key={a.id} className={styles.riga}>
            <button type="button" className={styles.stella} style={{ color: a.preferita ? 'var(--colore-accento)' : 'var(--colore-bordo-forte)' }} onClick={() => togglePreferita(a.id)} aria-label="Preferita">
              ✦
            </button>
            <button type="button" className={styles.nomeAbilita} onClick={() => apriTiro({ tipo: 'abilita', nome: a.nome, valore: a.valore, skillId: a.id })}>
              <span className={styles.nome}>{a.nome}</span>
              <span className={`${styles.nota} cifre`}>{a.valore > a.base ? `allenata · base ${a.base}` : `base ${a.base}`}</span>
            </button>
            {gioco ? (
              <button type="button" className={styles.valoreTiro} onClick={() => apriTiro({ tipo: 'abilita', nome: a.nome, valore: a.valore, skillId: a.id })}>
                <span className="cifre" style={{ fontSize: 24, fontWeight: 300 }}>
                  {a.valore}
                </span>
                <span className={`cifre ${styles.metaQuinto}`}>
                  {meta(a.valore)} · {quinto(a.valore)}
                </span>
              </button>
            ) : (
              <input
                className={comuni.input}
                style={{ width: 72 }}
                type="number"
                value={a.valore}
                onChange={(e) => aggiornaValore(a.id, Math.max(0, Math.min(99, parseInt(e.target.value, 10) || 0)))}
              />
            )}
            <button
              type="button"
              className={styles.spuntaBox}
              disabled={a.nonSpuntabile}
              style={{
                borderColor: a.nonSpuntabile ? 'var(--colore-bordo)' : a.spunta ? 'var(--colore-successo)' : 'var(--colore-bordo-forte)',
                color: a.spunta ? 'var(--colore-successo-testo)' : 'transparent',
              }}
              onClick={() => toggleSpunta(a.id)}
              aria-label="Spunta esperienza"
            >
              {a.nonSpuntabile ? '' : '✓'}
            </button>
          </div>
        ))}
      </div>

      {lista.length === 0 && <div className={styles.vuoto}>Nessuna voce risponde a questo nome. Forse non l'ho mai imparata.</div>}

      {aggiungiAperto && <AggiungiAbilitaDialogo onChiudi={() => setAggiungiAperto(false)} />}
    </div>
  );
}
