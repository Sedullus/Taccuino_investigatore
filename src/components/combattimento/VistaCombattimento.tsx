import { useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import { bonusDannoEStruttura } from '../../rules/derived';
import { desPerIniziativa, esitoManovra, gittataRavvicinataPiedi, piediInMetriApprossimati } from '../../rules/combat';
import type { ModalitaBD, TipoDanno } from '../../rules/types';
import { ABILITA_MULTI_ISTANZA, ETICHETTA_ARMI_FUOCO, ETICHETTA_MISCHIA, nomeConSpecializzazione } from '../../rules/skills1920';
import { ArmaIcona } from '../../icons/ArmaIcona';
import { IconaSelezionatore } from '../../icons/IconaSelezionatore';
import { iconaEffettivaArma } from '../../icons/suggerimento';
import comuni from '../../theme/comuni.module.css';
import styles from './VistaCombattimento.module.css';

const TIPI_DANNO: { valore: TipoDanno; nome: string }[] = [
  { valore: 'contundente', nome: 'Contundente' },
  { valore: 'trafigge', nome: 'Trafigge' },
];

const MODALITA_BD: { valore: ModalitaBD; nome: string }[] = [
  { valore: 'completo', nome: 'Completo' },
  { valore: 'metà', nome: 'Metà' },
  { valore: 'nessuno', nome: 'Nessuno' },
];

export function VistaCombattimento() {
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const modalita = useInvestigatoreStore((s) => s.modalita);
  const combattimento = useInvestigatoreStore((s) => s.combattimento);
  const toggleArmaPronta = useInvestigatoreStore((s) => s.toggleArmaPronta);
  const toggleRavvicinata = useInvestigatoreStore((s) => s.toggleRavvicinata);
  const impostaColpiScelti = useInvestigatoreStore((s) => s.impostaColpiScelti);
  const impostaStrAvversario = useInvestigatoreStore((s) => s.impostaStrAvversario);
  const selezionaArma = useInvestigatoreStore((s) => s.selezionaArma);
  const apriAttaccoArma = useInvestigatoreStore((s) => s.apriAttaccoArma);
  const tiraDannoArma = useInvestigatoreStore((s) => s.tiraDannoArma);
  const tiraDannoEstremoArma = useInvestigatoreStore((s) => s.tiraDannoEstremoArma);
  const ricaricaArma = useInvestigatoreStore((s) => s.ricaricaArma);
  const aggiungiArma = useInvestigatoreStore((s) => s.aggiungiArma);
  const aggiungiAbilitaDaCatalogo = useInvestigatoreStore((s) => s.aggiungiAbilitaDaCatalogo);
  const rimuoviArma = useInvestigatoreStore((s) => s.rimuoviArma);
  const rinominaArma = useInvestigatoreStore((s) => s.rinominaArma);
  const impostaIconaArma = useInvestigatoreStore((s) => s.impostaIconaArma);
  const ripristinaSuggerimentoIconaArma = useInvestigatoreStore((s) => s.ripristinaSuggerimentoIconaArma);

  const [nuovo, setNuovo] = useState({ nome: '', danno: '1D6', gittataBase: 'contatto', caricatore: '0', malfunzionamento: '100', abilitaCollegata: '', tipo: 'contundente' as TipoDanno, bdMode: 'completo' as ModalitaBD });
  const [selettoreArmaId, setSelettoreArmaId] = useState<string | null>(null);

  if (!attivo) return null;
  const gioco = modalita === 'gioco';

  const iniziativa = desPerIniziativa(attivo.caratteristiche.DES, combattimento.armaPronta);
  const piedi = gittataRavvicinataPiedi(attivo.caratteristiche.DES);
  const distanzaTesto = attivo.impostazioni.unitaDistanza === 'piedi' ? `${piedi.toFixed(1)} ft` : `circa ${piediInMetriApprossimati(piedi).toFixed(1)} m`;
  const strAvv = parseInt(combattimento.strAvversario || '0', 10) || 0;
  const { struttura } = bonusDannoEStruttura(attivo.caratteristiche.FOR, attivo.caratteristiche.TAG);
  const strutturaPropria = attivo.override.struttura ?? struttura;
  const manovra = esitoManovra(strutturaPropria, strAvv);

  // L'elenco viene dall'intero catalogo (§4.2), non solo dalle abilità già
  // allenate: scegliendo una specializzazione non ancora sulla scheda, viene
  // aggiunta in automatico (a valore base) quando si registra l'arma.
  const opzioniAbilitaArma = [
    ...ABILITA_MULTI_ISTANZA[ETICHETTA_MISCHIA]!.map((v) => ({ radice: ETICHETTA_MISCHIA, specializzazione: v.nome })),
    ...ABILITA_MULTI_ISTANZA[ETICHETTA_ARMI_FUOCO]!.map((v) => ({ radice: ETICHETTA_ARMI_FUOCO, specializzazione: v.nome })),
  ].map((o) => ({ ...o, nome: nomeConSpecializzazione(o.radice, o.specializzazione) }));

  return (
    <div className={`${styles.blocco} animato`}>
      <div className={styles.rigaTop}>
        <span className="cifre">
          INIZIATIVA DES <span style={{ fontSize: 20, color: 'var(--colore-testo)' }}>{iniziativa}</span>
        </span>
        <button type="button" className={combattimento.armaPronta ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={toggleArmaPronta}>
          Arma da fuoco pronta
        </button>
      </div>

      <div className={styles.rigaTop}>
        <button type="button" className={combattimento.ravvicinata ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={toggleRavvicinata}>
          Gittata ravvicinata
        </button>
        <span className="cifre" style={{ color: 'var(--colore-accento)' }}>
          {distanzaTesto}
        </span>
        <span style={{ fontSize: 14, color: 'var(--colore-testo-attenuato)' }}>dà un dado bonus</span>
      </div>

      <div className={styles.rigaTop}>
        <span className={comuni.etichetta}>COLPI PER ROUND</span>
        {[1, 2, 3].map((n) => (
          <button key={n} type="button" className={`cifre ${combattimento.colpiScelti === n ? comuni.bottoneTestoAttivo : comuni.bottoneTesto}`} onClick={() => impostaColpiScelti(n)}>
            {n}
          </button>
        ))}
        {combattimento.colpiScelti >= 2 && <span style={{ fontSize: 14, color: 'var(--colore-testo-attenuato)' }}>ogni colpo prende un dado penalità</span>}
      </div>

      <p style={{ fontFamily: 'var(--font-prosa)', fontSize: 16, lineHeight: 1.55, color: 'var(--colore-testo-attenuato)', maxWidth: '64ch' }}>
        Fino alla gittata base il tiro è Normale, fino al doppio è Arduo, fino al quadruplo è Estremo. La difficoltà si sceglie nel pannello di tiro.
      </p>

      {attivo.armi.map((arma) => {
        const iconaEffettiva = iconaEffettivaArma(arma.nome, arma.abilitaCollegata, arma.icona);
        return (
        <div key={arma.id} className={styles.armaCard}>
          <div className={styles.armaTesta}>
            {gioco ? (
              <ArmaIcona icona={iconaEffettiva} dimensione={32} />
            ) : (
              <button type="button" onClick={() => setSelettoreArmaId(arma.id)} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }} aria-label={`Cambia icona per ${arma.nome}`}>
                <ArmaIcona icona={iconaEffettiva} dimensione={32} decorativa />
              </button>
            )}
            {gioco ? (
              <span style={{ fontSize: 21, color: 'var(--colore-testo)' }}>{arma.nome}</span>
            ) : (
              <input className={comuni.input} style={{ width: 180, fontSize: 17 }} value={arma.nome} onChange={(e) => rinominaArma(arma.id, e.target.value)} />
            )}
            <span className="cifre" style={{ fontSize: 13, color: 'var(--colore-testo-attenuato)' }}>
              {arma.danno} · {arma.tipo} · {arma.gittataBase} · {arma.attacchiPerRound} attacchi
            </span>
            {arma.inceppata && (
              <span className={comuni.badge} style={{ color: 'var(--colore-pericolo-testo)' }}>
                Inceppata
              </span>
            )}
            {combattimento.armaAttivaId === arma.id ? (
              <span className={comuni.badge} style={{ color: 'var(--colore-accento)' }}>
                In pugno
              </span>
            ) : (
              <button type="button" className={comuni.bottoneTesto} onClick={() => selezionaArma(arma.id)}>
                Impugna
              </button>
            )}
            {arma.id !== 'senza-armi' && (
              <button type="button" className={comuni.bottoneTestoPericolo} onClick={() => rimuoviArma(arma.id)}>
                Rimuovi
              </button>
            )}
          </div>

          {arma.caricatore > 0 && (
            <div className={styles.rigaTop}>
              <span className={comuni.etichetta}>COLPI</span>
              <div style={{ display: 'flex', gap: 5 }}>
                {Array.from({ length: arma.caricatore }).map((_, i) => (
                  <span key={i} className={styles.pallinoMunizione} style={{ background: i < arma.munizioni ? 'var(--colore-accento)' : 'transparent' }} />
                ))}
              </div>
              <button type="button" className={comuni.bottoneTesto} onClick={() => ricaricaArma(arma.id)}>
                Ricarica
              </button>
            </div>
          )}

          <div className={styles.rigaTop}>
            <button type="button" className={comuni.bottoneTestoAttivo} onClick={() => apriAttaccoArma(arma.id)}>
              Attacca
            </button>
            <button type="button" className={comuni.bottoneTesto} onClick={() => tiraDannoArma(arma.id)}>
              Tira danno
            </button>
            <button type="button" className={comuni.bottoneTestoPericolo} onClick={() => tiraDannoEstremoArma(arma.id)}>
              Danno estremo
            </button>
          </div>
          {combattimento.ultimiDanni[arma.id] && (
            <div className="cifre" style={{ fontSize: 14, color: 'var(--colore-accento)' }}>
              {combattimento.ultimiDanni[arma.id]}
            </div>
          )}
        </div>
        );
      })}

      <div className={styles.nuovaArmaCard}>
        <span style={{ fontFamily: 'var(--font-prosa)', fontSize: 19, color: 'var(--colore-testo)' }}>Metto a verbale una nuova arma</span>
        <div className={styles.grigliaCampi}>
          <input className={comuni.input} placeholder="Nome" value={nuovo.nome} onChange={(e) => setNuovo({ ...nuovo, nome: e.target.value })} />
          <input className={comuni.input} placeholder="Danno — es. 1D8" value={nuovo.danno} onChange={(e) => setNuovo({ ...nuovo, danno: e.target.value })} />
          <input className={comuni.input} placeholder="Gittata" value={nuovo.gittataBase} onChange={(e) => setNuovo({ ...nuovo, gittataBase: e.target.value })} />
          <input className={comuni.input} placeholder="Caricatore (0 se mischia)" value={nuovo.caricatore} onChange={(e) => setNuovo({ ...nuovo, caricatore: e.target.value })} />
          <input className={comuni.input} placeholder="Malfunzionamento" value={nuovo.malfunzionamento} onChange={(e) => setNuovo({ ...nuovo, malfunzionamento: e.target.value })} />
        </div>
        <div className={styles.rigaTop}>
          <span className={comuni.etichetta}>ABILITÀ</span>
          {opzioniAbilitaArma.map((o) => (
            <button key={o.nome} type="button" className={nuovo.abilitaCollegata === o.nome ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={() => setNuovo({ ...nuovo, abilitaCollegata: o.nome })}>
              {o.specializzazione}
            </button>
          ))}
          {nuovo.abilitaCollegata && !attivo.abilita.some((a) => a.nome === nuovo.abilitaCollegata) && (
            <span style={{ fontSize: 13, color: 'var(--colore-testo-debole)' }}>({nuovo.abilitaCollegata} non ancora sulla scheda: verrà aggiunta a valore base)</span>
          )}
        </div>
        <div className={styles.rigaTop}>
          <span className={comuni.etichetta}>TIPO</span>
          {TIPI_DANNO.map((t) => (
            <button key={t.valore} type="button" className={nuovo.tipo === t.valore ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={() => setNuovo({ ...nuovo, tipo: t.valore })}>
              {t.nome}
            </button>
          ))}
          <span className={comuni.etichetta} style={{ marginLeft: 12 }}>
            BD
          </span>
          {MODALITA_BD.map((m) => (
            <button key={m.valore} type="button" className={nuovo.bdMode === m.valore ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={() => setNuovo({ ...nuovo, bdMode: m.valore })}>
              {m.nome}
            </button>
          ))}
          <button
            type="button"
            className={comuni.bottoneTestoAttivo}
            style={{ marginLeft: 'auto' }}
            disabled={!nuovo.nome.trim() || !nuovo.abilitaCollegata}
            onClick={() => {
              const scelta = opzioniAbilitaArma.find((o) => o.nome === nuovo.abilitaCollegata);
              if (scelta && !attivo.abilita.some((a) => a.nome === scelta.nome)) {
                aggiungiAbilitaDaCatalogo(scelta.radice, scelta.specializzazione);
              }
              aggiungiArma({
                nome: nuovo.nome.trim(),
                danno: nuovo.danno.trim() || '1D6',
                gittataBase: nuovo.gittataBase.trim() || 'contatto',
                caricatore: Math.max(0, parseInt(nuovo.caricatore, 10) || 0),
                malfunzionamento: Math.max(0, parseInt(nuovo.malfunzionamento, 10) || 100),
                abilitaCollegata: nuovo.abilitaCollegata,
                tipo: nuovo.tipo,
                bdMode: nuovo.bdMode,
                attacchiPerRound: 1,
              });
              setNuovo({ nome: '', danno: '1D6', gittataBase: 'contatto', caricatore: '0', malfunzionamento: '100', abilitaCollegata: '', tipo: 'contundente', bdMode: 'completo' });
            }}
          >
            Aggiungi
          </button>
        </div>
      </div>

      <div className={styles.ricordi}>
        <span style={{ fontFamily: 'var(--font-prosa)', fontSize: 18, color: 'var(--colore-testo)' }}>Da ricordare, quando si viene alle mani</span>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--colore-testo-attenuato)' }}>Chi contrattacca deve fare meglio dell'attaccante. Chi schiva basta che pareggi.</p>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--colore-testo-attenuato)' }}>
          Se ho già contrattaccato o schivato in questo round, gli altri che mi attaccano prendono un dado bonus. Non vale per le armi da fuoco.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--colore-testo-attenuato)' }}>Se il bersaglio supera un tiro Schivare per cercare copertura, chi attacca prende un dado penalità.</p>
        <div className={styles.rigaTop}>
          <span style={{ fontSize: 15, color: 'var(--colore-testo-attenuato)' }}>Manovra contro Struttura</span>
          <input className={comuni.input} style={{ width: 70 }} value={combattimento.strAvversario} onChange={(e) => impostaStrAvversario(e.target.value)} />
          <span className="cifre" style={{ color: 'var(--colore-accento)' }}>
            {manovra.inefficace ? 'manovra inefficace' : manovra.dadiPenalita > 0 ? `${manovra.dadiPenalita} dado penalità` : 'nessuna penalità'}
          </span>
        </div>
      </div>

      {selettoreArmaId && (
        <IconaSelezionatore
          onChiudi={() => setSelettoreArmaId(null)}
          onScegli={(icona) => {
            impostaIconaArma(selettoreArmaId, icona.id, icona.sorgente, icona.corpo);
            setSelettoreArmaId(null);
          }}
          onNessuna={() => {
            impostaIconaArma(selettoreArmaId, 'ripiego', 'manuale');
            setSelettoreArmaId(null);
          }}
          onRipristinaSuggerimento={() => {
            ripristinaSuggerimentoIconaArma(selettoreArmaId);
            setSelettoreArmaId(null);
          }}
        />
      )}
    </div>
  );
}
