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
- Fasi 2 e 3 (Combattimento, dadi fisici completi, registro di sessione dedicato, fase di sviluppo, PWA/offline/Wake Lock, Trascorsi/Equipaggiamento/Denaro/Compagni/Note, ritratto, stampa) non ancora iniziate.
