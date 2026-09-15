// Estrae, dal pacchetto @iconify-json/game-icons, solo i path SVG delle
// icone del catalogo curato (src/icons/catalogo.ts) e li scrive in un file
// generato — così l'app non include mai il pacchetto intero (6+ MB) a runtime
// per il set curato. Fallisce se un nome del catalogo non esiste più nel
// pacchetto: è la verifica richiesta dal punto 4.2 della specifica.
//
// Uso: node scripts/estrai-icone-curate.mjs
// Va rilanciato manualmente se il catalogo cambia (non fa parte della build,
// il file generato è committato).

import { readFileSync, writeFileSync } from 'node:fs';

const iconify = JSON.parse(readFileSync(new URL('../node_modules/@iconify-json/game-icons/icons.json', import.meta.url), 'utf8'));

// Duplica solo i campi che servono da catalogo.ts, per non introdurre un
// import circolare TS↔JS in uno script eseguito con Node puro.
const src = readFileSync(new URL('../src/icons/catalogo.ts', import.meta.url), 'utf8');
const nomiUsati = [...src.matchAll(/nomeGameIcons:\s*'([^']+)'/g)].map((m) => m[1]);

if (nomiUsati.length === 0) {
  console.error('Nessun nomeGameIcons trovato in src/icons/catalogo.ts — controlla il percorso.');
  process.exit(1);
}

const mancanti = nomiUsati.filter((n) => !(n in iconify.icons));
if (mancanti.length > 0) {
  console.error('Questi nomi non esistono in @iconify-json/game-icons:');
  for (const n of mancanti) console.error('  - ' + n);
  process.exit(1);
}

function estraiPath(bodyHtml) {
  // Il campo "body" è markup SVG interno (uno o più <path ... d="...">).
  // Ci servono solo i valori di d, per poterli ridisegnare come contorno e
  // come maschera del tratteggio, oltre che come riempimento pieno.
  const path = [...bodyHtml.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
  if (path.length === 0) throw new Error('Nessun attributo d trovato nel body: ' + bodyHtml.slice(0, 80));
  return path;
}

const corpi = {};
for (const nome of nomiUsati) {
  const icona = iconify.icons[nome];
  corpi[nome] = {
    viewBox: `0 0 ${icona.width ?? iconify.width} ${icona.height ?? iconify.height}`,
    percorsi: estraiPath(icona.body),
  };
}

const intestazione = `// File generato da scripts/estrai-icone-curate.mjs — non modificare a mano.
// Sorgente: @iconify-json/game-icons (CC BY 3.0, game-icons.net — vedi LICENSES.md).
`;

const corpo = `export interface CorpoIcona {
  viewBox: string;
  percorsi: string[];
}

export const CORPI_GAME_ICONS: Record<string, CorpoIcona> = ${JSON.stringify(corpi, null, 2)};
`;

writeFileSync(new URL('../src/icons/corpiCurati.generated.ts', import.meta.url), intestazione + '\n' + corpo);
console.log(`Estratte ${nomiUsati.length} icone in src/icons/corpiCurati.generated.ts`);
