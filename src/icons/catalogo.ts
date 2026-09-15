// Catalogo curato delle icone armi (§2 "Icone delle armi in stile inciso").
// I nomi in `nomeGameIcons` sono verificati contro le chiavi reali del
// pacchetto @iconify-json/game-icons da scripts/estrai-icone-curate.mjs, che
// fallisce se una chiave non esiste più: non vanno mai scritti a mano senza
// ripassare lo script.

export type Categoria = 'fuoco' | 'mischia' | 'lancio' | 'altro';

export interface VoceCatalogo {
  id: string;
  etichetta: string;
  sorgente: 'manuale' | 'game-icons';
  /** Valorizzato solo se sorgente = 'game-icons'; è la chiave reale nel pacchetto. */
  nomeGameIcons?: string;
  categoria: Categoria;
  parole: string[];
}

// ── Livello 2 — protagoniste disegnate a mano (src/icons/protagoniste/) ────
const PROTAGONISTE: VoceCatalogo[] = [
  { id: 'revolver', etichetta: 'Revolver', sorgente: 'manuale', categoria: 'fuoco', parole: ['revolver', 'rivoltella', 'pistola a tamburo', '.38', '.45', 'tamburo'] },
  { id: 'pistola-semiautomatica', etichetta: 'Pistola semiautomatica', sorgente: 'manuale', categoria: 'fuoco', parole: ['pistola', 'semiautomatica', 'automatica', 'm1911', 'luger', 'browning'] },
  { id: 'fucile-a-pompa', etichetta: 'Fucile a pompa', sorgente: 'manuale', categoria: 'fuoco', parole: ['fucile a pompa', 'shotgun', 'pompa', 'doppietta', 'fucile'] },
  { id: 'fucile-canna-rigata', etichetta: 'Fucile a canna rigata', sorgente: 'manuale', categoria: 'fuoco', parole: ['carabina', 'rifle', 'winchester', 'canna rigata'] },
  { id: 'mitra', etichetta: 'Mitra', sorgente: 'manuale', categoria: 'fuoco', parole: ['mitra', 'tommy gun', 'thompson', 'mitragliatore', 'sottomitra'] },
  { id: 'coltello', etichetta: 'Coltello', sorgente: 'manuale', categoria: 'mischia', parole: ['coltello', 'pugnale', 'serramanico', 'knife', 'dagger'] },
  { id: 'randello', etichetta: 'Randello', sorgente: 'manuale', categoria: 'mischia', parole: ['randello', 'mazza', 'club', 'manganello'] },
  { id: 'tirapugni', etichetta: 'Tirapugni', sorgente: 'manuale', categoria: 'mischia', parole: ['tirapugni', 'nocche', 'knuckle', 'brass knuckles'] },
  { id: 'pugno-chiuso', etichetta: 'Senza armi', sorgente: 'manuale', categoria: 'mischia', parole: ['senza armi', 'pugno', 'rissa', 'mani nude', 'fist'] },
  { id: 'bastone-da-passeggio', etichetta: 'Bastone da passeggio', sorgente: 'manuale', categoria: 'mischia', parole: ['bastone', 'passeggio', 'cane', 'canna'] },
  { id: 'ascia', etichetta: 'Ascia', sorgente: 'manuale', categoria: 'mischia', parole: ['ascia', 'accetta', 'axe', 'hatchet'] },
  { id: 'molotov', etichetta: 'Bottiglia molotov', sorgente: 'manuale', categoria: 'lancio', parole: ['molotov', 'bottiglia incendiaria', 'cocktail molotov'] },
];

// ── Livello 1 — trattamento automatico su sagome game-icons.net ───────────
const GAME_ICONS: VoceCatalogo[] = [
  { id: 'fucile-canne-mozze', etichetta: 'Fucile a canne mozze', sorgente: 'game-icons', nomeGameIcons: 'sawed-off-shotgun', categoria: 'fuoco', parole: ['canne mozze', 'lupara', 'sawed-off', 'fucile'] },
  { id: 'mitragliatrice', etichetta: 'Mitragliatrice', sorgente: 'game-icons', nomeGameIcons: 'machine-gun', categoria: 'fuoco', parole: ['mitragliatrice', 'machine gun', 'browning m1919'] },
  { id: 'lanciafiamme', etichetta: 'Lanciafiamme', sorgente: 'game-icons', nomeGameIcons: 'flamethrower', categoria: 'fuoco', parole: ['lanciafiamme', 'flamethrower'] },
  { id: 'munizioni', etichetta: 'Munizioni', sorgente: 'game-icons', nomeGameIcons: 'bullets', categoria: 'fuoco', parole: ['munizioni', 'proiettili', 'cartucce', 'pallottole'] },
  { id: 'caricatore', etichetta: 'Caricatore', sorgente: 'game-icons', nomeGameIcons: 'machine-gun-magazine', categoria: 'fuoco', parole: ['caricatore', 'magazine'] },
  { id: 'spada', etichetta: 'Spada', sorgente: 'game-icons', nomeGameIcons: 'broadsword', categoria: 'mischia', parole: ['spada', 'sciabola', 'sword', 'saber'] },
  { id: 'pugnale', etichetta: 'Pugnale', sorgente: 'game-icons', nomeGameIcons: 'plain-dagger', categoria: 'mischia', parole: ['pugnale', 'stiletto', 'dagger'] },
  { id: 'catena', etichetta: 'Catena', sorgente: 'game-icons', nomeGameIcons: 'wavy-chains', categoria: 'mischia', parole: ['catena', 'chain'] },
  { id: 'frusta', etichetta: 'Frusta', sorgente: 'game-icons', nomeGameIcons: 'whip', categoria: 'mischia', parole: ['frusta', 'whip', 'lash'] },
  // Nota: nessuna icona game-icons rappresenta davvero una garrota; questa è
  // l'approssimazione migliore trovata (un filo attorcigliato) — da confermare.
  { id: 'garrota', etichetta: 'Garrota', sorgente: 'game-icons', nomeGameIcons: 'wire-coil', categoria: 'mischia', parole: ['garrota', 'garrote', 'filo', 'cavo'] },
  { id: 'piede-di-porco', etichetta: 'Piede di porco', sorgente: 'game-icons', nomeGameIcons: 'crowbar', categoria: 'mischia', parole: ['piede di porco', 'crowbar', 'leva'] },
  { id: 'torcia-elettrica', etichetta: 'Torcia elettrica', sorgente: 'game-icons', nomeGameIcons: 'flashlight', categoria: 'mischia', parole: ['torcia', 'torcia elettrica', 'flashlight'] },
  { id: 'dinamite', etichetta: 'Dinamite', sorgente: 'game-icons', nomeGameIcons: 'dynamite', categoria: 'lancio', parole: ['dinamite', 'candelotto', 'tnt'] },
  { id: 'granata', etichetta: 'Granata', sorgente: 'game-icons', nomeGameIcons: 'grenade', categoria: 'lancio', parole: ['granata', 'bomba a mano', 'grenade'] },
  { id: 'pietra', etichetta: 'Pietra', sorgente: 'game-icons', nomeGameIcons: 'rock', categoria: 'lancio', parole: ['pietra', 'sasso', 'rock'] },
  { id: 'lancia', etichetta: 'Lancia', sorgente: 'game-icons', nomeGameIcons: 'spears', categoria: 'lancio', parole: ['lancia', 'spear', 'giavellotto'] },
  { id: 'corda', etichetta: 'Corda', sorgente: 'game-icons', nomeGameIcons: 'rope-coil', categoria: 'altro', parole: ['corda', 'fune', 'rope'] },
  { id: 'libro', etichetta: 'Libro', sorgente: 'game-icons', nomeGameIcons: 'open-book', categoria: 'altro', parole: ['libro', 'tomo', 'grimorio', 'book'] },
  { id: 'lanterna', etichetta: 'Lanterna', sorgente: 'game-icons', nomeGameIcons: 'lantern', categoria: 'altro', parole: ['lanterna', 'lume', 'lantern'] },
  { id: 'macchina-fotografica', etichetta: 'Macchina fotografica', sorgente: 'game-icons', nomeGameIcons: 'photo-camera', categoria: 'altro', parole: ['macchina fotografica', 'fotocamera', 'camera'] },
  { id: 'binocolo', etichetta: 'Binocolo', sorgente: 'game-icons', nomeGameIcons: 'binoculars', categoria: 'altro', parole: ['binocolo', 'binoculars'] },
  { id: 'chiavi', etichetta: 'Chiavi', sorgente: 'game-icons', nomeGameIcons: 'key', categoria: 'altro', parole: ['chiavi', 'chiave', 'key'] },
  { id: 'siringa', etichetta: 'Siringa', sorgente: 'game-icons', nomeGameIcons: 'syringe', categoria: 'altro', parole: ['siringa', 'iniezione', 'syringe'] },
  { id: 'boccetta', etichetta: 'Boccetta', sorgente: 'game-icons', nomeGameIcons: 'vial', categoria: 'altro', parole: ['boccetta', 'fiala', 'vial'] },
  { id: 'crocifisso', etichetta: 'Crocifisso', sorgente: 'game-icons', nomeGameIcons: 'crucifix', categoria: 'altro', parole: ['crocifisso', 'croce', 'crucifix'] },
  // Nota: 'pentagram-rose' è l'unico candidato reale per un sigillo generico
  // nel pacchetto; è esplicitamente un pentagramma, non un sigillo neutro.
  { id: 'sigillo', etichetta: 'Sigillo', sorgente: 'game-icons', nomeGameIcons: 'pentagram-rose', categoria: 'altro', parole: ['sigillo', 'simbolo', 'pentagramma'] },
];

// ── Ripiego — nessuna icona "punto interrogativo" esiste in game-icons.net;
// è un disegno originale minimo (vedi src/icons/protagoniste/ripiego.ts). ──
const RIPIEGO: VoceCatalogo = { id: 'ripiego', etichetta: 'Sconosciuto', sorgente: 'manuale', categoria: 'altro', parole: [] };

export const CATALOGO_ICONE: readonly VoceCatalogo[] = [...PROTAGONISTE, ...GAME_ICONS, RIPIEGO];

export function trovaVoce(id: string): VoceCatalogo | undefined {
  return CATALOGO_ICONE.find((v) => v.id === id);
}
