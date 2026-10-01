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

### Dettatura vocale nel racconto della sessione: la prima delle due chiamate di rete a runtime, ed è facoltativa

Il pulsante **Detta** accanto al racconto della sessione (`src/hooks/useDettatura.ts`, usato da `VistaTaccuino.tsx`) usa la Web Speech API del browser (`SpeechRecognition`/`webkitSpeechRecognition`). Su Chrome e Edge questa API **non gira sul dispositivo**: l'audio viene inviato ai server di Google per il riconoscimento — in contrasto diretto con la promessa "nessuna chiamata di rete" del README (la seconda eccezione, il riassunto AI nel PDF, è documentata subito qui sotto).

**Scelta adottata:** procedere comunque, ma con due vincoli non negoziabili:
1. **Mai attivo di default.** Il pulsante avvia il riconoscimento solo su un'azione esplicita dell'utente ("Detta"), e si può interrompere in ogni momento ("Interrompi dettatura"). Nessun microfono acceso in background.
2. **Sempre facoltativo e isolato.** Il pulsante compare solo se il browser espone l'API (feature detection in `costruttoreDisponibile`); su un browser senza supporto (es. Firefox desktop) la sezione Racconto resta identica a prima, senza alcuna differenza visibile. Nessun'altra parte dell'app dipende da questa funzione.

**Perché non un'alternativa offline:** non esiste, ad oggi, un'API standard del browser per il riconoscimento vocale interamente on-device e universalmente supportata — il comportamento (locale o via server) dipende dal motore del browser e non è controllabile dall'app. L'alternativa "zero rete" resta la dettatura già offerta dalla tastiera del sistema operativo (Gboard, iOS, Windows), che funziona su qualunque campo di testo dell'app senza bisogno di questo pulsante.

**Dove cambiarla:** `src/hooks/useDettatura.ts` (il motore usato) e il pulsante in `src/components/taccuino/VistaTaccuino.tsx`. Solo il racconto della sessione ha il pulsante; titolo/data/luogo della sessione e titolo dell'avventura restano solo tastiera, per scelta esplicita (sono campi brevi, dove la dettatura aiuta meno).

### Esporta PDF della sessione: pagine "carta invecchiata", foto in fondo una per pagina, riassunto AI opzionale (seconda chiamata di rete)

Il pulsante **Esporta PDF** (intestazione della sessione, `VistaTaccuino.tsx`) genera un PDF con `jsPDF` (`src/utils/pdfSessione.ts`): intestazione (avventura, sessione, data, luogo, nome investigatore), il racconto integrale impaginato su una o più pagine, poi le foto allegate — **una per pagina**, a piena larghezza con la didascalia sotto, così restano leggibili anche se contengono dettagli da esaminare (indizi, mappe). Le pagine riprendono lo stile "carta invecchiata" della pagina del racconto a schermo (stesso sfondo color pergamena, stesso bordo), non il foglio bianco e nero usato per la vista di stampa della scheda investigatore: qui il PDF è un ricordo della sessione da conservare, non un riepilogo da consultare al tavolo.

`jsPDF` (~330 KB minificato) è importata con `import()` dinamico dentro `generaPdfSessione`, non in testa al file: come il catalogo completo delle icone armi (vedi più sotto in questo stesso documento), non deve pesare sul caricamento iniziale dell'app per chi non esporta mai un PDF — resta in un blocco separato, scaricato solo al primo click su "Esporta PDF".

**Riassunto AI (facoltativo):** se nelle Impostazioni è salvata una chiave API Anthropic, "Esporta PDF" chiama anche `generaRiassunto` (`src/utils/riassuntoAI.ts`), che manda il racconto all'API Messages di Anthropic (modello Haiku) e include il risultato nel PDF in una sezione a parte, chiaramente etichettata "RIASSUNTO (generato dall'AI)". Quattro scelte deliberate:
1. **Solo nel PDF, mai salvato.** Il racconto della sessione nel Taccuino non viene mai toccato o sovrascritto: il riassunto è rigenerato a ogni esportazione (nessuna cache), quindi ogni "Esporta PDF" con la chiave configurata consuma crediti API — costo accettato per restare stateless, senza aggiungere un altro campo/versione di schema solo per una cache.
2. **Fallisce in modo silenzioso sul PDF, non lo blocca.** Se la chiamata ad Anthropic fallisce (rete, chiave non valida, timeout), il PDF viene generato comunque, senza la sezione riassunto, con un messaggio inline sotto i pulsanti della sessione (mai un dialogo bloccante).
3. **Chiave API salvata per dispositivo, non per investigatore.** `salvaChiaveApiAnthropic`/`leggiChiaveApiAnthropic` (`src/persistence/archivio.ts`) usano una chiave IndexedDB indipendente dagli investigatori: non passa mai per `investigatoreSchema`, quindi non può finire nell'export JSON nemmeno per errore. **Limite di sicurezza dichiarato:** essendo un'app senza server, la chiamata ad Anthropic parte direttamente dal browser con l'header `anthropic-dangerous-direct-browser-access`, e la chiave è leggibile da chiunque abbia accesso al dispositivo/browser (IndexedDB, strumenti sviluppatore) — non è un segreto protetto come lo sarebbe dietro un backend. Scelta comunque adottata, coerente con l'assenza di server dell'app: l'alternativa sarebbe stata costruire un piccolo proxy server, che avrebbe contraddetto l'intera premessa "nessun server" del progetto.
4. **Output a sezioni, non un paragrafo unico.** Il prompt di sistema (`ISTRUZIONI_SISTEMA` in `riassuntoAI.ts`) chiede esplicitamente quattro sezioni — NARRAZIONE, INDIZI, PERSONAGGI, FILONI APERTI — pensate per essere utili da rileggere prima della sessione successiva, non solo un riassunto discorsivo. `analizzaRiassunto` divide la risposta in queste sezioni per il rendering nel PDF; se l'AI non rispetta il formato (può succedere), ripiega su un'unica sezione "RIASSUNTO" col testo intero, senza perdere nulla.

### Contesto delle sessioni precedenti nel riassunto AI, e cronologia dell'avventura esportabile in .md

Perché il riassunto di una sessione tenga conto di quello che è già successo nella stessa avventura (PNG già incontrati, indizi già raccolti, filoni già aperti), `costruisciContestoAvventura` (`src/utils/cronologiaAvventura.ts`) costruisce **al volo** un testo di contesto dalle sessioni precedenti della stessa avventura e lo allega al prompt (parametro `system` più contesto nel messaggio, `generaRiassunto`). Scelta deliberata: **nessuno stato generato dall'AI che si "auto-aggiorna"** sessione dopo sessione — che rischierebbe di andare fuori sincrono rispetto a quanto l'utente ha scritto davvero, e di far accumulare errori di un riassunto sull'altro. Il contesto è sempre ricostruito dai dati reali già nel Taccuino (titolo, data, luogo, racconto di ogni sessione), mai da un riassunto precedente.

Per non far crescere senza limite il testo (e il costo) inviato all'API su campagne lunghe, solo le **ultime 5 sessioni precedenti** entrano per intero nel contesto; quelle più vecchie compaiono solo come titolo/data/luogo, senza il racconto completo — comunque utile per la cronologia, non per il dettaglio.

La stessa funzione di costruzione (`esportaCronologiaMd`) alimenta anche il pulsante **"Esporta cronologia (.md)"** (intestazione dell'avventura, non della singola sessione): un file Markdown con tutte le sessioni dell'avventura per intero, in ordine cronologico — un diario leggibile della campagna, utile anche fuori dall'app (per esempio, incollato in una chat con un'AI). A differenza del contesto per il riassunto, qui non c'è alcun limite: è un export completo, generato on demand, non inviato a nessun servizio.

**Dove cambiarle:** `src/utils/pdfSessione.ts` (impaginazione, stile, foto, rendering delle sezioni del riassunto), `src/utils/riassuntoAI.ts` (prompt, formato delle sezioni, modello, endpoint), `src/utils/cronologiaAvventura.ts` (contesto e cronologia), `src/components/dialoghi/ImpostazioniDialogo.tsx` (campo chiave API).

### Riconoscimento dei nomi per il riassunto AI: euristica locale, non un vero NER

Il riassunto AI (sezione PERSONAGGI, e la nuova sezione LUOGHI E OGGETTI) deve poter ricostruire cosa si sa già di un PNG anche se è stato introdotto molte sessioni fa — oltre il limite delle "ultime 5" di `costruisciContestoAvventura`. Per farlo senza una seconda chiamata API (costo, latenza) né un vero riconoscimento di entità (NER in italiano, inaffidabile con poche righe di codice, e comunque richiederebbe un modello/libreria a parte), `estraiCandidatiNome` (`src/utils/cronologiaAvventura.ts`) usa un'euristica grezza e del tutto locale: parole capitalizzate che non aprono la frase (per scartare le maiuscole dovute solo all'inizio periodo), unite alla parola successiva se anch'essa capitalizzata (per "Nome Cognome"), ordinate per frequenza.

Questi candidati — **non necessariamente nomi propri veri**, solo parole che potrebbero esserlo — vengono cercati per intero (`cercaRiferimentiNomi`) in **tutte** le sessioni dell'avventura, non solo le ultime 5: qui non c'è motivo di limitarsi, è una ricerca di stringa locale, non una chiamata a pagamento. Gli estratti trovati (fino a 3 per nome, troncati a 400 caratteri) vengono allegati al prompt sotto l'etichetta "Riferimenti trovati nella cronologia per nomi ricorrenti", con un'istruzione esplicita al modello (`ISTRUZIONI_SISTEMA` in `riassuntoAI.ts`) di usare il buon senso e ignorare quelli che non sono davvero nomi di personaggi, luoghi o oggetti: **è l'AI, non l'euristica, a decidere cosa è rilevante** — l'euristica serve solo a non perdere la ricerca su tutta la cronologia, non a filtrare con precisione.

Conseguenza accettata: l'euristica a volte segnala falsi positivi (parole capitalizzate che non sono nomi) e può mancare nomi scritti in modi inconsistenti (minuscolo, abbreviati diversamente da una sessione all'altra) — entrambi i casi degradano in modo innocuo (rumore ignorato dal modello, o semplicemente nessun riferimento trovato, esattamente come se la funzione non esistesse). **Dove cambiarla:** `estraiCandidatiNome`/`cercaRiferimentiNomi` in `src/utils/cronologiaAvventura.ts`.
