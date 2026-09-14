import { useEffect, useState } from 'react';
import { useInvestigatoreStore } from './store/investigatoreStore';
import { VistaStato } from './components/stato/VistaStato';
import { VistaAbilita } from './components/abilita/VistaAbilita';
import { VistaInvestigatori } from './components/investigatori/VistaInvestigatori';
import { PannelloTiro } from './components/tiro/PannelloTiro';
import { ApplicaDannoDialogo } from './components/dialoghi/ApplicaDannoDialogo';
import { TiroSanitaDialogo } from './components/dialoghi/TiroSanitaDialogo';
import { ImpostazioniDialogo } from './components/dialoghi/ImpostazioniDialogo';
import { StatiDialogo } from './components/dialoghi/StatiDialogo';
import comuni from './theme/comuni.module.css';
import styles from './components/layout/Shell.module.css';

type Vista = 'scheda' | 'investigatori';
type TabMobile = 'stato' | 'abilita';
type Dialogo = 'danno' | 'sanita' | 'impostazioni' | 'stati' | null;

export function App() {
  const caricato = useInvestigatoreStore((s) => s.caricato);
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const modalita = useInvestigatoreStore((s) => s.modalita);
  const setModalita = useInvestigatoreStore((s) => s.setModalita);
  const undo = useInvestigatoreStore((s) => s.undo);
  const undoStackLength = useInvestigatoreStore((s) => s.undoStack.length);
  const init = useInvestigatoreStore((s) => s.init);
  const apriTiro = useInvestigatoreStore((s) => s.apriTiro);

  const [vista, setVista] = useState<Vista>('scheda');
  const [tabMobile, setTabMobile] = useState<TabMobile>('stato');
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  useEffect(() => {
    void init();
  }, [init]);

  if (!caricato) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--colore-testo-attenuato)' }}>Carico il taccuino…</div>
    );
  }

  if (vista === 'investigatori' || !attivo) {
    return (
      <div className={styles.pagina}>
        <Testata vista={vista} setVista={setVista} modalita={modalita} setModalita={setModalita} onApriImpostazioni={() => setDialogo('impostazioni')} mostraAzioniScheda={false} />
        <div style={{ padding: '18px clamp(18px,3vw,34px)' }}>
          <VistaInvestigatori />
        </div>
        {dialogo === 'impostazioni' && attivo && <ImpostazioniDialogo onChiudi={() => setDialogo(null)} />}
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      <Testata
        vista={vista}
        setVista={setVista}
        modalita={modalita}
        setModalita={setModalita}
        onApriImpostazioni={() => setDialogo('impostazioni')}
        onApriStati={() => setDialogo('stati')}
        mostraAzioniScheda
      />

      <div className={`${styles.corpo} ${tabMobile === 'stato' ? styles.mobileSoloStato : ''}`}>
        <aside className={styles.aside}>
          <VistaStato onApriDanno={() => setDialogo('danno')} onApriSanita={() => setDialogo('sanita')} />
        </aside>
        <main className={styles.main}>
          <VistaAbilita />
        </main>
      </div>

      <nav className={styles.barraInferiore}>
        <button type="button" className={tabMobile === 'stato' ? styles.voceBarraAttiva : styles.vociBarra} onClick={() => setTabMobile('stato')}>
          Stato
        </button>
        <button type="button" className={tabMobile === 'abilita' ? styles.voceBarraAttiva : styles.vociBarra} onClick={() => setTabMobile('abilita')}>
          Abilità
        </button>
        <button type="button" className={styles.vociBarra} onClick={() => setVista('investigatori')}>
          Schede
        </button>
      </nav>

      <PannelloTiro />

      {dialogo === 'danno' && (
        <ApplicaDannoDialogo
          onChiudi={() => setDialogo(null)}
          onTiraCOS={() => {
            setDialogo(null);
            apriTiro({ tipo: 'caratteristica', nome: 'COS', valore: attivo.caratteristiche.COS, conseguenza: { condizione: 'privoDiSensi', alSuccesso: false } });
          }}
        />
      )}
      {dialogo === 'sanita' && (
        <TiroSanitaDialogo
          onChiudi={() => setDialogo(null)}
          onTiraINT={() => {
            setDialogo(null);
            apriTiro({ tipo: 'caratteristica', nome: 'INT (perdita di SAN)', valore: attivo.caratteristiche.INT, conseguenza: { condizione: 'folliaTemporanea', alSuccesso: true } });
          }}
        />
      )}
      {dialogo === 'impostazioni' && <ImpostazioniDialogo onChiudi={() => setDialogo(null)} />}
      {dialogo === 'stati' && <StatiDialogo onChiudi={() => setDialogo(null)} />}

      {undoStackLength > 0 && (
        <button
          type="button"
          className={comuni.bottoneTesto}
          style={{ position: 'fixed', right: 16, bottom: 72, background: 'var(--colore-superficie-alta)', border: '1px solid var(--colore-bordo-forte)', padding: '8px 12px', zIndex: 7 }}
          onClick={undo}
        >
          Annulla ultima azione
        </button>
      )}
    </div>
  );
}

interface TestataProps {
  vista: Vista;
  setVista: (v: Vista) => void;
  modalita: 'gioco' | 'modifica';
  setModalita: (m: 'gioco' | 'modifica') => void;
  onApriImpostazioni: () => void;
  onApriStati?: () => void;
  mostraAzioniScheda: boolean;
}

function Testata({ vista, setVista, modalita, setModalita, onApriImpostazioni, onApriStati, mostraAzioniScheda }: TestataProps) {
  return (
    <div className={styles.intestazione}>
      <span className={styles.titolo}>Taccuino dell'Investigatore</span>
      <div className={styles.azioniTesta}>
        {mostraAzioniScheda && (
          <>
            <button type="button" className={comuni.bottone} onClick={() => setModalita(modalita === 'gioco' ? 'modifica' : 'gioco')}>
              {modalita === 'gioco' ? 'Modalità Gioco' : 'Modalità Modifica'}
            </button>
            {onApriStati && (
              <button type="button" className={comuni.bottone} onClick={onApriStati}>
                Stati
              </button>
            )}
          </>
        )}
        <button type="button" className={comuni.bottone} onClick={onApriImpostazioni}>
          Impostazioni
        </button>
        <button type="button" className={comuni.bottone} onClick={() => setVista(vista === 'investigatori' ? 'scheda' : 'investigatori')}>
          {vista === 'investigatori' ? 'Torna alla scheda' : 'Investigatori'}
        </button>
      </div>
    </div>
  );
}
