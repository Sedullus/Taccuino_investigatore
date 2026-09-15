# Licenze di terze parti

Questo file elenca il materiale di terze parti incluso nell'app e le relative licenze. Il codice del progetto è di [Edgar](mailto:edgar.giambartolomei@gmail.com); questo file riguarda solo le risorse non scritte da zero per questo progetto.

## Icone armi — game-icons.net

Gran parte delle icone armi ed equipaggiamento (Livello 1 del trattamento a incisione, vedi `docs/decisioni.md`) sono basate su sagome pubblicate da [game-icons.net](https://game-icons.net), un progetto collettivo di icone di gioco open source.

**Autori principali delle sagome usate:** Lorc, Delapouite, e altri collaboratori di game-icons.net (l'attribuzione esatta per singola icona è consultabile sul sito, filtrando per autore).

**Licenza:** [Creative Commons Attribution 3.0 Unported (CC BY 3.0)](https://creativecommons.org/licenses/by/3.0/).

Riassunto (non sostituisce il testo legale completo, disponibile a <https://creativecommons.org/licenses/by/3.0/legalcode>):

- Sei libero di condividere (copiare, distribuire) e adattare (modificare, trasformare) il materiale, anche per uso commerciale.
- La condizione è l'attribuzione: bisogna indicare la fonte, il link alla licenza, ed eventuali modifiche.

**Modifiche apportate in questo progetto:** le sagome originali (contorno pieno, monocromatiche) sono state ridisegnate come cinque strati sovrapposti — sfondo a lastra, riempimento colorato, tratteggio diagonale ritagliato nella sagoma, contorno a tratto, e un bordo aggiuntivo — con una tavolozza colori propria di quest'app (`--icona-*` in `src/theme/tokens.css`). Le sagome dei percorsi SVG restano quelle originali, estratte dal pacchetto npm `@iconify-json/game-icons` (che redistribuisce game-icons.net in formato Iconify) tramite `scripts/estrai-icone-curate.mjs` e `scripts/estrai-tutte-le-icone.mjs`.

L'attribuzione è ripetuta nella schermata **Crediti**, raggiungibile dalle Impostazioni dell'app.

## Icone armi originali

Le dodici icone "protagoniste" (§2 di `docs/decisioni.md`: revolver, pistola semiautomatica, fucile a pompa, fucile a canna rigata, mitra, coltello, randello, tirapugni, pugno chiuso, bastone da passeggio, ascia, bottiglia molotov) sono disegni originali di questo progetto (`scripts/disegna-protagoniste.mjs`), non derivano da game-icons.net né da altre fonti terze.

## Font

Il prototipo di design (`docs/design/`) usa Archivo Narrow, IBM Plex Mono e Source Serif 4 da Google Fonts. L'app pubblicata usa gli stessi tre font, ma **autoospitati**: i file (formato woff2/woff) sono inclusi nel bundle tramite i pacchetti npm `@fontsource/archivo-narrow`, `@fontsource/ibm-plex-mono` e `@fontsource/source-serif-4` (vedi `src/theme/fonts.css`), non caricati da Google Fonts a runtime — nessuna chiamata di rete esterna, coerente con il vincolo "nessuna chiamata di rete a runtime, a parte il caricamento dell'app". I file dei font sono precacheati dal service worker (`vite.config.ts`), quindi restano disponibili anche offline dopo il primo caricamento.

**Licenza:** [SIL Open Font License 1.1](https://openfontlicense.org/) per tutti e tre i font (Archivo Narrow e Source Serif 4 di Google Fonts; IBM Plex Mono di IBM). Nessuna modifica ai font stessi in questo progetto.
