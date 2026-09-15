// Script di sola esplorazione (non fa parte della build): elenca le chiavi
// reali del pacchetto @iconify-json/game-icons filtrate per parola chiave,
// per costruire il catalogo curato su nomi verificati, non indovinati.

import { readFileSync } from 'node:fs';

const dati = JSON.parse(readFileSync(new URL('../node_modules/@iconify-json/game-icons/icons.json', import.meta.url)));
const chiavi = Object.keys(dati.icons);

const GRUPPI = {
  'fuoco/revolver': ['revolver'],
  'fuoco/pistola': ['pistol', 'gun', 'derringer', 'luger', 'colt'],
  'fuoco/fucile-mozze': ['sawed-off', 'sawn-off', 'blunderbuss'],
  'fuoco/fucile-pompa': ['shotgun', 'pump'],
  'fuoco/fucile-canna-rigata': ['rifle', 'carbine', 'sniper'],
  'fuoco/mitra': ['submachine', 'tommy', 'smg', 'uzi'],
  'fuoco/mitragliatrice': ['machine-gun', 'machine-gun-magazine', 'minigun', 'gatling'],
  'fuoco/lanciafiamme': ['flamethrower', 'flame-thrower'],
  'fuoco/munizioni': ['bullet', 'ammo', 'cartridge', 'shell-casing'],
  'fuoco/caricatore': ['magazine', 'clip'],
  'mischia/coltello': ['knife', 'dagger', 'stiletto', 'bowie'],
  'mischia/spada': ['sword', 'saber', 'sabre', 'cutlass', 'blade'],
  'mischia/ascia': ['axe', 'hatchet', 'tomahawk'],
  'mischia/randello-mazza': ['club', 'mace', 'bat', 'cudgel', 'baton', 'nightstick', 'blackjack'],
  'mischia/catena': ['chain', 'flail', 'nunchaku'],
  'mischia/frusta': ['whip', 'lash'],
  'mischia/garrota': ['garrote', 'garrotte', 'wire', 'noose'],
  'mischia/tirapugni': ['brass-knuckle', 'knuckle-duster', 'punch'],
  'mischia/pugno': ['fist', 'punch'],
  'mischia/bastone': ['walking-stick', 'cane'],
  'mischia/piede-di-porco': ['crowbar', 'pry-bar'],
  'mischia/torcia': ['flashlight', 'torch'],
  'lancio/molotov': ['molotov', 'petrol-bomb', 'cocktail'],
  'lancio/dinamite': ['dynamite', 'tnt'],
  'lancio/granata': ['grenade', 'bomb'],
  'lancio/pietra': ['thrown-rock', 'stone-throw', 'rock'],
  'lancio/lancia': ['spear', 'javelin', 'lance', 'pike', 'trident'],
  'altro/corda': ['rope', 'coil'],
  'altro/libro': ['book', 'grimoire', 'tome', 'spell-book'],
  'altro/lanterna': ['lantern', 'oil-lamp'],
  'altro/macchina-fotografica': ['camera', 'photo-camera'],
  'altro/binocolo': ['binoculars', 'spyglass', 'telescope'],
  'altro/chiavi': ['key', 'keys', 'key-ring'],
  'altro/siringa': ['syringe', 'injection'],
  'altro/boccetta': ['potion', 'vial', 'bottle', 'flask'],
  'altro/crocifisso': ['cross', 'crucifix', 'holy-symbol'],
  'altro/sigillo': ['seal', 'stamp', 'wax-seal', 'pentagram', 'magic-symbol'],
  'altro/ripiego': ['question-mark', 'help'],
};

for (const [gruppo, parole] of Object.entries(GRUPPI)) {
  const trovate = chiavi.filter((k) => parole.some((p) => k.includes(p)));
  console.log(`\n## ${gruppo}  (parole: ${parole.join(', ')})`);
  if (trovate.length === 0) console.log('  (nessuna corrispondenza)');
  for (const k of trovate.slice(0, 25)) console.log('  - ' + k);
  if (trovate.length > 25) console.log(`  ... e altre ${trovate.length - 25}`);
}

console.log(`\n\nTotale chiavi nel pacchetto: ${chiavi.length}`);
