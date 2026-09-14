import { useRef, useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import { Dialogo } from '../comuni/Dialogo';
import comuni from '../../theme/comuni.module.css';
import styles from './VistaInvestigatori.module.css';

export function VistaInvestigatori() {
  const elenco = useInvestigatoreStore((s) => s.elenco);
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const selezionaScheda = useInvestigatoreStore((s) => s.selezionaScheda);
  const creaSchedaVuota = useInvestigatoreStore((s) => s.creaSchedaVuota);
  const duplicaScheda = useInvestigatoreStore((s) => s.duplicaScheda);
  const eliminaScheda = useInvestigatoreStore((s) => s.eliminaScheda);
  const esportaSchedaAttiva = useInvestigatoreStore((s) => s.esportaSchedaAttiva);
  const importaScheda = useInvestigatoreStore((s) => s.importaScheda);
  const erroreImportMessaggio = useInvestigatoreStore((s) => s.erroreImportMessaggio);
  const chiudiErroreImport = useInvestigatoreStore((s) => s.chiudiErroreImport);

  const [daEliminare, setDaEliminare] = useState<string | null>(null);
  const inputFile = useRef<HTMLInputElement>(null);

  function esporta() {
    const testo = esportaSchedaAttiva();
    if (!testo || !attivo) return;
    const blob = new Blob([testo], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${attivo.anagrafica.nome || 'investigatore'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function suFileScelto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const testo = await file.text();
    await importaScheda(testo);
  }

  return (
    <div className={`${styles.blocco} animato`}>
      {elenco.length === 0 ? (
        <div className={styles.vuotoBlocco}>
          <div className={styles.vuotoTitolo}>Il taccuino è nuovo. Nessun nome scritto in prima pagina.</div>
          <div className={styles.vuotoTesto}>Apro una scheda vuota e la compilo in Modalità Modifica, oppure recupero un file che ho già salvato.</div>
          <div className={styles.azioniPrincipali}>
            <button type="button" className={comuni.bottoneTestoAttivo} onClick={creaSchedaVuota}>
              Scheda vuota
            </button>
            <button type="button" className={comuni.bottoneTesto} onClick={() => inputFile.current?.click()}>
              Importa un file
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>
            {elenco.map((v) => (
              <div key={v.id} className={styles.riga} style={{ borderLeftColor: v.id === attivo?.id ? 'var(--colore-accento)' : 'transparent' }}>
                <div className={styles.iniziali}>{v.nome.slice(0, 2).toUpperCase()}</div>
                <button type="button" className={styles.apri} onClick={() => selezionaScheda(v.id)}>
                  <span className={styles.nome} style={{ color: v.id === attivo?.id ? 'var(--colore-testo)' : 'var(--colore-testo-attenuato)' }}>
                    {v.nome}
                  </span>
                  <span className={styles.nota}>{v.nota}</span>
                </button>
                <div className={styles.azioniRiga}>
                  <button type="button" className={comuni.bottoneTesto} onClick={() => duplicaScheda(v.id)}>
                    Duplica
                  </button>
                  <button type="button" className={comuni.bottoneTestoPericolo} onClick={() => setDaEliminare(v.id)}>
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.azioniPrincipali}>
            <button type="button" className={comuni.bottoneTestoAttivo} onClick={creaSchedaVuota}>
              Scheda vuota
            </button>
            <button type="button" className={comuni.bottoneTesto} onClick={() => inputFile.current?.click()}>
              Importa file
            </button>
            <button type="button" className={comuni.bottoneTesto} disabled={!attivo} onClick={esporta}>
              Esporta la scheda aperta
            </button>
          </div>
        </>
      )}

      <input ref={inputFile} type="file" accept="application/json" style={{ display: 'none' }} onChange={suFileScelto} />

      {erroreImportMessaggio && (
        <Dialogo titolo="Questo file non è una scheda leggibile" onChiudi={chiudiErroreImport}>
          <p style={{ color: 'var(--colore-testo-attenuato)' }}>{erroreImportMessaggio} Non ho toccato niente: l'investigatore aperto è rimasto come stava.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
            <button type="button" className={comuni.bottoneTesto} onClick={chiudiErroreImport}>
              Chiudi
            </button>
          </div>
        </Dialogo>
      )}

      {daEliminare && (
        <Dialogo titolo="Eliminare questo investigatore?" onChiudi={() => setDaEliminare(null)}>
          <p style={{ color: 'var(--colore-testo-attenuato)' }}>Non si può annullare. La scheda e il registro andranno persi.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
            <button type="button" className={comuni.bottoneTesto} onClick={() => setDaEliminare(null)}>
              Annulla
            </button>
            <button
              type="button"
              className={comuni.bottoneTestoPericolo}
              onClick={() => {
                void eliminaScheda(daEliminare);
                setDaEliminare(null);
              }}
            >
              Elimina
            </button>
          </div>
        </Dialogo>
      )}
    </div>
  );
}
