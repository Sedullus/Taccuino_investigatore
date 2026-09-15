import { useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import { suggerimentoDenaro } from '../../rules/derived';
import type { Trascorsi } from '../../rules/types';
import comuni from '../../theme/comuni.module.css';
import styles from './VistaTrascorsi.module.css';

const CAMPI_TRASCORSI: { chiave: keyof Trascorsi; etichetta: string; invito: string }[] = [
  { chiave: 'descrizionePersonale', etichetta: 'Descrizione Personale', invito: 'Come mi vedo allo specchio.' },
  { chiave: 'ideologiaCredo', etichetta: 'Ideologia/Credo', invito: 'Quello in cui credo.' },
  { chiave: 'personeImportanti', etichetta: 'Persone Importanti', invito: 'Chi conta, per me.' },
  { chiave: 'luoghiImportanti', etichetta: 'Luoghi Importanti', invito: 'Dove tornerei sempre.' },
  { chiave: 'oggettiDiValore', etichetta: 'Oggetti di Valore', invito: 'Quello che non venderei mai.' },
  { chiave: 'tratti', etichetta: 'Tratti', invito: 'Come mi descriverebbero gli altri.' },
  { chiave: 'feriteECicatrici', etichetta: 'Ferite e Cicatrici', invito: 'I segni che porto addosso.' },
  { chiave: 'fobieEManie', etichetta: 'Fobie e Manie', invito: 'Quello che non riesco a controllare.' },
  { chiave: 'tomiArcani', etichetta: 'Tomi Arcani, Incantesimi, Manufatti', invito: 'Quello che ho scoperto e non avrei voluto.' },
  { chiave: 'incontriConEntitaStrane', etichetta: 'Incontri con Entità Strane', invito: 'Quello che ho visto.' },
];

export function VistaTrascorsi() {
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const aggiornaTrascorsi = useInvestigatoreStore((s) => s.aggiornaTrascorsi);
  const aggiungiOggetto = useInvestigatoreStore((s) => s.aggiungiOggetto);
  const rimuoviOggetto = useInvestigatoreStore((s) => s.rimuoviOggetto);
  const aggiornaDenaro = useInvestigatoreStore((s) => s.aggiornaDenaro);
  const aggiungiCompagno = useInvestigatoreStore((s) => s.aggiungiCompagno);
  const aggiornaCompagno = useInvestigatoreStore((s) => s.aggiornaCompagno);
  const rimuoviCompagno = useInvestigatoreStore((s) => s.rimuoviCompagno);

  const [nuovoOggetto, setNuovoOggetto] = useState('');

  if (!attivo) return null;
  const vdc = attivo.abilita.find((a) => a.radice === 'Valore di Credito')?.valore ?? 0;
  const suggerimento = suggerimentoDenaro(vdc);

  return (
    <div className={`${styles.blocco} animato`}>
      <div className={styles.grigliaTrascorsi}>
        {CAMPI_TRASCORSI.map((c) => (
          <div key={c.chiave} className={styles.campo}>
            <span className={comuni.etichetta}>{c.etichetta}</span>
            <textarea
              className={comuni.input}
              style={{ minHeight: 84, resize: 'vertical' }}
              value={attivo.trascorsi[c.chiave]}
              placeholder={c.invito}
              onChange={(e) => aggiornaTrascorsi(c.chiave, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className={styles.sezione}>
        <span className={comuni.etichetta}>EQUIPAGGIAMENTO</span>
        {attivo.equipaggiamento.map((oggetto, i) => (
          <div key={i} className={styles.rigaLista}>
            <span style={{ flex: 1, fontFamily: 'var(--font-prosa)', fontSize: 17, color: 'var(--colore-testo)' }}>{oggetto}</span>
            <button type="button" className={comuni.bottoneTesto} onClick={() => rimuoviOggetto(i)}>
              Rimuovi
            </button>
          </div>
        ))}
        <div className={styles.rigaAggiungi}>
          <input
            className={comuni.input}
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Cosa mi metto in tasca"
            value={nuovoOggetto}
            onChange={(e) => setNuovoOggetto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && nuovoOggetto.trim()) {
                aggiungiOggetto(nuovoOggetto.trim());
                setNuovoOggetto('');
              }
            }}
          />
          <button
            type="button"
            className={comuni.bottoneTestoAttivo}
            disabled={!nuovoOggetto.trim()}
            onClick={() => {
              aggiungiOggetto(nuovoOggetto.trim());
              setNuovoOggetto('');
            }}
          >
            Aggiungi
          </button>
        </div>
      </div>

      <div className={styles.sezione}>
        <div className={styles.rigaDenaroTesta}>
          <span className={comuni.etichetta}>DENARO</span>
          <span style={{ fontSize: 17, color: 'var(--colore-testo)' }}>livello di vita: {suggerimento.livelloVita}</span>
          <span className="cifre" style={{ fontSize: 13, color: 'var(--colore-testo-attenuato)' }}>
            Valore di Credito {vdc}
          </span>
          <span style={{ fontSize: 14, color: 'var(--colore-testo-debole)' }}>condizione sociale: {suggerimento.condizioneSociale}</span>
        </div>
        <div className={styles.spesaCard}>
          <span className={comuni.etichetta} style={{ color: 'var(--colore-accento)' }}>
            SPESA GIORNALIERA
          </span>
          <span className="cifre" style={{ fontSize: 32, fontWeight: 600, color: 'var(--colore-testo)' }}>
            {suggerimento.spesaGiornaliera.toLocaleString('it-IT')} $
          </span>
          <p style={{ fontFamily: 'var(--font-prosa)', fontSize: 16, lineHeight: 1.5, color: 'var(--colore-testo-attenuato)', margin: 0 }}>
            Tutto quello che costa meno di così non lo segno e non lo scalo dai contanti.
          </p>
        </div>
        <div className={styles.grigliaDenaro}>
          <div className={styles.campo}>
            <span className={comuni.etichetta}>CONTANTI</span>
            <input
              className={comuni.input}
              type="number"
              value={attivo.denaro.contanti}
              onChange={(e) => aggiornaDenaro({ contanti: parseFloat(e.target.value) || 0 })}
            />
            <span className="cifre" style={{ fontSize: 12, color: 'var(--colore-testo-debole)' }}>
              suggerito {suggerimento.contanti.toLocaleString('it-IT')} $
            </span>
          </div>
          <div className={styles.campo}>
            <span className={comuni.etichetta}>BENI E PROPRIETÀ</span>
            <input
              className={comuni.input}
              type="number"
              value={attivo.denaro.proprieta}
              onChange={(e) => aggiornaDenaro({ proprieta: parseFloat(e.target.value) || 0 })}
            />
            <span className="cifre" style={{ fontSize: 12, color: 'var(--colore-testo-debole)' }}>
              suggerito {suggerimento.beniOPiu ? `almeno ${suggerimento.beni.toLocaleString('it-IT')} $` : `${suggerimento.beni.toLocaleString('it-IT')} $`}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.sezione}>
        <span className={comuni.etichetta}>COMPAGNI INVESTIGATORI</span>
        {attivo.compagni.map((c, i) => (
          <div key={i} className={styles.rigaCompagno}>
            <input
              className={comuni.input}
              style={{ flex: 1, minWidth: 160 }}
              placeholder="Personaggio"
              value={c.personaggio}
              onChange={(e) => aggiornaCompagno(i, { personaggio: e.target.value })}
            />
            <input
              className={comuni.input}
              style={{ flex: 1, minWidth: 140 }}
              placeholder="Giocatore"
              value={c.giocatore}
              onChange={(e) => aggiornaCompagno(i, { giocatore: e.target.value })}
            />
            <button type="button" className={comuni.bottoneTesto} onClick={() => rimuoviCompagno(i)}>
              Rimuovi
            </button>
          </div>
        ))}
        <button type="button" className={comuni.bottoneTestoAttivo} style={{ alignSelf: 'flex-start' }} onClick={aggiungiCompagno}>
          Aggiungi un compagno
        </button>
      </div>
    </div>
  );
}
