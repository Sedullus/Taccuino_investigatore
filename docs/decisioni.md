# Decisioni sui punti [VERIFICA] e altre scelte di implementazione

Questo documento elenca i punti che la specifica (`docs/regole-scheda-7e.md`) marca esplicitamente come **[VERIFICA]**, la scelta adottata nel motore di regole, e dove intervenire per cambiarla. Include anche un paio di scelte di modellazione dati che non sono ambigue nella specifica ma meritano una nota per chi legge il codice.

## Punti [VERIFICA] della specifica

### 1. Follia Indefinita — arrotondamento della soglia (§7)

> "se la perdita cumulata nella giornata è pari o superiore a floor(SAN inizio giornata / 5), l'app segnala Follia Indefinita."

**Scelta adottata:** `floor`, come già scritto nella formula stessa — è l'unica lettura coerente con le altre soglie della specifica (Metà, Quinto, Estremo usano tutte `floor`).

**Dove cambiarla:** [`src/rules/sanity.ts`](../src/rules/sanity.ts), funzione `sogliaFolliaIndefinita`. Non è esposta come impostazione configurabile: cambiare la singola riga se in futuro servisse un arrotondamento diverso.

**Test:** `src/rules/__tests__/sanity.test.ts` (caso 37 del §14: SAN inizio giornata 60, perdite 4+8 → soglia 12, Follia Indefinita).

### 2. Danno estremo con BD negativo — non sotto zero (§10.4)

> "[VERIFICA] Con BD negativo il danno totale non scende sotto 0."

**Scelta adottata:** il danno (normale, estremo, e ogni espressione di dado in generale) è sempre limitato a un minimo di 0. La clamp è applicata una sola volta in [`src/rules/dice.ts`](../src/rules/dice.ts) (`tira` e `massimo`), così tutte le funzioni di `combat.ts` la ereditano automaticamente.

**Dove cambiarla:** `src/rules/dice.ts`, le righe `Math.max(0, totale)` in `tira` e `massimo`. Non è esposta come impostazione: è l'unica interpretazione sensata (un colpo non può curare).

**Test:** `src/rules/__tests__/combat.test.ts` ("il danno estremo non scende mai sotto 0").

## Altre note di implementazione (non [VERIFICA], ma degne di nota)

### BD nel campo "danno" delle armi

La specifica descrive il danno normale come "si tira l'espressione dell'arma e si aggiunge il BD come previsto" (§10.4) e il danno estremo come "massimo del danno dell'arma + massimo del BD" (§10.4, casi di test 23 e 24) — trattando sempre **l'espressione di danno dell'arma** e **il BD** come due componenti separate, sommate dal motore secondo `bdMode` (§10.2: completo/metà/nessuno).

Per questo, nel modello dati il campo `Arma.danno` contiene **solo** i dadi propri dell'arma (es. `"1D6"`, `"1D3"`), **senza** il token `BD` incorporato nel testo. Il BD si applica sempre separatamente, in base a `bdMode` — vedi `contestoBDPerModalita` e `dannoNormale`/`dannoEstremo` in [`src/rules/combat.ts`](../src/rules/combat.ts).

Il parser di `dice.ts` supporta comunque i token `BD` e `½BD` incorporati in un'espressione libera (richiesto esplicitamente dal §5.9, es. per la spesa/PM o espressioni personalizzate) — è solo il modello delle armi a non fare affidamento su questa convenzione, per evitare di contare il BD due volte nel danno estremo.

### Metà BD (½BD) per valori non elencati esplicitamente

La specifica richiede il supporto del token `½BD` ma non ne specifica la tabella di conversione. È stata adottata la progressione ufficiale standard di 7a Edizione: `1D4→1D2`, `1D6→1D3`, `ND6→⌊N/2⌋D6` (minimo `1D6`) per N≥2. Vedi `metaBD` in `src/rules/dice.ts`.

### Schivare come abilità con base a formula

Schivare è sia un valore derivato (§3: `floor(DES/2)`) sia un'abilità del catalogo §4.2 ("Schivare = DES/2"), quindi compare **una sola volta** nella scheda: come voce dell'elenco abilità (con Metà/Quinto e spunta esperienza), la cui `base` è calcolata da DES (sovrascrivibile tramite `override.schivare`, come gli altri valori derivati) e il cui `valore` può crescere con l'esperienza come ogni altra abilità.

### Il ritratto non è incluso nell'export JSON

L'immagine del ritratto (§11, Fase 3) è salvata in IndexedDB separatamente dall'investigatore, referenziata dalla sola chiave in `anagrafica.ritratto`. L'export/import JSON porta con sé quella chiave, ma non i byte dell'immagine: importando la scheda su un altro dispositivo, il ritratto va ricaricato a mano. Scelta deliberata per tenere il file di backup piccolo e leggibile; se in futuro servisse un backup "tutto compreso", il punto da cambiare è `esportaJSON`/`importaJSON` in `src/persistence/importExport.ts`, includendo il contenuto di `leggiRitratto`/`salvaRitratto` (`src/persistence/archivio.ts`).

### Unità di visualizzazione della gittata ravvicinata — default

Il calcolo resta sempre in piedi (`DES/5`), come richiesto. Il default dell'**unità mostrata** nell'interfaccia (non specificato dalla specifica) è impostato su "metri", più naturale per chi gioca in italiano. Cambiabile nelle Impostazioni in qualsiasi momento (`impostazioni.unitaDistanza`).

### Precompilazione delle abilità su una scheda nuova

Una scheda nuova (`abilitaSchedaNuova` in `src/rules/skills1920.ts`) parte con tutte le abilità a istanza singola del catalogo, più Schivare, e le tre specializzazioni di mischia/armi da fuoco più comuni (Combattere-Rissa, Armi da Fuoco-Pistola e -Fucile/Shotgun), tutte a valore base — come le caselle già stampate sul modulo cartaceo di riferimento. Le altre abilità a istanza multipla (Arti e Mestieri, Scienza, Lingua, Pilotare, Sopravvivenza…) **non** vengono precompilate con una riga "generica" senza specializzazione: sul modulo cartaceo restano righe bianche da scrivere a mano, e in questa app il modo corretto di aggiungerle resta il pulsante "Aggiungi abilità" (che richiede comunque di scegliere una specializzazione per essere allenabili). Dove cambiarla: `abilitaSchedaNuova` in `src/rules/skills1920.ts`.

### Le note manoscritte non sono incluse nell'export JSON

Stessa scelta del ritratto qui sopra, per lo stesso motivo: il disegno a mano libera delle Note e indizi (§ "Note e indizi") è un'immagine PNG salvata in IndexedDB, referenziata dalla sola chiave in `noteManoscritte`. L'export JSON porta con sé la chiave ma non i byte del disegno. Dove cambiarla: `esportaJSON`/`importaJSON` in `src/persistence/importExport.ts`, includendo il contenuto di `leggiManoscritto`/`salvaManoscritto` (`src/persistence/archivio.ts`).

### Il Taccuino delle avventure: struttura a due livelli, e le sue immagini non sono incluse nell'export JSON

Il Taccuino (Avventura → Sessioni, ciascuna con titolo, data di gioco, luogo, racconto libero e immagini — `src/components/taccuino/VistaTaccuino.tsx`) è annidato a due livelli, non uno solo: ogni `Avventura` (`src/rules/types.ts`) raccoglie le `SessioneAvventura` di quella campagna, mostrate nella barra laterale sotto l'avventura aperta. È legato all'investigatore attivo (campo `avventure`, facoltativo per compatibilità con le schede precedenti a `versioneSchema` 4 — migrazione registrata, nessun dato da trasformare, come `icona` e `noteManoscritte`), non un taccuino condiviso tra investigatori diversi.

Le immagini di ogni sessione seguono esattamente lo stesso pattern del ritratto e delle note manoscritte (voci qui sopra): salvate in IndexedDB una per una (`salvaImmagineTaccuino`/`leggiImmagineTaccuino`/`eliminaImmagineTaccuino` in `src/persistence/archivio.ts`), referenziate dalla sola chiave in `ImmagineNota.chiave`. L'export JSON porta con sé le chiavi ma non i byte: importando la scheda su un altro dispositivo, le foto vanno riaggiunte a mano. Stessa scelta deliberata, per lo stesso motivo (backup piccolo e leggibile) — dove cambiarla: `esportaJSON`/`importaJSON` in `src/persistence/importExport.ts`, includendo il contenuto di `leggiImmagineTaccuino` per ogni immagine referenziata nelle sessioni.

Eliminare una sessione o un'intera avventura elimina anche i byte delle sue immagini da IndexedDB (loop su `immagini` prima della mutazione, in `src/store/investigatoreStore.ts`); duplicare una scheda (`duplicaScheda`) no — condivide le chiavi con l'originale finché non si tocca un'immagine, esattamente come già succede oggi per ritratto e note manoscritte.
