import { useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import type { Tema } from '../../hooks/useTema';
import { Dialogo } from '../comuni/Dialogo';
import { CreditiDialogo } from './CreditiDialogo';
import comuni from '../../theme/comuni.module.css';

interface Props {
  onChiudi: () => void;
  tema: Tema;
  setTema: (t: Tema) => void;
}

const TEMI: { valore: Tema; nome: string }[] = [
  { valore: 'sistema', nome: 'Sistema' },
  { valore: 'chiaro', nome: 'Chiaro' },
  { valore: 'scuro', nome: 'Scuro' },
];

export function ImpostazioniDialogo({ onChiudi, tema, setTema }: Props) {
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const toggleImpostazione = useInvestigatoreStore((s) => s.toggleImpostazione);
  const setUnitaDistanza = useInvestigatoreStore((s) => s.setUnitaDistanza);
  const [creditiAperti, setCreditiAperti] = useState(false);

  return (
    <Dialogo titolo="Impostazioni" onChiudi={onChiudi}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderBottom: '1px solid var(--colore-bordo)', paddingBottom: 16 }}>
          <span className={comuni.etichetta}>TEMA</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {TEMI.map((t) => (
              <button key={t.valore} type="button" className={tema === t.valore ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={() => setTema(t.valore)}>
                {t.nome}
              </button>
            ))}
          </div>
        </div>

        {attivo && (
          <>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', borderBottom: '1px solid var(--colore-bordo)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 17, color: 'var(--colore-testo)' }}>Spesa di Fortuna</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--colore-testo-debole)' }}>Regola opzionale: dopo un fallimento posso comprare il successo pagando la differenza.</span>
              </div>
              <button type="button" className={comuni.bottone} onClick={() => toggleImpostazione('spesaFortuna')}>
                {attivo.impostazioni.spesaFortuna ? 'Attiva' : 'Disattiva'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', borderBottom: '1px solid var(--colore-bordo)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 17, color: 'var(--colore-testo)' }}>Dadi fisici come default</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--colore-testo-debole)' }}>Apre il pannello di tiro già in modalità dadi fisici.</span>
              </div>
              <button type="button" className={comuni.bottone} onClick={() => toggleImpostazione('dadiFisici')}>
                {attivo.impostazioni.dadiFisici ? 'Attivi' : 'Disattivi'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className={comuni.etichetta}>UNITÀ DELLA GITTATA RAVVICINATA</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['metri', 'piedi'] as const).map((u) => (
                  <button key={u} type="button" className={attivo.impostazioni.unitaDistanza === u ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={() => setUnitaDistanza(u)}>
                    {u}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--colore-testo-debole)', maxWidth: '52ch' }}>Il calcolo resta DES diviso 5 in piedi: questo interruttore cambia solo come leggo il numero.</span>
            </div>
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <button type="button" className={comuni.bottoneTesto} onClick={() => setCreditiAperti(true)}>
            Crediti
          </button>
          <button type="button" className={comuni.bottoneTesto} onClick={onChiudi}>
            Chiudi
          </button>
        </div>
      </div>
      {creditiAperti && <CreditiDialogo onChiudi={() => setCreditiAperti(false)} />}
    </Dialogo>
  );
}
