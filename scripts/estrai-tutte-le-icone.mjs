// Estrae TUTTE le icone di @iconify-json/game-icons (oltre 4.100) in un file
// separato, caricato solo via import() dinamico dal selettore quando l'utente
// apre "cerca nel catalogo completo" (§6). Tenuto fuori dal bundle iniziale:
// vedi src/icons/CercaCatalogoCompleto.tsx. Il Service Worker lo precachea
// comunque al primo avvio, quindi la ricerca resta disponibile offline.
//
// Uso: node scripts/estrai-tutte-le-icone.mjs

import { readFileSync, writeFileSync } from 'node:fs';

const iconify = JSON.parse(readFileSync(new URL('../node_modules/@iconify-json/game-icons/icons.json', import.meta.url), 'utf8'));

function estraiPath(bodyHtml) {
  const path = [...bodyHtml.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
  return path;
}

const corpi = {};
let scartate = 0;
for (const [nome, icona] of Object.entries(iconify.icons)) {
  const percorsi = estraiPath(icona.body);
  if (percorsi.length === 0) {
    scartate++;
    continue;
  }
  corpi[nome] = {
    viewBox: `0 0 ${icona.width ?? iconify.width} ${icona.height ?? iconify.height}`,
    percorsi,
  };
}

const intestazione = `// File generato da scripts/estrai-tutte-le-icone.mjs — non modificare a mano.
// Sorgente: @iconify-json/game-icons (CC BY 3.0, game-icons.net — vedi LICENSES.md).
// Caricato SOLO via import() dinamico (src/icons/CercaCatalogoCompleto.tsx):
// non deve mai finire in un import statico, altrimenti gonfia il bundle
// iniziale dell'app.
`;

const corpo = `import type { CorpoIcona } from './corpiCurati.generated';

export const CORPI_CATALOGO_COMPLETO: Record<string, CorpoIcona> = ${JSON.stringify(corpi)};
`;

writeFileSync(new URL('../src/icons/corpiCompleti.generated.ts', import.meta.url), intestazione + '\n' + corpo);
const nomiCount = Object.keys(corpi).length;
console.log(`Estratte ${nomiCount} icone (scartate ${scartate} senza path) in src/icons/corpiCompleti.generated.ts`);
