// Taccuino delle avventure: Avventura → Sessioni, ciascuna con note
// strutturate (titolo, data, luogo, racconto) e immagini. Le immagini sono
// salvate in IndexedDB (§ pattern ritratto/note manoscritte) e referenziate
// per chiave — non incluse nell'export JSON (docs/decisioni.md).

import { useEffect, useRef, useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import { leggiImmagineTaccuino } from '../../persistence/archivio';
import { ridimensionaImmagine } from '../../utils/immagine';
import { useDettatura } from '../../hooks/useDettatura';
import { Dialogo } from '../comuni/Dialogo';
import type { ImmagineNota } from '../../rules/types';
import comuni from '../../theme/comuni.module.css';
import styles from './VistaTaccuino.module.css';

const LATO_MASSIMO_FOTO = 900;

export function VistaTaccuino() {
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const creaAvventura = useInvestigatoreStore((s) => s.creaAvventura);
  const rinominaAvventura = useInvestigatoreStore((s) => s.rinominaAvventura);
  const eliminaAvventura = useInvestigatoreStore((s) => s.eliminaAvventura);
  const creaSessione = useInvestigatoreStore((s) => s.creaSessione);
  const aggiornaSessione = useInvestigatoreStore((s) => s.aggiornaSessione);
  const eliminaSessione = useInvestigatoreStore((s) => s.eliminaSessione);
  const aggiungiImmagineSessione = useInvestigatoreStore((s) => s.aggiungiImmagineSessione);
  const aggiornaDidascaliaImmagine = useInvestigatoreStore((s) => s.aggiornaDidascaliaImmagine);
  const rimuoviImmagineSessione = useInvestigatoreStore((s) => s.rimuoviImmagineSessione);

  const [avventuraId, setAvventuraId] = useState<string | null>(null);
  const [sessioneId, setSessioneId] = useState<string | null>(null);
  const [nuovoTitoloAvventura, setNuovoTitoloAvventura] = useState('');
  const [nuovoTitoloSessione, setNuovoTitoloSessione] = useState('');
  const [avventuraDaEliminare, setAvventuraDaEliminare] = useState<string | null>(null);
  const [sessioneDaEliminare, setSessioneDaEliminare] = useState<string | null>(null);
  const [immagineAperta, setImmagineAperta] = useState<ImmagineNota | null>(null);
  const inputFile = useRef<HTMLInputElement>(null);

  const avventure = attivo?.avventure ?? [];
  const avventuraCorrente = avventure.find((a) => a.id === avventuraId) ?? null;
  const sessioneCorrente = avventuraCorrente?.sessioni.find((s) => s.id === sessioneId) ?? null;

  const dettatura = useDettatura((testoRiconosciuto) => {
    if (!avventuraCorrente || !sessioneCorrente) return;
    const base = sessioneCorrente.testo;
    const separatore = base && !/\s$/.test(base) ? ' ' : '';
    aggiornaSessione(avventuraCorrente.id, sessioneCorrente.id, { testo: base + separatore + testoRiconosciuto });
  });

  // Cambiare sessione interrompe una dettatura in corso: altrimenti il testo
  // riconosciuto finirebbe nella sessione appena aperta, non in quella letta ad alta voce.
  const interrompiDettatura = dettatura.interrompi;
  useEffect(() => {
    interrompiDettatura();
  }, [sessioneCorrente?.id, interrompiDettatura]);

  if (!attivo) return null;

  function selezionaAvventura(id: string) {
    setAvventuraId(id === avventuraId ? null : id);
    setSessioneId(null);
    setNuovoTitoloSessione('');
  }

  function confermaNuovaAvventura() {
    const titolo = nuovoTitoloAvventura.trim();
    if (!titolo) return;
    const id = creaAvventura(titolo);
    setNuovoTitoloAvventura('');
    setAvventuraId(id);
    setSessioneId(null);
  }

  function confermaNuovaSessione(idAvventura: string) {
    const titolo = nuovoTitoloSessione.trim();
    if (!titolo) return;
    const id = creaSessione(idAvventura, titolo);
    setNuovoTitoloSessione('');
    setSessioneId(id);
  }

  async function suFileScelto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !avventuraCorrente || !sessioneCorrente) return;
    const dataUrl = await ridimensionaImmagine(file, LATO_MASSIMO_FOTO);
    await aggiungiImmagineSessione(avventuraCorrente.id, sessioneCorrente.id, dataUrl);
  }

  return (
    <div className={`${styles.layout} animato`}>
      <aside className={styles.barraLaterale}>
        <div className={styles.rigaAggiungi}>
          <input
            className={comuni.input}
            placeholder="Titolo della nuova avventura"
            value={nuovoTitoloAvventura}
            onChange={(e) => setNuovoTitoloAvventura(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confermaNuovaAvventura();
            }}
          />
          <button type="button" className={comuni.bottoneTestoAttivo} disabled={!nuovoTitoloAvventura.trim()} onClick={confermaNuovaAvventura}>
            Crea
          </button>
        </div>

        {avventure.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-prosa)', fontSize: 15, color: 'var(--colore-testo-attenuato)', margin: 0 }}>
            Nessuna avventura ancora registrata. Dai un titolo alla prima campagna qui sopra.
          </p>
        ) : (
          <div className={styles.elencoAvventure}>
            {avventure.map((a) => (
              <div key={a.id} className={a.id === avventuraId ? styles.avventuraAttiva : styles.avventura}>
                <div className={styles.testataAvventura}>
                  <button type="button" className={styles.apriAvventura} onClick={() => selezionaAvventura(a.id)}>
                    <span className={styles.titoloAvventura} style={{ color: a.id === avventuraId ? 'var(--colore-testo)' : 'var(--colore-testo-attenuato)' }}>
                      {a.titolo}
                    </span>
                    <span className={styles.contatoreSessioni}>{a.sessioni.length === 1 ? '1 sessione' : `${a.sessioni.length} sessioni`}</span>
                  </button>
                  <button type="button" className={comuni.bottoneTestoPericolo} onClick={() => setAvventuraDaEliminare(a.id)}>
                    Elimina
                  </button>
                </div>

                {a.id === avventuraId && (
                  <div className={styles.elencoSessioni}>
                    {a.sessioni.map((s) => (
                      <div key={s.id} className={s.id === sessioneId ? styles.sessioneAttiva : styles.sessione}>
                        <button type="button" className={styles.apriSessione} onClick={() => setSessioneId(s.id === sessioneId ? null : s.id)}>
                          <span className={styles.titoloSessione} style={{ color: s.id === sessioneId ? 'var(--colore-testo)' : 'var(--colore-testo-attenuato)' }}>
                            {s.titolo}
                          </span>
                          {(s.data || s.luogo) && <span className={styles.dettaglioSessione}>{[s.data, s.luogo].filter(Boolean).join(' · ')}</span>}
                        </button>
                      </div>
                    ))}
                    <div className={styles.rigaAggiungi} style={{ marginTop: 6 }}>
                      <input
                        className={comuni.input}
                        placeholder="Titolo della nuova sessione"
                        value={nuovoTitoloSessione}
                        onChange={(e) => setNuovoTitoloSessione(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confermaNuovaSessione(a.id);
                        }}
                      />
                      <button type="button" className={comuni.bottoneTestoAttivo} disabled={!nuovoTitoloSessione.trim()} onClick={() => confermaNuovaSessione(a.id)}>
                        Crea
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </aside>

      <main>
        {!avventuraCorrente && (
          <div className={styles.vuoto}>
            <div className={styles.vuotoTitolo}>Il taccuino aspetta la prima avventura.</div>
            <div className={styles.vuotoTesto}>Scegli un'avventura dalla barra laterale, o creane una nuova per iniziare a tracciare le sessioni.</div>
          </div>
        )}

        {avventuraCorrente && !sessioneCorrente && (
          <div className={styles.vuoto}>
            <div className={styles.intestazioneAvventura} style={{ marginBottom: 8 }}>
              <input value={avventuraCorrente.titolo} onChange={(e) => rinominaAvventura(avventuraCorrente.id, e.target.value)} />
            </div>
            <div className={styles.vuotoTesto}>Scegli una sessione qui a fianco, o creane una nuova per iniziare a scrivere.</div>
          </div>
        )}

        {avventuraCorrente && sessioneCorrente && (
          <div className={styles.schedaSessione}>
            <div className={styles.intestazioneAvventura}>
              <input value={avventuraCorrente.titolo} onChange={(e) => rinominaAvventura(avventuraCorrente.id, e.target.value)} />
              <button type="button" className={comuni.bottoneTestoPericolo} onClick={() => setSessioneDaEliminare(sessioneCorrente.id)}>
                Elimina sessione
              </button>
            </div>

            <div className={styles.campiSessione}>
              <div className={styles.campo}>
                <span className={comuni.etichetta}>TITOLO SESSIONE</span>
                <input
                  className={comuni.input}
                  value={sessioneCorrente.titolo}
                  onChange={(e) => aggiornaSessione(avventuraCorrente.id, sessioneCorrente.id, { titolo: e.target.value })}
                />
              </div>
              <div className={styles.campo}>
                <span className={comuni.etichetta}>DATA DI GIOCO</span>
                <input
                  className={comuni.input}
                  placeholder="es. 3 ottobre 1924"
                  value={sessioneCorrente.data}
                  onChange={(e) => aggiornaSessione(avventuraCorrente.id, sessioneCorrente.id, { data: e.target.value })}
                />
              </div>
              <div className={styles.campo}>
                <span className={comuni.etichetta}>LUOGO</span>
                <input
                  className={comuni.input}
                  value={sessioneCorrente.luogo}
                  onChange={(e) => aggiornaSessione(avventuraCorrente.id, sessioneCorrente.id, { luogo: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.barraRacconto} data-print-hide>
              <span className={comuni.etichetta}>RACCONTO</span>
              {dettatura.supportata && (
                <button
                  type="button"
                  className={dettatura.inAscolto ? comuni.bottoneTestoPericolo : comuni.bottoneTesto}
                  onClick={() => (dettatura.inAscolto ? dettatura.interrompi() : dettatura.avvia())}
                >
                  {dettatura.inAscolto ? 'Interrompi dettatura' : 'Detta'}
                </button>
              )}
            </div>
            <div className={styles.paginaAntica}>
              <textarea
                className={styles.testoRacconto}
                placeholder="Quello che è successo questa sessione."
                value={sessioneCorrente.testo}
                onChange={(e) => aggiornaSessione(avventuraCorrente.id, sessioneCorrente.id, { testo: e.target.value })}
              />
            </div>
            {dettatura.inAscolto && <p className={styles.suggerimentoDettatura}>In ascolto… il testo riconosciuto viene aggiunto in fondo al racconto.</p>}

            <div className={styles.sezioneImmagini}>
              <span className={comuni.etichetta}>IMMAGINI</span>
              <div className={styles.galleria}>
                {sessioneCorrente.immagini.map((img) => (
                  <Miniatura key={img.id} immagine={img} onApri={() => setImmagineAperta(img)} />
                ))}
                <button type="button" className={styles.aggiungiFoto} onClick={() => inputFile.current?.click()}>
                  + Aggiungi foto
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <input ref={inputFile} type="file" accept="image/*" style={{ display: 'none' }} onChange={suFileScelto} />

      {avventuraDaEliminare && (
        <Dialogo titolo="Eliminare questa avventura?" onChiudi={() => setAvventuraDaEliminare(null)}>
          <p style={{ color: 'var(--colore-testo-attenuato)' }}>Non si può annullare. Tutte le sessioni e le immagini di questa avventura andranno perse.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
            <button type="button" className={comuni.bottoneTesto} onClick={() => setAvventuraDaEliminare(null)}>
              Annulla
            </button>
            <button
              type="button"
              className={comuni.bottoneTestoPericolo}
              onClick={() => {
                void eliminaAvventura(avventuraDaEliminare);
                if (avventuraDaEliminare === avventuraId) {
                  setAvventuraId(null);
                  setSessioneId(null);
                }
                setAvventuraDaEliminare(null);
              }}
            >
              Elimina
            </button>
          </div>
        </Dialogo>
      )}

      {sessioneDaEliminare && avventuraCorrente && (
        <Dialogo titolo="Eliminare questa sessione?" onChiudi={() => setSessioneDaEliminare(null)}>
          <p style={{ color: 'var(--colore-testo-attenuato)' }}>Non si può annullare. Le note e le immagini di questa sessione andranno perse.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18 }}>
            <button type="button" className={comuni.bottoneTesto} onClick={() => setSessioneDaEliminare(null)}>
              Annulla
            </button>
            <button
              type="button"
              className={comuni.bottoneTestoPericolo}
              onClick={() => {
                void eliminaSessione(avventuraCorrente.id, sessioneDaEliminare);
                if (sessioneDaEliminare === sessioneId) setSessioneId(null);
                setSessioneDaEliminare(null);
              }}
            >
              Elimina
            </button>
          </div>
        </Dialogo>
      )}

      {immagineAperta && avventuraCorrente && sessioneCorrente && (
        <ImmagineDialogo
          immagine={immagineAperta}
          onChiudi={() => setImmagineAperta(null)}
          onDidascalia={(testo) => aggiornaDidascaliaImmagine(avventuraCorrente.id, sessioneCorrente.id, immagineAperta.id, testo)}
          onRimuovi={() => {
            void rimuoviImmagineSessione(avventuraCorrente.id, sessioneCorrente.id, immagineAperta.id);
            setImmagineAperta(null);
          }}
        />
      )}
    </div>
  );
}

function Miniatura({ immagine, onApri }: { immagine: ImmagineNota; onApri: () => void }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let annullato = false;
    void leggiImmagineTaccuino(immagine.chiave).then((dataUrl) => {
      if (!annullato) setUrl(dataUrl ?? null);
    });
    return () => {
      annullato = true;
    };
  }, [immagine.chiave]);

  return (
    <button type="button" className={styles.miniatura} onClick={onApri} aria-label={immagine.didascalia || 'Apri immagine'}>
      {url && <img src={url} alt={immagine.didascalia ?? ''} />}
      {immagine.didascalia && <span className={styles.didascaliaMiniatura}>{immagine.didascalia}</span>}
    </button>
  );
}

interface ImmagineDialogoProps {
  immagine: ImmagineNota;
  onChiudi: () => void;
  onDidascalia: (testo: string) => void;
  onRimuovi: () => void;
}

function ImmagineDialogo({ immagine, onChiudi, onDidascalia, onRimuovi }: ImmagineDialogoProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [didascalia, setDidascalia] = useState(immagine.didascalia ?? '');

  useEffect(() => {
    let annullato = false;
    void leggiImmagineTaccuino(immagine.chiave).then((dataUrl) => {
      if (!annullato) setUrl(dataUrl ?? null);
    });
    return () => {
      annullato = true;
    };
  }, [immagine.chiave]);

  return (
    <Dialogo titolo="Immagine" onChiudi={onChiudi}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {url && <img src={url} alt={didascalia} className={styles.anteprimaGrande} />}
        <input
          className={comuni.input}
          placeholder="Didascalia (facoltativa)"
          value={didascalia}
          onChange={(e) => setDidascalia(e.target.value)}
          onBlur={() => onDidascalia(didascalia)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18 }}>
          <button type="button" className={comuni.bottoneTestoPericolo} onClick={onRimuovi}>
            Rimuovi immagine
          </button>
          <button type="button" className={comuni.bottoneTesto} onClick={onChiudi}>
            Chiudi
          </button>
        </div>
      </div>
    </Dialogo>
  );
}
