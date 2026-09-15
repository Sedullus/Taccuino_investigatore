import { useEffect, useState } from 'react';
import { useInvestigatoreStore } from './store/investigatoreStore';
import { VistaStato } from './components/stato/VistaStato';
import { VistaAbilita } from './components/abilita/VistaAbilita';
import { VistaCombattimento } from './components/combattimento/VistaCombattimento';
import { VistaTrascorsi } from './components/trascorsi/VistaTrascorsi';
import { VistaNote } from './components/note/VistaNote';
import { VistaRegistro } from './components/registro/VistaRegistro';
import { VistaSviluppo } from './components/sviluppo/VistaSviluppo';
import { VistaInvestigatori } from './components/investigatori/VistaInvestigatori';
import { PannelloTiro } from './components/tiro/PannelloTiro';
import { ApplicaDannoDialogo } from './components/dialoghi/ApplicaDannoDialogo';
import { TiroSanitaDialogo } from './components/dialoghi/TiroSanitaDialogo';
import { ImpostazioniDialogo } from './components/dialoghi/ImpostazioniDialogo';
import { StatiDialogo } from './components/dialoghi/StatiDialogo';
import { useWakeLock } from './hooks/useWakeLock';
import { useTema } from './hooks/useTema';
import comuni from './theme/comuni.module.css';
import styles from './components/layout/Shell.module.css';

type Vista = 'scheda' | 'investigatori';
type TabMobile = 'stato' | 'main';
type TabContenuto = 'abilita' | 'combattimento' | 'trascorsi' | 'note' | 'registro' | 'sviluppo';
type Dialogo = 'danno' | 'sanita' | 'impostazioni' | 'stati' | null;

const TAB_CONTENUTO: { valore: TabContenuto; nome: string }[] = [
  { valore: 'abilita', nome: 'Abilità' },
  { valore: 'combattimento', nome: 'Combattimento' },
  { valore: 'trascorsi', nome: 'Trascorsi' },
  { valore: 'note', nome: 'Note e indizi' },
  { valore: 'registro', nome: 'Registro' },
  { valore: 'sviluppo', nome: 'Fine scenario' },
];

export function App() {
  const caricato = useInvestigatoreStore((s) => s.caricato);
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const modalita = useInvestigatoreStore((s) => s.modalita);
  const setModalita = useInvestigatoreStore((s) => s.setModalita);
  const init = useInvestigatoreStore((s) => s.init);
  const apriTiro = useInvestigatoreStore((s) => s.apriTiro);
  const { tema, setTema } = useTema();

  const [vista, setVista] = useState<Vista>('scheda');
  const [tabMobile, setTabMobile] = useState<TabMobile>('stato');
  const [tab, setTab] = useState<TabContenuto>('abilita');
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  useEffect(() => {
    void init();
  }, [init]);

  if (!caricato) {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--colore-testo-attenuato)' }}>Carico il taccuino…</div>;
  }

  if (vista === 'investigatori' || !attivo) {
    return (
      <div className={styles.pagina}>
        <Testata vista={vista} setVista={setVista} modalita={modalita} setModalita={setModalita} onApriImpostazioni={() => setDialogo('impostazioni')} mostraAzioniScheda={false} />
        <div style={{ padding: '18px clamp(18px,3vw,34px)' }}>
          <VistaInvestigatori />
        </div>
        {dialogo === 'impostazioni' && <ImpostazioniDialogo onChiudi={() => setDialogo(null)} tema={tema} setTema={setTema} />}
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
          <div className={styles.rigaTab} data-print-hide>
            {TAB_CONTENUTO.map((t) => (
              <button key={t.valore} type="button" className={tab === t.valore ? styles.tabAttiva : styles.tab} onClick={() => setTab(t.valore)}>
                {t.nome}
              </button>
            ))}
          </div>
          {tab === 'abilita' && <VistaAbilita />}
          {tab === 'combattimento' && <VistaCombattimento />}
          {tab === 'trascorsi' && <VistaTrascorsi />}
          {tab === 'note' && <VistaNote />}
          {tab === 'registro' && <VistaRegistro />}
          {tab === 'sviluppo' && <VistaSviluppo />}
        </main>
      </div>

      <nav className={styles.barraInferiore} data-print-hide>
        <button type="button" className={tabMobile === 'stato' ? styles.voceBarraAttiva : styles.vociBarra} onClick={() => setTabMobile('stato')}>
          Stato
        </button>
        <button
          type="button"
          className={tabMobile === 'main' && tab === 'abilita' ? styles.voceBarraAttiva : styles.vociBarra}
          onClick={() => {
            setTabMobile('main');
            setTab('abilita');
          }}
        >
          Abilità
        </button>
        <button
          type="button"
          className={tabMobile === 'main' && tab === 'combattimento' ? styles.voceBarraAttiva : styles.vociBarra}
          onClick={() => {
            setTabMobile('main');
            setTab('combattimento');
          }}
        >
          Armi
        </button>
        <button
          type="button"
          className={tabMobile === 'main' && tab === 'trascorsi' ? styles.voceBarraAttiva : styles.vociBarra}
          onClick={() => {
            setTabMobile('main');
            setTab('trascorsi');
          }}
        >
          Trascorsi
        </button>
        <button
          type="button"
          className={tabMobile === 'main' && tab === 'registro' ? styles.voceBarraAttiva : styles.vociBarra}
          onClick={() => {
            setTabMobile('main');
            setTab('registro');
          }}
        >
          Registro
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
      {dialogo === 'impostazioni' && <ImpostazioniDialogo onChiudi={() => setDialogo(null)} tema={tema} setTema={setTema} />}
      {dialogo === 'stati' && <StatiDialogo onChiudi={() => setDialogo(null)} />}
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
  const { supportato, attivo: wakeLockAttivo, toggle: toggleWakeLock } = useWakeLock();

  return (
    <div className={styles.intestazione}>
      <span className={styles.titolo}>Taccuino dell'Investigatore</span>
      <div className={styles.azioniTesta} data-print-hide>
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
            {supportato && (
              <button type="button" className={comuni.bottone} onClick={toggleWakeLock} title="Impedisce allo schermo di spegnersi durante la sessione">
                {wakeLockAttivo ? 'Schermo sempre acceso ✓' : 'Tieni lo schermo acceso'}
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
