import { useInvestigatoreStore } from '../../store/investigatoreStore';
import type { Investigatore } from '../../rules/types';
import { Dialogo } from '../comuni/Dialogo';
import comuni from '../../theme/comuni.module.css';

const CONDIZIONI: { chiave: keyof Investigatore['condizioni']; nome: string }[] = [
  { chiave: 'feritaGrave', nome: 'Ferita Grave' },
  { chiave: 'privoDiSensi', nome: 'Privo di sensi' },
  { chiave: 'morente', nome: 'Morente' },
  { chiave: 'morto', nome: 'Morto' },
  { chiave: 'folliaTemporanea', nome: 'Follia Temporanea' },
  { chiave: 'folliaIndefinita', nome: 'Follia Indefinita' },
  { chiave: 'folliaPermanente', nome: 'Follia Permanente' },
];

interface Props {
  onChiudi: () => void;
}

export function StatiDialogo({ onChiudi }: Props) {
  const attivo = useInvestigatoreStore((s) => s.attivo);
  const toggleCondizione = useInvestigatoreStore((s) => s.toggleCondizione);
  if (!attivo) return null;

  return (
    <Dialogo titolo="Stati" onChiudi={onChiudi}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {CONDIZIONI.map((c) => {
          const attiva = attivo.condizioni[c.chiave];
          return (
            <button
              key={c.chiave}
              type="button"
              className={comuni.badge}
              style={{ cursor: 'pointer', color: attiva ? 'var(--colore-pericolo-testo)' : 'var(--colore-testo-attenuato)' }}
              onClick={() => toggleCondizione(c.chiave)}
            >
              {c.nome}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className={comuni.bottoneTesto} onClick={onChiudi}>
          Chiudi
        </button>
      </div>
    </Dialogo>
  );
}
