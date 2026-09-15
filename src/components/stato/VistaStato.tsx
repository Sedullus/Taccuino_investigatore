import { useEffect, useRef, useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import { meta, quinto, calcolaDerivati } from '../../rules/derived';
import type { Caratteristica, ChiaveOverrideNumerico, Investigatore } from '../../rules/types';
import { leggiRitratto } from '../../persistence/archivio';
import { ridimensionaImmagine } from '../../utils/immagine';
import { Tracker } from '../comuni/Tracker';
import comuni from '../../theme/comuni.module.css';
import styles from './VistaStato.module.css';

const NOMI_CONDIZIONI: Record<keyof Investigatore['condizioni'], string> = {
  feritaGrave: 'Ferita Grave',
  privoDiSensi: 'Privo di sensi',
  morente: 'Morente',
  morto: 'Morto',
  folliaTemporanea: 'Follia Temporanea',
  folliaIndefinita: 'Follia Indefinita',
  folliaPermanente: 'Follia Permanente',
};

const DERIVATI_NUMERICI: { chiave: ChiaveOverrideNumerico; etichetta: string }[] = [
  { chiave: 'struttura', etichetta: 'STR' },
  { chiave: 'mov', etichetta: 'MOV' },
  { chiave: 'pfMax', etichetta: 'PF MAX' },
  { chiave: 'pmMax', etichetta: 'PM MAX' },
  { chiave: 'sanMax', etichetta: 'SAN MAX' },
];

interface Props {
  onApriDanno: () => void;
  onApriSanita: () => void;
}

export function VistaStato({ onApriDanno, onApriSanita }: Props) {
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const modalita = useInvestigatoreStore((s) => s.modalita);
  const aggiornaCaratteristica = useInvestigatoreStore((s) => s.aggiornaCaratteristica);
  const aggiornaOverride = useInvestigatoreStore((s) => s.aggiornaOverride);
  const aggiornaOverrideBD = useInvestigatoreStore((s) => s.aggiornaOverrideBD);
  const deltaRisorsa = useInvestigatoreStore((s) => s.deltaRisorsa);
  const apriTiro = useInvestigatoreStore((s) => s.apriTiro);
  const nuovaGiornata = useInvestigatoreStore((s) => s.nuovaGiornata);
  const salvaRitrattoInvestigatore = useInvestigatoreStore((s) => s.salvaRitrattoInvestigatore);

  const [ritrattoUrl, setRitrattoUrl] = useState<string | null>(null);
  const inputFile = useRef<HTMLInputElement>(null);
  const chiaveRitratto = attivo?.anagrafica.ritratto;

  useEffect(() => {
    let annullato = false;
    if (!chiaveRitratto) {
      setRitrattoUrl(null);
      return;
    }
    void leggiRitratto(chiaveRitratto).then((url) => {
      if (!annullato) setRitrattoUrl(url ?? null);
    });
    return () => {
      annullato = true;
    };
  }, [chiaveRitratto]);

  if (!attivo) return null;

  async function suFileScelto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const dataUrl = await ridimensionaImmagine(file);
    await salvaRitrattoInvestigatore(dataUrl);
  }
  const gioco = modalita === 'gioco';
  const miti = attivo.abilita.find((a) => a.radice === 'Miti di Cthulhu')?.valore ?? 0;
  const derivati = calcolaDerivati(attivo.caratteristiche, attivo.anagrafica.eta, miti);
  const bdMostrato = attivo.override.bd ?? derivati.bd;
  const bdSovrascritto = attivo.override.bd != null;

  const persiOggi = Math.max(0, attivo.risorse.sanInizioGiornata - attivo.risorse.san);
  const soglia = Math.floor(attivo.risorse.sanInizioGiornata / 5);
  const condizioniAttive = (Object.keys(NOMI_CONDIZIONI) as (keyof Investigatore['condizioni'])[]).filter((c) => attivo.condizioni[c]);

  return (
    <div className={styles.blocco}>
      <div className={styles.intestazione}>
        <button
          type="button"
          className={styles.ritratto}
          onClick={() => inputFile.current?.click()}
          aria-label="Cambia ritratto"
          style={ritrattoUrl ? { backgroundImage: `url(${ritrattoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : undefined}
        >
          {attivo.anagrafica.nome.slice(0, 1)}
        </button>
        <input ref={inputFile} type="file" accept="image/*" style={{ display: 'none' }} onChange={suFileScelto} />
        <div className={styles.datiAnagrafici}>
          <span className={styles.nome}>{attivo.anagrafica.nome}</span>
          <span className={styles.sottotitolo}>
            {[attivo.anagrafica.professione, attivo.anagrafica.eta ? `${attivo.anagrafica.eta} anni` : ''].filter(Boolean).join(' · ')}
          </span>
        </div>
      </div>

      <div className={comuni.card} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 16 }}>
        <Tracker etichetta="PF" valore={attivo.risorse.pf} massimo={derivati.pfMax} onMeno={() => deltaRisorsa('pf', -1, derivati.pfMax)} onPiu={() => deltaRisorsa('pf', 1, derivati.pfMax)} />
        <Tracker etichetta="SAN" valore={attivo.risorse.san} massimo={derivati.sanMax} onMeno={() => deltaRisorsa('san', -1, derivati.sanMax)} onPiu={() => deltaRisorsa('san', 1, derivati.sanMax)} />
        <Tracker etichetta="FORTUNA" valore={attivo.risorse.fortuna} onMeno={() => deltaRisorsa('fortuna', -1, 99)} onPiu={() => deltaRisorsa('fortuna', 1, 99)} onValore={() => apriTiro({ tipo: 'fortuna', nome: 'Tiro Fortuna', valore: attivo.risorse.fortuna })} />
        <Tracker etichetta="PM" valore={attivo.risorse.pm} massimo={derivati.pmMax} onMeno={() => deltaRisorsa('pm', -1, derivati.pmMax)} onPiu={() => deltaRisorsa('pm', 1, derivati.pmMax)} />
      </div>

      <div className={styles.azioniRisorse}>
        <button type="button" className={comuni.bottoneTestoPericolo} onClick={onApriDanno}>
          Applica danno
        </button>
        <button type="button" className={comuni.bottoneTestoSuccesso} onClick={onApriSanita}>
          Tiro Sanità
        </button>
      </div>

      <div className={styles.folliaTracker}>
        <div className={styles.rigaFollia}>
          <span>perse oggi {persiOggi}</span>
          <span style={{ color: 'var(--colore-pericolo-testo)' }}>soglia {soglia}</span>
          <button type="button" className={comuni.bottoneTesto} onClick={nuovaGiornata}>
            Nuova giornata
          </button>
        </div>
      </div>

      {condizioniAttive.length > 0 && (
        <div className={styles.condizioni}>
          {condizioniAttive.map((c) => (
            <span key={c} className={comuni.badge} style={{ color: 'var(--colore-pericolo-testo)' }}>
              {NOMI_CONDIZIONI[c]}
            </span>
          ))}
        </div>
      )}

      <div className={styles.griglia}>
        {(Object.keys(attivo.caratteristiche) as Caratteristica[]).map((c) => {
          const v = attivo.caratteristiche[c];
          return (
            <div key={c} className={styles.cella}>
              <span className={comuni.etichetta}>{c}</span>
              {gioco ? (
                <span className={`${styles.valoreCarat} cifre`} role="button" tabIndex={0} onClick={() => apriTiro({ tipo: 'caratteristica', nome: c, valore: v })}>
                  {v}
                </span>
              ) : (
                <input
                  className={comuni.input}
                  type="number"
                  value={v}
                  onChange={(e) => aggiornaCaratteristica(c, Math.max(0, Math.min(99, parseInt(e.target.value, 10) || 0)))}
                />
              )}
              <span className={`${comuni.etichetta} cifre`}>
                {meta(v)} · {quinto(v)}
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.derivatiRiga}>
        <div className={styles.derivatoVoce}>
          <span className={`${comuni.etichetta} cifre`}>BD</span>
          {gioco ? (
            <span className="cifre">{bdMostrato === '0' ? '—' : bdMostrato}</span>
          ) : (
            <input
              className={bdSovrascritto ? comuni.inputSovrascritto : comuni.input}
              style={{ width: 72 }}
              value={attivo.override.bd ?? ''}
              placeholder={derivati.bd}
              onChange={(e) => aggiornaOverrideBD(e.target.value === '' ? undefined : e.target.value)}
            />
          )}
        </div>
        {DERIVATI_NUMERICI.map(({ chiave, etichetta }) => {
          const calcolato = derivati[chiave];
          const sovrascritto = attivo.override[chiave] != null;
          const valoreMostrato = attivo.override[chiave] ?? calcolato;
          return (
            <div key={chiave} className={styles.derivatoVoce}>
              <span className={`${comuni.etichetta} cifre`}>{etichetta}</span>
              {gioco ? (
                <span className="cifre">{valoreMostrato}</span>
              ) : (
                <input
                  className={sovrascritto ? comuni.inputSovrascritto : comuni.input}
                  style={{ width: 72 }}
                  value={attivo.override[chiave] ?? ''}
                  placeholder={String(calcolato)}
                  onChange={(e) => aggiornaOverride(chiave, e.target.value === '' ? undefined : Number(e.target.value))}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
