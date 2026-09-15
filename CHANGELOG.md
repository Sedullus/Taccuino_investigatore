# Changelog

Tutte le modifiche rilevanti del progetto, organizzate per fase di sviluppo.

## Fase 1 — Fondamenta (MVP giocabile)

### Aggiunto
- Scaffold Vite + React + TypeScript (`strict`), Vitest, oxlint.
- Motore di regole puro in `src/rules/` (`dice`, `checks`, `derived`, `health`, `combat`, `development`, `sanity`, `skills1920`, `types`), senza dipendenze da React o dal DOM.
- 62 test automatici, inclusi tutti i 43 casi obbligatori del §14 della specifica.
- Persistenza su IndexedDB (`idb-keyval`) con schema validato da `zod`, `versioneSchema` e meccanismo di migrazione.
- Export/import JSON con test di round-trip.
- Store Zustand con pila di annullamento (20 passi), voci di registro per ogni azione.
- Personaggio di esempio "Adele Marchetti" precaricato al primo avvio.
- Vista **Stato**: anagrafica, tracker PF/SAN/Fortuna/PM, condizioni, caratteristiche tirabili con Metà/Quinto, valori derivati (BD, Struttura, MOV, PF/PM/SAN massimi) con indicatore di override.
- Vista **Abilità**: ricerca, filtro "solo allenate", preferite, spunta esperienza, aggiunta di abilità dal catalogo o personalizzate.
- **Pannello di tiro**: difficoltà, dadi bonus/penalità, dadi virtuali e fisici, esito con livello ottenuto, tiro forzato (con divieti e promemoria), spesa di Fortuna (con divieti e costo).
- Dialoghi **Applica danno** (con concatenamento al tiro COS) e **Tiro Sanità** (con concatenamento al tiro INT, Follia Temporanea/Indefinita/Permanente).
- Dialogo **Stati**, attivabili/disattivabili a mano.
- Dialogo **Impostazioni**: spesa di Fortuna, dadi fisici di default, unità della gittata ravvicinata.
- Gestione investigatori: crea scheda vuota, duplica, elimina (con conferma), importa/esporta JSON, con messaggio d'errore per file non leggibili.
- Modalità Gioco / Modifica separate.
- Tema scuro di default e tema chiaro, entrambi con contrasto AA, navigazione da tastiera, `prefers-reduced-motion` rispettato.
- Layout responsivo: barra di navigazione in basso su telefono, due colonne da tablet in su.

### Corretto durante il collaudo manuale
- CSS: una regola con specificità più alta nascondeva la colonna delle abilità su tablet/desktop (bug di layout, non di regole).
- `init()` dello store non era protetto da chiamate concorrenti: in sviluppo (React StrictMode) poteva creare due copie del personaggio di esempio al primo avvio.
- Il tiro Sanità calcolava la soglia di Follia Indefinita solo per mostrarla, senza attivare davvero la condizione.

### Note
- Fase 3 (Trascorsi, Equipaggiamento, Denaro, Compagni, Note e indizi, ritratto, temi/impostazioni aggiuntive, vista di stampa) non ancora iniziata.

## Fase 3 — Rifinitura

### Aggiunto
- Vista **Trascorsi**: i dieci campi narrativi (Descrizione Personale, Ideologia/Credo, Persone Importanti, Luoghi Importanti, Oggetti di Valore, Tratti, Ferite e Cicatrici, Fobie e Manie, Tomi Arcani/Incantesimi/Manufatti, Incontri con Entità Strane), Equipaggiamento (lista libera), Denaro (contanti e proprietà modificabili, con suggerimento calcolato dal Valore di Credito esatto e condizione sociale), Compagni investigatori, Note e indizi con pulsante "Segna l'ora".
- **Ritratto**: caricamento di un'immagine, ridimensionata lato client (canvas, lato massimo 320px) prima di salvarla in IndexedDB — non appesantisce l'export JSON, che continua a contenere solo la chiave del ritratto.
- **Tema chiaro/scuro**: interruttore Sistema/Chiaro/Scuro nelle Impostazioni (preferenza del dispositivo, salvata in `localStorage`, non nei dati dell'investigatore).
- **Vista di stampa** (`@media print`): nasconde i comandi interattivi (testata, barra di navigazione, pannello di tiro) e mostra caratteristiche/abilità/derivati su un'unica colonna leggibile.
- Pulsante "Chiudi" esplicito in tutti i dialoghi che ne erano privi (Impostazioni, Stati, Aggiungi abilità), per chi non sa che il tasto Esc o il clic fuori dal riquadro chiudono comunque.
- **Pubblicazione su GitHub Pages**: percorsi relativi in `vite.config.ts` (funzionano da qualunque sottopercorso, senza modifiche), flusso `--.github/workflows/deploy-pages.yml` che compila e pubblica automaticamente a ogni push su `main`.
- `README.md` completo: avvio in locale, installazione su telefono/tablet, backup tramite export/import JSON, pubblicazione passo-passo su GitHub Pages.

### Corretto durante la stesura
- `vite.config.ts` usava percorsi assoluti (`/icons/...`, `start_url: '/'`) che avrebbero rotto manifest e Service Worker una volta pubblicati in un sottopercorso GitHub Pages (`/nome-repository/`); passati tutti a percorsi relativi.

## Fase 2 — Al tavolo

### Aggiunto
- Vista **Combattimento**: iniziativa da DES con interruttore "Arma da fuoco pronta" (+50), gittata ravvicinata calcolata da DES/5 (mostrata in metri o piedi secondo le impostazioni), colpi per round con dado penalità automatico su 2-3 colpi, schede armi con indicatori munizioni consumabili, Attacca/Tira danno/Danno estremo, malfunzionamento automatico (arma inceppata quando il tiro raggiunge la soglia), ricarica, aggiunta/rimozione armi, promemoria di mischia e calcolo manovra contro la Struttura dell'avversario.
- **Modalità dadi fisici** nel pannello di tiro: inserimento di unità e fino a tre decine, oppure del risultato finale direttamente.
- Vista **Registro** dedicata, con "Annulla ultima azione" e il conteggio dei passi disponibili nella pila di annullamento.
- Vista **Fine scenario**: tira 1D100 per ogni abilità spuntata (aumento di 1D10 se il tiro supera il valore o 95), rimuove sempre le spunte, assegna +2D6 SAN per ogni abilità che supera la soglia 90, e recupero di Fortuna di fine sessione opzionale.
- **PWA offline installabile**: `vite-plugin-pwa` con service worker (precache di tutto il bundle, nessuna chiamata di rete a runtime), manifest con icone 192/512/maskable generate localmente (nessuna dipendenza di disegno: un piccolo encoder PNG scritto a mano in `scripts/generate-icons.mjs`), meta tag per l'installazione su iOS/Android.
- **Screen Wake Lock API** con interruttore "Tieni lo schermo acceso" in testata (solo in Modalità scheda), degradazione silenziosa se il browser non la supporta, ri-acquisizione automatica al ritorno di visibilità della pagina.

### Corretto durante il collaudo manuale
- La spunta esperienza delle abilità era sempre presente nel testo del pulsante (nascosta solo via colore trasparente): un lettore di schermo o un'estrazione testuale la vedeva su ogni abilità, anche quelle non spuntate. Ora il segno di spunta non viene proprio renderizzato quando l'abilità non è spuntata.

### Verificato manualmente nel browser
- Tiro d'attacco con arma da fuoco: apertura del pannello, munizioni scalate, esito e registro corretti.
- Fase di sviluppo: nessun aumento quando il tiro non supera né il valore né 95; spunta rimossa comunque.
- Build di produzione (`npm run build`) genera correttamente `sw.js`, `manifest.webmanifest` e precache; verificata con `npm run preview`. La registrazione effettiva del Service Worker non è verificabile nel pannello del browser automatizzato di sviluppo (blocca l'API `serviceWorker.register`), ma il file, il tipo MIME e il manifest sono corretti — da confermare in un browser reale (istruzioni nel README).
