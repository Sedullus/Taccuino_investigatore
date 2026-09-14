import { useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import { puoForzareTiro, puoSpendereFortuna, valutaTiro } from '../../rules/checks';
import type { Difficolta } from '../../rules/types';
import comuni from '../../theme/comuni.module.css';
import styles from './PannelloTiro.module.css';

const DIFFICOLTA: { valore: Difficolta; nome: string }[] = [
  { valore: 'normale', nome: 'Normale' },
  { valore: 'arduo', nome: 'Arduo' },
  { valore: 'estremo', nome: 'Estremo' },
];

const COLORE_LIVELLO: Record<string, string> = {
  DISASTRO: 'var(--colore-pericolo-testo)',
  FALLIMENTO: 'var(--colore-testo-attenuato)',
  NORMALE: 'var(--colore-testo)',
  ARDUO: 'var(--colore-successo-testo)',
  ESTREMO: 'var(--colore-successo-testo)',
  CRITICO: 'var(--colore-accento)',
};

export function PannelloTiro() {
  const tiro = useInvestigatoreStore((s) => s.tiro);
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const impostaDifficolta = useInvestigatoreStore((s) => s.impostaDifficoltaTiro);
  const impostaDadi = useInvestigatoreStore((s) => s.impostaDadiTiro);
  const toggleFisico = useInvestigatoreStore((s) => s.toggleFisicoTiro);
  const tiraVirtuale = useInvestigatoreStore((s) => s.tiraVirtuale);
  const applicaDadiFisici = useInvestigatoreStore((s) => s.applicaDadiFisici);
  const applicaRisultatoManuale = useInvestigatoreStore((s) => s.applicaRisultatoManuale);
  const forzaTiro = useInvestigatoreStore((s) => s.forzaTiroAttivo);
  const spendiFortuna = useInvestigatoreStore((s) => s.spendiFortunaTiroAttivo);
  const chiudiTiro = useInvestigatoreStore((s) => s.chiudiTiro);

  const [unitaFisica, setUnitaFisica] = useState('');
  const [decineFisiche, setDecineFisiche] = useState('');
  const [risultatoManuale, setRisultatoManuale] = useState('');

  if (!tiro || !attivo) return null;

  const esitoRicalcolato = tiro.esito ? valutaTiro(tiro.valore, tiro.esito.roll, tiro.difficolta) : null;
  const permessoForza = tiro.esito ? puoForzareTiro(tiro.tipo, esitoRicalcolato?.riuscito ?? tiro.esito.riuscito, tiro.forzato) : null;
  const permessoFortuna =
    tiro.esito && esitoRicalcolato
      ? puoSpendereFortuna(esitoRicalcolato, { tipo: tiro.tipo, livello: tiro.esito.livello, forzato: tiro.forzato, spesaFortunaAbilitata: attivo.impostazioni.spesaFortuna })
      : null;

  function confermaDadiFisici() {
    const unita = Math.max(0, Math.min(9, parseInt(unitaFisica, 10) || 0));
    const decine = decineFisiche
      .split(/\s+/)
      .filter(Boolean)
      .map((s) => Math.max(0, Math.min(90, Math.round((parseInt(s, 10) || 0) / 10) * 10)));
    if (decine.length === 0) return;
    applicaDadiFisici(unita, decine);
  }

  return (
    <div className={`${styles.pannello} animato`} role="complementary" aria-label="Pannello di tiro">
      <div className={styles.testata}>
        <span className={comuni.etichetta}>TIRI</span>
        <button type="button" className={comuni.bottoneTesto} style={{ marginLeft: 'auto' }} onClick={chiudiTiro}>
          Chiudi
        </button>
      </div>

      <div className={styles.corpo}>
        <div className={styles.riepilogo}>
          <span className={styles.nome}>{tiro.nome}</span>
          <span className={`cifre ${styles.valoreBase}`}>{tiro.valore}</span>
        </div>

        {!tiro.esito && (
          <div className={styles.controlli}>
            <div className={styles.riga}>
              {DIFFICOLTA.map((d) => (
                <button key={d.valore} type="button" className={tiro.difficolta === d.valore ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={() => impostaDifficolta(d.valore)}>
                  {d.nome}
                </button>
              ))}
            </div>

            <div className={styles.riga}>
              <span className={comuni.etichetta}>DADI</span>
              {[-2, -1, 0, 1, 2].map((n) => (
                <button key={n} type="button" className={`cifre ${tiro.dadiNetti === n ? comuni.bottoneTestoAttivo : comuni.bottoneTesto}`} onClick={() => impostaDadi(n)}>
                  {n === 0 ? '0' : n > 0 ? `+${n}` : n}
                </button>
              ))}
            </div>

            <div className={styles.riga}>
              <button type="button" className={comuni.bottoneTestoAttivo} onClick={tiraVirtuale}>
                Tira
              </button>
              <button type="button" className={tiro.fisico ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={toggleFisico}>
                Dadi fisici
              </button>
            </div>

            {tiro.fisico && (
              <div className={styles.blocFisico}>
                <div className={styles.riga}>
                  <span className={comuni.etichetta}>UNITÀ</span>
                  <input className={comuni.input} style={{ width: 70 }} placeholder="0–9" value={unitaFisica} onChange={(e) => setUnitaFisica(e.target.value)} />
                  <span className={comuni.etichetta}>DECINE</span>
                  <input className={comuni.input} style={{ width: 110 }} placeholder="00 30" value={decineFisiche} onChange={(e) => setDecineFisiche(e.target.value)} />
                  <button type="button" className={comuni.bottoneTesto} onClick={confermaDadiFisici}>
                    Applica i dadi
                  </button>
                </div>
                <div className={styles.riga}>
                  <span className={comuni.etichetta}>OPPURE IL RISULTATO</span>
                  <input className={comuni.input} style={{ width: 90 }} placeholder="es. 24" value={risultatoManuale} onChange={(e) => setRisultatoManuale(e.target.value)} />
                  <button type="button" className={comuni.bottoneTesto} onClick={() => applicaRisultatoManuale(Math.max(1, Math.min(100, parseInt(risultatoManuale, 10) || 0)))}>
                    Applica
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tiro.esito && (
          <div className={styles.esito}>
            <div className={styles.rigaEsito}>
              <span className={`cifre ${styles.valoreFinale}`}>{tiro.esito.roll}</span>
              <span className="cifre" style={{ color: COLORE_LIVELLO[tiro.esito.livello], letterSpacing: '0.14em', fontSize: 13 }}>
                {tiro.esito.livello}
              </span>
            </div>
            <div className={`cifre ${styles.dettaglioEsito}`}>
              obiettivo {tiro.esito.obiettivo} · {tiro.esito.riuscito ? 'successo' : 'fallimento'}
              {tiro.forzato && ' · forzato'}
              {tiro.fortunaSpesa != null && ` · Fortuna spesa ${tiro.fortunaSpesa}`}
            </div>

            {permessoForza?.consentito && <div className={styles.promemoria}>Prima di forzare, concorda con il Custode la giustificazione e le conseguenze.</div>}

            <div className={styles.azioni}>
              {permessoForza && (
                <button type="button" className={comuni.bottoneTesto} disabled={!permessoForza.consentito} title={permessoForza.motivo} onClick={forzaTiro}>
                  {permessoForza.consentito ? 'Forza il tiro' : `Forza il tiro — ${permessoForza.motivo}`}
                </button>
              )}
              {permessoFortuna && (
                <button type="button" className={comuni.bottoneTestoSuccesso} disabled={!permessoFortuna.consentito} title={permessoFortuna.motivo} onClick={spendiFortuna}>
                  {permessoFortuna.consentito ? `Spendi Fortuna (${permessoFortuna.costo})` : `Spendi Fortuna — ${permessoFortuna.motivo}`}
                </button>
              )}
              <button type="button" className={comuni.bottoneTesto} onClick={chiudiTiro}>
                Chiudi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
