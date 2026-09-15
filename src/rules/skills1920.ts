// Catalogo delle abilità anni '20, valori base [MB] §4.2, e le regole del
// Valore di Credito §4.3. Le etichette stanno tutte qui, in un unico posto:
// una correzione futura della dicitura ufficiale è una modifica di una riga sola.

import type { Abilita, Arma } from './types';

export const ETICHETTA_MISCHIA = 'Combattere';
export const ETICHETTA_ARMI_FUOCO = 'Armi da Fuoco';

export interface VoceCatalogo {
  nome: string;
  base: number;
  /** true per le abilità non comuni, aggiunte da un menu apposito invece che nella lista principale. */
  nonComune?: boolean;
}

/** Abilità a istanza singola, con il loro valore base [MB] §4.2. */
export const ABILITA_BASE: readonly VoceCatalogo[] = [
  { nome: 'Ammaliare', base: 15 },
  { nome: 'Antropologia', base: 1 },
  { nome: 'Archeologia', base: 1 },
  { nome: 'Ascoltare', base: 20 },
  { nome: 'Biblioteconomia', base: 20 },
  { nome: 'Camuffare', base: 5 },
  { nome: 'Cavalcare', base: 5 },
  { nome: 'Contabilità', base: 5 },
  { nome: 'Furtività', base: 20 },
  { nome: 'Guidare Auto', base: 20 },
  { nome: 'Individuare', base: 25 },
  { nome: 'Intimidire', base: 15 },
  { nome: 'Lanciare', base: 20 },
  { nome: 'Legge', base: 5 },
  { nome: 'Manovrare Macchinari Pesanti', base: 1 },
  { nome: 'Medicina', base: 1 },
  { nome: 'Miti di Cthulhu', base: 0 },
  { nome: 'Naturalistica', base: 10 },
  { nome: 'Navigare', base: 10 },
  { nome: 'Nuotare', base: 20 },
  { nome: 'Occultismo', base: 5 },
  { nome: 'Persuadere', base: 10 },
  { nome: 'Primo Soccorso', base: 30 },
  { nome: 'Psicoanalisi', base: 1 },
  { nome: 'Psicologia', base: 10 },
  { nome: 'Raggirare', base: 5 },
  { nome: 'Rapidità di Mano', base: 10 },
  { nome: 'Riparazioni Elettriche', base: 10 },
  { nome: 'Riparazioni Meccaniche', base: 10 },
  { nome: 'Saltare', base: 20 },
  { nome: 'Scalare', base: 20 },
  { nome: 'Scassinare', base: 1 },
  { nome: 'Seguire Tracce', base: 10 },
  { nome: 'Storia', base: 5 },
  { nome: 'Valore di Credito', base: 0 },
  { nome: 'Valutare', base: 1 },
];

/** Abilità che non ricevono mai la spunta esperienza [MB] §4.1. */
export const NON_SPUNTABILI: ReadonlySet<string> = new Set(['Miti di Cthulhu', 'Valore di Credito']);

/**
 * Abilità multi-istanza (§4.1): radice → elenco di specializzazioni con il
 * loro valore base. L'elenco delle specializzazioni non elencate
 * esplicitamente dal Manuale Base (Arti e Mestieri, Scienza, Lingua Altra,
 * Sopravvivenza) è indicativo: l'utente può sempre aggiungerne altre a mano.
 */
export const ABILITA_MULTI_ISTANZA: Readonly<Record<string, readonly VoceCatalogo[]>> = {
  'Arti e Mestieri': [
    { nome: 'Belle Arti', base: 5 },
    { nome: 'Falegnameria', base: 5 },
    { nome: 'Fotografia', base: 5 },
    { nome: 'Recitazione', base: 5 },
  ],
  Scienza: [
    { nome: 'Astronomia', base: 1 },
    { nome: 'Biologia', base: 1 },
    { nome: 'Botanica', base: 1 },
    { nome: 'Chimica', base: 1 },
    { nome: 'Farmacia', base: 1 },
    { nome: 'Fisica', base: 1 },
    { nome: 'Geologia', base: 1 },
    { nome: 'Matematica', base: 10 },
    { nome: 'Zoologia', base: 1 },
  ],
  Lingua: [
    { nome: 'Francese', base: 1 },
    { nome: 'Italiano', base: 1 },
    { nome: 'Latino', base: 1 },
    { nome: 'Tedesco', base: 1 },
  ],
  // Pilotare non è un'abilità non comune: sta nella lista principale, con
  // specializzazione obbligatoria (§4.2).
  Pilotare: [
    { nome: 'Aerei', base: 1 },
    { nome: 'Dirigibili', base: 1 },
    { nome: 'Imbarcazioni', base: 1 },
  ],
  Sopravvivenza: [
    { nome: 'Artico', base: 10 },
    { nome: 'Bosco', base: 10 },
    { nome: 'Deserto', base: 10 },
    { nome: 'Mare', base: 10 },
  ],
  [ETICHETTA_MISCHIA]: [
    { nome: 'Rissa', base: 25 },
    { nome: 'Ascia', base: 15 },
    { nome: 'Frusta', base: 5 },
    { nome: 'Garrota', base: 15 },
    { nome: 'Lancia', base: 20 },
    { nome: 'Mazzafrusto', base: 10 },
    { nome: 'Spada', base: 20 },
  ],
  [ETICHETTA_ARMI_FUOCO]: [
    { nome: 'Pistola', base: 20 },
    { nome: 'Fucile/Shotgun', base: 25 },
    { nome: 'Arco', base: 15 },
    { nome: 'Mitra', base: 15 },
    { nome: 'Mitragliatrice', base: 10 },
    { nome: 'Lanciafiamme', base: 10 },
    { nome: 'Armi Pesanti', base: 10 },
  ],
};

/** Abilità non comuni, aggiungibili da un menu apposito (§4.2). */
export const ABILITA_NON_COMUNI: readonly VoceCatalogo[] = [
  { nome: 'Artiglieria', base: 1, nonComune: true },
  { nome: 'Demolizioni', base: 1, nonComune: true },
  { nome: 'Ipnosi', base: 1, nonComune: true },
  { nome: 'Addestrare Animali', base: 5, nonComune: true },
  { nome: 'Lettura Labiale', base: 1, nonComune: true },
  { nome: 'Sommozzatore', base: 1, nonComune: true },
];

/** Nome visualizzato di un'abilità con specializzazione: "Arti e Mestieri (Fotografia)". */
export function nomeConSpecializzazione(radice: string, specializzazione?: string): string {
  return specializzazione ? `${radice} (${specializzazione})` : radice;
}

/** Id leggibile e stabile da un nome visualizzato: "Arti e Mestieri (Fotografia)" → "arti-e-mestieri-fotografia". */
export function slugAbilita(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function abilitaAValoreBase(radice: string, base: number, specializzazione?: string): Abilita {
  const nome = nomeConSpecializzazione(radice, specializzazione);
  return {
    id: slugAbilita(nome),
    nome,
    radice,
    specializzazione,
    base,
    valore: base,
    spunta: false,
    preferita: false,
    nonSpuntabile: NON_SPUNTABILI.has(radice),
  };
}

/**
 * Le abilità con cui parte una scheda nuova (§4.2): tutte le abilità a
 * istanza singola, più le tre specializzazioni di mischia/armi da fuoco più
 * comuni — come le caselle già stampate sul modulo cartaceo, pronte per
 * essere allenate. Le altre abilità a istanza multipla (Arti e Mestieri,
 * Scienza, Lingua, Pilotare, Sopravvivenza…) restano da aggiungere a mano
 * con una specializzazione scelta, dal pulsante "Aggiungi abilità": senza
 * una specializzazione non sono comunque allenabili.
 */
export function abilitaSchedaNuova(): Abilita[] {
  return [
    ...ABILITA_BASE.map((v) => abilitaAValoreBase(v.nome, v.base)),
    abilitaAValoreBase('Schivare', 0),
    abilitaAValoreBase(ETICHETTA_MISCHIA, 25, 'Rissa'),
    abilitaAValoreBase(ETICHETTA_ARMI_FUOCO, 20, 'Pistola'),
    abilitaAValoreBase(ETICHETTA_ARMI_FUOCO, 25, 'Fucile/Shotgun'),
  ];
}

function vociMultiIstanzaPerNome(nome: string): { radice: string; specializzazione?: string; base: number } | undefined {
  for (const [radice, voci] of Object.entries(ABILITA_MULTI_ISTANZA)) {
    const voce = voci.find((v) => nomeConSpecializzazione(radice, v.nome) === nome);
    if (voce) return { radice, specializzazione: voce.nome, base: voce.base };
  }
  return undefined;
}

/**
 * Ogni arma collegata a un'abilità deve trovare quell'abilità sulla scheda
 * (altrimenti scompare dai bottoni ABILITÀ e non si vede il valore
 * collegato): restituisce le abilità mancanti da aggiungere a valore base,
 * derivandole dal catalogo tramite `arma.abilitaCollegata`. Pura: non
 * modifica l'elenco ricevuto.
 */
export function abilitaMancantiPerArmi(abilita: readonly Abilita[], armi: readonly Arma[]): Abilita[] {
  const esistenti = new Set(abilita.map((a) => a.nome));
  const mancanti: Abilita[] = [];
  for (const arma of armi) {
    const nome = arma.abilitaCollegata;
    if (!nome || esistenti.has(nome)) continue;
    const voce = vociMultiIstanzaPerNome(nome);
    if (!voce) continue;
    esistenti.add(nome);
    mancanti.push({
      id: crypto.randomUUID(),
      nome,
      radice: voce.radice,
      specializzazione: voce.specializzazione,
      base: voce.base,
      valore: voce.base,
      spunta: false,
      preferita: false,
      nonSpuntabile: NON_SPUNTABILI.has(voce.radice),
    });
  }
  return mancanti;
}
