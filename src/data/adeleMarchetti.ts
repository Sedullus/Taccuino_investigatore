// Personaggio di esempio "Adele Marchetti", dal brief di Claude Design
// (docs/design/prompt-claude-design.md). I valori derivati sono ricalcolati
// con le funzioni di src/rules/derived.ts, non ricopiati a mano: coincidono
// con quelli del brief (verificato), a riprova che le formule sono corrette.

import { schivareBase } from '../rules/derived';
import { ABILITA_BASE, ETICHETTA_ARMI_FUOCO, ETICHETTA_MISCHIA, NON_SPUNTABILI, nomeConSpecializzazione, slugAbilita } from '../rules/skills1920';
import type { Abilita, Arma, Investigatore } from '../rules/types';
import { VERSIONE_SCHEMA_CORRENTE } from '../persistence/schema';

function abilita(radice: string, base: number, valore: number, specializzazione?: string): Abilita {
  const nome = nomeConSpecializzazione(radice, specializzazione);
  return {
    id: slugAbilita(nome),
    nome,
    radice,
    specializzazione,
    base,
    valore,
    spunta: nome === 'Individuare',
    preferita: nome === 'Individuare' || nome === 'Ascoltare' || nome === nomeConSpecializzazione(ETICHETTA_ARMI_FUOCO, 'Pistola'),
    nonSpuntabile: NON_SPUNTABILI.has(radice),
  };
}

const DES = 65;

function creaAbilita(): Abilita[] {
  const allenate: Record<string, number> = {
    'Biblioteconomia': 60,
    'Persuadere': 60,
    'Individuare': 55,
    'Psicologia': 50,
    'Storia': 40,
    'Furtività': 40,
    'Ascoltare': 40,
    'Valore di Credito': 30,
  };
  const base = ABILITA_BASE.map((v) => abilita(v.nome, v.base, allenate[v.nome] ?? v.base));
  return [
    ...base,
    abilita('Lingua Madre', 80, 80, 'Inglese'),
    abilita('Arti e Mestieri', 5, 45, 'Fotografia'),
    abilita('Lingua', 1, 31, 'Italiano'),
    abilita(ETICHETTA_MISCHIA, 25, 25, 'Rissa'),
    abilita(ETICHETTA_ARMI_FUOCO, 20, 35, 'Pistola'),
    abilita('Schivare', schivareBase(DES), 42),
  ];
}

function creaArmi(): Arma[] {
  return [
    {
      id: 'revolver-38',
      nome: 'Revolver .38',
      abilitaCollegata: nomeConSpecializzazione(ETICHETTA_ARMI_FUOCO, 'Pistola'),
      danno: '1D10',
      tipo: 'trafigge',
      bdMode: 'nessuno',
      gittataBase: '15 m',
      attacchiPerRound: 3,
      caricatore: 6,
      munizioni: 4,
      malfunzionamento: 100,
      inceppata: false,
      icona: { id: 'revolver', sorgente: 'manuale', bloccata: false },
    },
    {
      id: 'senza-armi',
      nome: 'Senza armi',
      abilitaCollegata: nomeConSpecializzazione(ETICHETTA_MISCHIA, 'Rissa'),
      danno: '1D3',
      tipo: 'contundente',
      bdMode: 'completo',
      gittataBase: 'contatto',
      attacchiPerRound: 1,
      caricatore: 0,
      munizioni: 0,
      malfunzionamento: 101,
      inceppata: false,
      icona: { id: 'pugno-chiuso', sorgente: 'manuale', bloccata: false },
    },
  ];
}

export function creaAdeleMarchetti(id: string): Investigatore {
  return {
    id,
    versioneSchema: VERSIONE_SCHEMA_CORRENTE,
    anagrafica: {
      nome: 'Adele Marchetti',
      giocatore: 'Giulia',
      professione: 'Giornalista',
      eta: 31,
      sesso: 'F',
      residenza: 'Arkham, Massachusetts',
      luogoNascita: 'Boston, Massachusetts',
    },
    caratteristiche: { FOR: 50, COS: 60, POT: 60, DES, FAS: 70, TAG: 55, INT: 75, IST: 80 },
    override: {},
    risorse: { pf: 8, pm: 12, san: 54, sanInizioGiornata: 60, fortuna: 48 },
    condizioni: {
      feritaGrave: false,
      privoDiSensi: false,
      morente: false,
      morto: false,
      folliaTemporanea: false,
      folliaIndefinita: false,
      folliaPermanente: false,
    },
    abilita: creaAbilita(),
    armi: creaArmi(),
    trascorsi: {
      descrizionePersonale: 'Capelli scuri raccolti in fretta, cappotto grigio con le tasche sfondate dai rullini.',
      ideologiaCredo: 'Ogni fatto si può documentare.',
      personeImportanti: 'Il fratello Tommaso, tipografo al porto.',
      luoghiImportanti: 'La redazione del giornale, di notte.',
      oggettiDiValore: 'La macchina fotografica regalata dal padre.',
      tratti: 'Testarda, prende appunti su tutto.',
      feriteECicatrici: '',
      fobieEManie: '',
      tomiArcani: '',
      incontriConEntitaStrane: '',
    },
    equipaggiamento: ['Taccuino', 'Matite', 'Macchina fotografica', 'Torcia elettrica', '12 colpi di scorta'],
    denaro: { livelloSpesa: 10, contanti: 60, proprieta: 1500 },
    compagni: [{ personaggio: 'Dr. Elias Crane', giocatore: 'Marco' }],
    note: '',
    registro: [],
    impostazioni: { spesaFortuna: true, dadiFisici: false, unitaDistanza: 'metri' },
  };
}
