// Modello dati del motore di regole, come da specifica §13.
// Nessuna dipendenza da React o dal DOM: questo file (e il resto di src/rules/)
// deve poter essere importato ed eseguito in Node puro o in un web worker.

export type Caratteristica = 'FOR' | 'COS' | 'POT' | 'DES' | 'FAS' | 'TAG' | 'INT' | 'IST';

export const CARATTERISTICHE: readonly Caratteristica[] = ['FOR', 'COS', 'POT', 'DES', 'FAS', 'TAG', 'INT', 'IST'];

export type Difficolta = 'normale' | 'arduo' | 'estremo';

// Dal peggiore al migliore — serve ai tiri contrastati (§5.4) e a impedire
// che un Disastro possa "vincere" su un successo vero e proprio.
export type Livello = 'DISASTRO' | 'FALLIMENTO' | 'NORMALE' | 'ARDUO' | 'ESTREMO' | 'CRITICO';
export const ORDINE_LIVELLI: readonly Livello[] = ['DISASTRO', 'FALLIMENTO', 'NORMALE', 'ARDUO', 'ESTREMO', 'CRITICO'];

export type TipoTiro = 'caratteristica' | 'abilita' | 'attacco' | 'danno' | 'sanita' | 'fortuna';

export interface Abilita {
  id: string;
  /** Nome visualizzato, già comprensivo di specializzazione: "Arti e Mestieri (Fotografia)". */
  nome: string;
  /** Nome dell'abilità macro per il raggruppamento multi-istanza: "Arti e Mestieri". */
  radice: string;
  specializzazione?: string;
  base: number;
  valore: number;
  spunta: boolean;
  preferita: boolean;
  /** true per Miti di Cthulhu e Valore di Credito [MB]. */
  nonSpuntabile: boolean;
}

export type TipoDanno = 'contundente' | 'trafigge';
export type ModalitaBD = 'completo' | 'metà' | 'nessuno';

export interface Arma {
  id: string;
  nome: string;
  /** Riferimento al nome di un'abilità della scheda. */
  abilitaCollegata: string;
  /** Espressione di dado, es. "1D10", "1D3+BD". */
  danno: string;
  tipo: TipoDanno;
  bdMode: ModalitaBD;
  gittataBase: string;
  attacchiPerRound: number;
  /** 0 per armi da mischia o "Senza armi": niente tracciamento munizioni. */
  caricatore: number;
  munizioni: number;
  /** Tiro pari o superiore a questo valore = inceppata. */
  malfunzionamento: number;
  inceppata: boolean;
}

export interface Condizioni {
  feritaGrave: boolean;
  privoDiSensi: boolean;
  morente: boolean;
  morto: boolean;
  folliaTemporanea: boolean;
  folliaIndefinita: boolean;
  folliaPermanente: boolean;
}

/** Chiavi dei valori derivati sovrascrivibili con un valore numerico (§3). */
export type ChiaveOverrideNumerico = 'pfMax' | 'pmMax' | 'sanMax' | 'mov' | 'struttura' | 'schivare';

export interface OverrideDerivati {
  pfMax?: number;
  pmMax?: number;
  sanMax?: number;
  mov?: number;
  struttura?: number;
  schivare?: number;
  /** Il BD è un'espressione di dado (es. "1D4"), non un numero puro. */
  bd?: string;
}

export interface VoceRegistro {
  id: string;
  ora: string;
  tipo: string;
  dettaglio: string;
  /** Rappresentazione libera dei valori prima/dopo, per la UI del registro. */
  prima?: Record<string, number | string | boolean>;
  dopo?: Record<string, number | string | boolean>;
}

export interface Anagrafica {
  nome: string;
  giocatore: string;
  professione: string;
  eta: number;
  sesso: string;
  residenza: string;
  luogoNascita: string;
  /** Chiave dell'immagine ritratto salvata in IndexedDB, se presente. */
  ritratto?: string;
}

export interface Risorse {
  pf: number;
  pm: number;
  san: number;
  sanInizioGiornata: number;
  fortuna: number;
}

export interface Compagno {
  personaggio: string;
  giocatore: string;
}

export interface Trascorsi {
  descrizionePersonale: string;
  ideologiaCredo: string;
  personeImportanti: string;
  luoghiImportanti: string;
  oggettiDiValore: string;
  tratti: string;
  feriteECicatrici: string;
  fobieEManie: string;
  tomiArcani: string;
  incontriConEntitaStrane: string;
}

export interface Denaro {
  livelloSpesa: number;
  contanti: number;
  proprieta: number;
}

export interface Impostazioni {
  spesaFortuna: boolean;
  dadiFisici: boolean;
  unitaDistanza: 'metri' | 'piedi';
}

export interface Investigatore {
  id: string;
  versioneSchema: number;
  anagrafica: Anagrafica;
  caratteristiche: Record<Caratteristica, number>;
  override: OverrideDerivati;
  risorse: Risorse;
  condizioni: Condizioni;
  abilita: Abilita[];
  armi: Arma[];
  trascorsi: Trascorsi;
  equipaggiamento: string[];
  denaro: Denaro;
  compagni: Compagno[];
  note: string;
  registro: VoceRegistro[];
  impostazioni: Impostazioni;
}
