// Disegna le 12 icone protagoniste (Livello 2, §2) come composizioni di
// primitive geometriche semplici su una griglia 64×64 — rappresentazioni
// schematiche di oggetti, non scene d'azione. Sono originali: non derivano
// da nessun pacchetto di terze parti.
//
// Uso: node scripts/disegna-protagoniste.mjs
// Scrive src/icons/corpiProtagoniste.generated.ts (committato).

import { writeFileSync } from 'node:fs';

// ── Primitive: ognuna ritorna una stringa "d" di un singolo path ──────────

function rect(x, y, w, h, r = 0) {
  if (!r) return `M${x},${y} H${x + w} V${y + h} H${x} Z`;
  return `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
}

function circle(cx, cy, r) {
  return `M${cx - r},${cy} A${r},${r} 0 1 0 ${cx + r},${cy} A${r},${r} 0 1 0 ${cx - r},${cy} Z`;
}

function poly(points) {
  const [prima, ...resto] = points;
  return `M${prima[0]},${prima[1]} ` + resto.map((p) => `L${p[0]},${p[1]}`).join(' ') + ' Z';
}

/** Segmento con spessore, per manici/lame lineari (un rettangolo ruotato). */
function segmento(x1, y1, x2, y2, spessore) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (spessore / 2);
  const ny = (dx / len) * (spessore / 2);
  return poly([
    [x1 + nx, y1 + ny],
    [x2 + nx, y2 + ny],
    [x2 - nx, y2 - ny],
    [x1 - nx, y1 - ny],
  ]);
}

// ── Le 12 protagoniste ─────────────────────────────────────────────────────
// Vista di profilo, semplice e leggibile a 24px. viewBox 0 0 64 64.

const ICONE = {
  revolver: {
    percorsi: [
      rect(10, 30, 8, 16, 2), // impugnatura
      poly([
        [10, 30],
        [40, 30],
        [40, 24],
        [14, 24],
      ]), // telaio/carcassa
      circle(35, 27, 8), // tamburo
      rect(43, 24, 16, 6, 1), // canna
      poly([
        [14, 30],
        [10, 38],
        [16, 36],
        [17, 30],
      ]), // ponticello del grilletto
    ],
    accento: [circle(35, 27, 3)],
  },

  'pistola-semiautomatica': {
    percorsi: [
      rect(14, 32, 9, 15, 1.5), // impugnatura verticale
      rect(12, 20, 34, 9, 2), // carrello
      rect(44, 22, 12, 5, 1), // canna/vivo di volata
      poly([
        [21, 32],
        [16, 39],
        [23, 37],
        [23, 29],
      ]), // ponticello
      rect(13, 44, 10, 3, 1), // base del caricatore
    ],
    accento: [rect(12, 20, 34, 2)],
  },

  'fucile-a-pompa': {
    percorsi: [
      poly([
        [6, 40],
        [18, 40],
        [18, 26],
        [10, 24],
        [6, 30],
      ]), // calcio
      rect(18, 28, 38, 6, 1), // canna/ricevitore
      rect(24, 34, 16, 5, 2), // fusto a pompa
      circle(58, 31, 1.6), // mirino
    ],
    accento: [rect(24, 34, 16, 2)],
  },

  'fucile-canna-rigata': {
    percorsi: [
      poly([
        [6, 40],
        [20, 39],
        [20, 27],
        [11, 25],
        [6, 32],
      ]), // calcio
      rect(20, 28, 36, 5, 1), // canna
      rect(30, 33, 5, 4, 1), // otturatore
      circle(31, 25, 2), // manetta dell'otturatore
      circle(57, 30, 1.4), // mirino
    ],
    accento: [rect(20, 28, 36, 1.5)],
  },

  mitra: {
    percorsi: [
      rect(10, 30, 16, 8, 2), // corpo/ricevitore
      rect(26, 32, 22, 5, 1), // canna corta
      poly([
        [16, 38],
        [22, 50],
        [26, 50],
        [22, 38],
      ]), // caricatore curvo
      poly([
        [10, 32],
        [4, 32],
        [4, 42],
        [10, 40],
      ]), // calcio ripiegato
      rect(18, 30, 6, 6, 1), // impugnatura a pistola
    ],
    accento: [rect(26, 32, 22, 2)],
  },

  coltello: {
    percorsi: [
      poly([
        [30, 8],
        [36, 8],
        [38, 30],
        [32, 34],
        [26, 30],
      ]), // lama
      rect(28, 34, 8, 4, 1), // guardia
      rect(29, 38, 6, 18, 2), // manico
    ],
    accento: [poly([[32, 10], [34, 10], [35, 28], [32, 30]])],
  },

  randello: {
    percorsi: [
      poly([
        [26, 6],
        [38, 6],
        [40, 30],
        [24, 30],
      ]), // testa larga
      rect(28, 30, 8, 24, 3), // impugnatura
      circle(32, 56, 4), // pomo
    ],
    accento: [rect(26, 10, 12, 4)],
  },

  tirapugni: {
    percorsi: [
      rect(10, 26, 44, 6, 3), // barra superiore
      circle(16, 40, 7), // anello 1
      circle(30, 40, 7), // anello 2
      circle(44, 40, 7), // anello 3
      rect(12, 30, 40, 4), // seconda barra di rinforzo
    ],
    accento: [rect(10, 26, 44, 2)],
  },

  'pugno-chiuso': {
    percorsi: [
      rect(16, 26, 10, 10, 3), // nocca 1
      rect(26, 22, 10, 14, 3), // nocca 2 (centrale, più alta)
      rect(36, 26, 10, 10, 3), // nocca 3
      rect(18, 34, 26, 16, 4), // corpo del pugno
      poly([
        [18, 40],
        [10, 44],
        [12, 50],
        [18, 48],
      ]), // pollice
    ],
    accento: [rect(26, 22, 10, 3)],
  },

  'bastone-da-passeggio': {
    percorsi: [
      segmento(26, 12, 42, 54, 3), // asta
      poly([
        [26, 12],
        [18, 8],
        [16, 14],
        [20, 20],
        [26, 18],
      ]), // manico a uncino
      circle(42, 56, 2.5), // puntale
    ],
    accento: [segmento(28, 14, 24, 22, 1.5)],
  },

  ascia: {
    percorsi: [
      segmento(30, 10, 38, 54, 4), // manico
      poly([
        [30, 8],
        [14, 14],
        [14, 26],
        [30, 24],
        [34, 16],
      ]), // testa dell'ascia
    ],
    accento: [poly([[24, 14], [18, 17], [18, 22], [24, 20]])],
  },

  molotov: {
    percorsi: [
      poly([
        [26, 40],
        [26, 24],
        [30, 18],
        [30, 10],
        [34, 10],
        [34, 18],
        [38, 24],
        [38, 40],
      ]), // bottiglia (collo + corpo)
      rect(24, 40, 16, 16, 3), // base della bottiglia
      segmento(32, 10, 36, 2, 2), // strofinaccio/miccia
    ],
    accento: [poly([[35, 4], [38, 0], [39, 5], [36, 8]])], // fiamma
  },
};

const corpi = {};
for (const [id, def] of Object.entries(ICONE)) {
  corpi[id] = { viewBox: '0 0 64 64', percorsi: def.percorsi, accento: def.accento ?? [] };
}

const intestazione = `// File generato da scripts/disegna-protagoniste.mjs — non modificare a mano.
// Icone originali (Livello 2, §2): rappresentazioni schematiche di oggetti,
// non riproducono materiale di terze parti.
`;

const corpo = `import type { CorpoIcona } from './corpiCurati.generated';

export interface CorpoProtagonista extends CorpoIcona {
  accento: string[];
}

export const CORPI_PROTAGONISTE: Record<string, CorpoProtagonista> = ${JSON.stringify(corpi, null, 2)};
`;

writeFileSync(new URL('../src/icons/corpiProtagoniste.generated.ts', import.meta.url), intestazione + '\n' + corpo);
console.log(`Disegnate ${Object.keys(ICONE).length} icone protagoniste in src/icons/corpiProtagoniste.generated.ts`);
