// Catalogo delle abilità anni '20, valori base [MB] §4.2, e le regole del
// Valore di Credito §4.3. Le etichette stanno tutte qui, in un unico posto:
// una correzione futura della dicitura ufficiale è una modifica di una riga sola.

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
