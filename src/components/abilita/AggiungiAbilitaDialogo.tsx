import { useState } from 'react';
import { useInvestigatoreStore } from '../../store/investigatoreStore';
import { ABILITA_MULTI_ISTANZA, ABILITA_NON_COMUNI } from '../../rules/skills1920';
import { Dialogo } from '../comuni/Dialogo';
import comuni from '../../theme/comuni.module.css';

interface Props {
  onChiudi: () => void;
}

export function AggiungiAbilitaDialogo({ onChiudi }: Props) {
  const aggiungiDaCatalogo = useInvestigatoreStore((s) => s.aggiungiAbilitaDaCatalogo);
  const aggiungiPersonalizzata = useInvestigatoreStore((s) => s.aggiungiAbilitaPersonalizzata);
  const [radice, setRadice] = useState<string>(Object.keys(ABILITA_MULTI_ISTANZA)[0] ?? '');
  const [nomePersonalizzato, setNomePersonalizzato] = useState('');
  const [basePersonalizzata, setBasePersonalizzata] = useState('1');

  const radici = Object.keys(ABILITA_MULTI_ISTANZA);
  const specializzazioni = ABILITA_MULTI_ISTANZA[radice] ?? [];

  return (
    <Dialogo titolo="Aggiungi un'abilità" onChiudi={onChiudi}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className={comuni.etichetta}>SPECIALIZZAZIONE</span>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {radici.map((r) => (
              <button key={r} type="button" className={r === radice ? comuni.bottoneTestoAttivo : comuni.bottoneTesto} onClick={() => setRadice(r)}>
                {r}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
            {specializzazioni.map((s) => (
              <button
                key={s.nome}
                type="button"
                className={comuni.bottone}
                onClick={() => {
                  aggiungiDaCatalogo(radice, s.nome);
                  onChiudi();
                }}
              >
                {s.nome} ({s.base})
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--colore-bordo)', paddingTop: 14 }}>
          <span className={comuni.etichetta}>ABILITÀ NON COMUNI</span>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {ABILITA_NON_COMUNI.map((a) => (
              <button
                key={a.nome}
                type="button"
                className={comuni.bottone}
                onClick={() => {
                  aggiungiDaCatalogo(a.nome);
                  onChiudi();
                }}
              >
                {a.nome} ({a.base})
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--colore-bordo)', paddingTop: 14 }}>
          <span className={comuni.etichetta}>ABILITÀ PERSONALIZZATA</span>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input className={comuni.input} style={{ flex: 1, minWidth: 150 }} placeholder="Nome" value={nomePersonalizzato} onChange={(e) => setNomePersonalizzato(e.target.value)} />
            <input className={comuni.input} style={{ width: 80 }} placeholder="Base" value={basePersonalizzata} onChange={(e) => setBasePersonalizzata(e.target.value)} />
            <button
              type="button"
              className={comuni.bottoneTestoAttivo}
              disabled={!nomePersonalizzato.trim()}
              onClick={() => {
                aggiungiPersonalizzata(nomePersonalizzato.trim(), Math.max(0, parseInt(basePersonalizzata, 10) || 0));
                onChiudi();
              }}
            >
              Aggiungi
            </button>
          </div>
        </div>
      </div>
    </Dialogo>
  );
}
