# Specifica regole — Scheda interattiva de Il Richiamo di Cthulhu 7a Edizione (anni '20)

Questo documento è la **fonte di verità** per terminologia, calcoli e stati della scheda.

## Legenda fonti
- **[RI]** — Regole Introduttive 7a Edizione, Raven Distribution (PDF gratuito ufficiale). Affidabile.
- **[MB]** — Manuale Base 7a Edizione. Regola completa che l'introduttivo semplifica o omette. Da confrontare con la copia fisica.
- **[VERIFICA]** — punto con un'ambiguità nota. Va reso **configurabile**, oppure confermato dall'utente prima di implementarlo.

---

## 0. Perimetro
- La scheda serve a **giocare** un investigatore **già creato**. Non c'è un wizard di creazione, ma serve una **Modalità Modifica** per inserire e aggiornare tutti i valori.
- L'era supportata è quella degli **anni '20**, secondo il Manuale Base.
- Si usa la terminologia italiana Raven: FOR, COS, POT, DES, FAS, TAG, INT, IST; "Custode", "investigatore".
- **FAS (Fascino)** è la sigla ufficiale della stampa italiana Raven, corrispondente all'inglese APP. ASP non si usa: l'etichetta è fissa, senza opzione di configurazione.

## 1. Anagrafica
Nome investigatore, Giocatore, Professione, Età, Sesso, Residenza, Luogo di nascita e un ritratto facoltativo (immagine caricata dall'utente).

## 2. Caratteristiche
- Le caratteristiche sono otto: FOR, COS, POT, DES, FAS, TAG, INT, IST. Ognuna ha un valore Normale inserito dall'utente.
- Da ciascuna si calcolano **Metà** = floor(valore/2) e **Quinto** = floor(valore/5) [RI]. Metà e Quinto vanno mostrati sempre accanto al Normale.
- Le caratteristiche si possono tirare come le abilità (vedi §5), ma **non ricevono la spunta esperienza** [MB].

## 3. Valori derivati
Tutti i valori derivati sono calcolati automaticamente, con possibilità di **override manuale** e un indicatore visibile quando l'override è attivo.

| Valore | Regola | Fonte |
|---|---|---|
| PF massimi | floor((TAG + COS) / 10) | [RI] |
| PM massimi | floor(POT / 5) | [RI] |
| SAN iniziale | pari a POT (serve solo come riferimento, la SAN attuale è inserita) | [RI] |
| SAN massima | 99 − valore di Miti di Cthulhu | [MB] |
| Fortuna | valore inserito (in creazione era 3D6×5) | [RI] |
| Schivare (base) | floor(DES / 2) | [MB] |
| Lingua Madre (base) | pari a IST | [RI] |

### 3.1 Bonus al Danno (BD) e Struttura, calcolati da FOR + TAG
| FOR+TAG | BD | Struttura | Fonte |
|---|---|---|---|
| 2–64 | −2 | −2 | [RI] |
| 65–84 | −1 | −1 | [RI] |
| 85–124 | 0 | 0 | [RI] |
| 125–164 | +1D4 | 1 | [RI] |
| 165–204 | +1D6 | 2 | [RI] |
| 205–284 | +2D6 | 3 | [MB] |
| 285–364 | +3D6 | 4 | [MB] |
| ogni +80 | +1D6 | +1 | [MB] |

### 3.2 Movimento (MOV) [MB]
- MOV vale **7** se DES e FOR sono entrambe minori di TAG.
- Vale **9** se DES e FOR sono entrambe maggiori di TAG.
- In tutti gli altri casi vale **8**.
- Modificatore per età: 40–49 −1; 50–59 −2; 60–69 −3; 70–79 −4; 80–89 −5.
- Nelle [RI] il MOV è semplificato a 8 fisso. Il calcolo va quindi reso sovrascrivibile.

## 4. Abilità (anni '20)

### 4.1 Modello
Ogni abilità ha i seguenti campi:
- `nome` e `specializzazione` (facoltativa);
- `base` e `valore` attuale, con Metà e Quinto calcolati;
- `spunta` (booleana, al massimo una) [RI];
- `preferita` (per fissarla in cima alla lista);
- `nonSpuntabile`, che vale true per **Miti di Cthulhu** e **Valore di Credito** [MB].

Alcune abilità sono **multi-istanza**, cioè si possono aggiungere più volte con specializzazioni diverse: Arti e Mestieri, Scienza, Combattere, Armi da Fuoco, Lingua (Altra), Pilotare, Sopravvivenza. Deve essere possibile aggiungere anche abilità personalizzate.

### 4.2 Valori base di riferimento [MB] (modificabili)
Ammaliare 15 · Antropologia 01 · Archeologia 01 · Arti e Mestieri (…) 05 · Ascoltare 20 · Biblioteconomia 20 · Camuffare 05 · Cavalcare 05 · Contabilità 05 · Furtività 20 · Guidare Auto 20 · Individuare 25 · Intimidire 15 · Lanciare 20 · Legge 05 · Lingua (Altra) 01 · Lingua Madre = IST · Manovrare Macchinari Pesanti 01 · Medicina 01 · Miti di Cthulhu 00 · Naturalistica 10 · Navigare 10 · Nuotare 20 · Occultismo 05 · Persuadere 10 · Pilotare (…) 01 · Primo Soccorso 30 · Psicoanalisi 01 · Psicologia 10 · Raggirare 05 · Rapidità di Mano 10 · Riparazioni Elettriche 10 · Riparazioni Meccaniche 10 · Saltare 20 · Scalare 20 · Scassinare 01 · Schivare = DES/2 · Scienza (…) 01 · Seguire Tracce 10 · Sopravvivenza (…) 10 · Storia 05 · Valore di Credito 00 · Valutare 01

Specializzazioni di combattimento [MB]. Sono specializzazioni di un'abilità macro, con la Rissa come predefinita:
- **Combattere:** Rissa 25, Ascia 15, Frusta 05, Garrota 15, Lancia 20, Mazzafrusto 10, Spada 20.
- **Armi da Fuoco:** Pistola 20, Fucile/Shotgun 25, Arco 15, Mitra 15, Mitragliatrice 10, Lanciafiamme 10, Armi Pesanti 10.

**Confermato**: la dicitura ufficiale Raven usa l'infinito, quindi **Combattere (Rissa)** e non *Combattimento*. Tutte le etichette stanno in un unico catalogo di stringhe, così una correzione futura è una riga sola.

Abilità non comuni, aggiungibili da un menu [MB]: Artiglieria 01, Demolizioni 01, Ipnosi 01, Addestrare Animali 05, Lettura Labiale 01, Sommozzatore 01. **Pilotare** non è un'abilità non comune: sta nella lista principale, con specializzazione obbligatoria (Aerei, Dirigibili, Imbarcazioni).

**Non copiare** le descrizioni delle abilità dal manuale. Se servono tooltip, vanno scritti con parole proprie, in una riga.

### 4.3 Valore di Credito
Fasce di condizione sociale [RI]:

| Valore di Credito | Condizione |
|---|---|
| 0 | Squattrinato |
| 1–9 | Povero |
| 10–49 | Medio |
| 50–89 | Benestante |
| 90–98 | Ricco |
| 99 | Nababbo |

Contanti, beni e spesa giornaliera, anni '20 [MB] — **confermato**. I valori sono un suggerimento calcolato, e i campi restano modificabili:

| Valore di Credito | Livello di vita | Spesa giornaliera | Contanti | Beni / Proprietà |
|---|---|---|---|---|
| 0 | Miserabile | 0,50 $ | 0,50 $ | nessuno |
| 1–9 | Povero | 2 $ | VdC × 1 $ | VdC × 10 $ |
| 10–49 | Medio | 10 $ | VdC × 2 $ | VdC × 50 $ |
| 50–89 | Benestante | 30 $ | VdC × 5 $ | VdC × 200 $ |
| 90–98 | Ricco | 250 $ | VdC × 20 $ | VdC × 2.000 $ |
| 99 | Sfacciatamente ricco | 5.000 $ | 50.000 $ | 5.000.000 $ o più |

Il moltiplicatore si applica al **punteggio esatto** di Valore di Credito, non al minimo della fascia: con VdC 35 i contanti sono 70 $ e i beni 1.750 $.

La **spesa giornaliera** è un valore fisso per fascia e serve a snellire il gioco: ogni acquisto di routine che non la supera non va scalato dai contanti né tracciato. L'interfaccia deve renderlo esplicito, così il giocatore non aggiorna il denaro a ogni caffè.

---

## 5. Tiri

### 5.1 Lettura del D100 [RI]
Si tirano un dado delle decine (00–90) e un dado delle unità (0–9).

```
valore(decina, unità) = (decina == 0 && unità == 0) ? 100 : decina + unità
```
Ad esempio, 00 e 3 danno 3; 00 e 0 danno 100.

### 5.2 Dadi bonus e penalità
- Per ogni dado bonus o penalità si tira una decina aggiuntiva; l'unità resta una sola [RI].
- Con i dadi bonus si tiene il valore **minore** tra le combinazioni; con i dadi penalità il **maggiore** [RI].
- Bonus e penalità si annullano a vicenda. Il netto va limitato all'intervallo −2…+2 [RI] [MB].
- Il minimo e il massimo vanno calcolati sui **valori combinati** (con la regola del 100), non sulle sole decine. Con unità 0 e decine 00 e 30 i valori sono 100 e 30: con il bonus si tiene 30, con la penalità 100.

### 5.3 Livello ottenuto e difficoltà
Il livello ottenuto dipende dal valore dell'abilità:
```
se roll == 1                  → CRITICO            [MB]
se roll <= floor(valore/5)    → ESTREMO            [RI]
se roll <= floor(valore/2)    → ARDUO              [RI]
se roll <= valore             → NORMALE            [RI]
altrimenti                    → FALLIMENTO
```
La difficoltà richiesta (Normale, Arduo o Estremo) è scelta dal giocatore su indicazione del Custode.
- `obiettivo` = valore, floor(valore/2) o floor(valore/5) a seconda della difficoltà.
- Il tiro **riesce** se `roll <= obiettivo` oppure se `roll == 1`.
- **Disastro** [MB] — **confermato**: la soglia si calcola sull'**obiettivo della difficoltà richiesta dal Custode**, non sul valore pieno dell'abilità.
  - obiettivo < 50 → Disastro con `roll` tra 96 e 100;
  - obiettivo >= 50 → Disastro solo con `roll == 100`.

L'ordine dei livelli, dal peggiore al migliore, è: Disastro < Fallimento < Normale < Arduo < Estremo < Critico.

### 5.4 Tiri contrastati [RI]
Vince il livello di successo migliore. A parità di livello vince chi ha l'abilità più alta; se anche le abilità sono pari, entrambi ritirano e vince il risultato più basso.
Funzione utile ma facoltativa: "confronto rapido", in cui si inserisce il livello e l'abilità dell'avversario e l'app indica il vincitore.

### 5.5 Tiro forzato
- Si può forzare solo un tiro **fallito** di abilità o caratteristica, **una volta sola** [RI].
- Non si possono forzare: tiri di combattimento [RI]; tiri Sanità, tiri Fortuna, tiri già forzati [MB].
- Prima di forzare, l'interfaccia ricorda al giocatore di concordare con il Custode la giustificazione e le conseguenze.
- Il tiro forzato va marcato come tale nel registro.

### 5.6 Spendere Fortuna — regola opzionale, con interruttore nelle impostazioni [MB] — **confermato**
- Dopo un tiro fallito, si possono spendere punti Fortuna pari alla differenza `roll − obiettivo` per trasformarlo in successo.
- La spesa **non è mai ammessa** su: tiri Fortuna, tiri Sanità e perdita di SAN, tiri di danno, tiri forzati, fallimenti critici e **Disastri**.
- Un successo ottenuto spendendo Fortuna **non dà la spunta**.
- Quando la spesa non è consentita, il pulsante è disabilitato e l'interfaccia spiega in una riga il motivo.
- Recupero di fine sessione (opzionale): si tira 1D100; se il risultato supera la Fortuna attuale, si guadagna +1D10 (massimo 99).

### 5.7 Tiro Fortuna [RI]
Riesce con un risultato pari o inferiore alla Fortuna **attuale**. Nel tiro Fortuna di gruppo tira chi ha la Fortuna più bassa.

### 5.8 Modalità dadi fisici
Il giocatore inserisce i dadi reali: un'unità e 1–3 decine. L'app applica tutta la logica dei §5.2–5.6. Deve anche essere possibile inserire direttamente il numero finale.

### 5.9 Espressioni di dado
Il parser deve supportare `NdX`, costanti, `+` e `−`, e i token `BD` e `½BD`. Esempi: `1D10`, `2D6+4`, `1D3+BD`, `1D6+1+2D4`, `0/1D6`, `1D3/1D20`.
Servono due funzioni: `tira(expr)` e `massimo(expr)`, quest'ultima per i danni estremi.
L'RNG usa `crypto.getRandomValues` ed è iniettabile, così i test sono deterministici.

---

## 6. Esperienza e fase di sviluppo
- La spunta si mette in automatico dopo un successo con l'abilità, e resta modificabile a mano. Un'abilità ha al massimo una spunta [RI].
- **Fase di sviluppo** (procedura guidata a fine scenario). Per ogni abilità spuntata:
  - si tira 1D100; se il risultato è **maggiore del valore** oppure **maggiore di 95**, l'abilità guadagna +1D10 [RI] [MB];
  - se l'abilità passa da un valore sotto 90 a 90 o più, l'investigatore guadagna **+2D6 SAN** [MB];
  - alla fine si toglie la spunta, anche se l'aumento non c'è stato [RI].
- Tutto viene riepilogato nel registro.

## 7. Sanità
- Il tracker va da 0 alla SAN massima. Quando Miti di Cthulhu aumenta, la SAN massima si ricalcola e la SAN attuale viene ridotta al nuovo massimo se lo supera.
- **Tiro Sanità** [RI]: l'utente inserisce la perdita nel formato `successo/fallimento` (per esempio `0/1D6`) e tira 1D100 contro la SAN attuale.
  - Se il tiro riesce, perde la parte a sinistra; se fallisce, perde la parte a destra.
  - Con un Disastro perde il **massimo** della parte a destra [MB].
  - Il tiro Sanità non si forza e non ammette spesa di Fortuna.
- **Perdita di 5 o più punti in un solo tiro** [RI]: l'app chiede un tiro INT. Se riesce, l'investigatore entra in **Follia Temporanea** per 1D10 ore; se fallisce, non c'è follia, ma l'evento resta nel registro.
- **Follia Indefinita** [MB] [VERIFICA arrotondamento]:
  - l'app memorizza la "SAN a inizio giornata di gioco", con un pulsante "Nuova giornata";
  - se la perdita cumulata nella giornata è pari o superiore a floor(SAN inizio giornata / 5), l'app segnala Follia Indefinita.
- **SAN a 0** → Follia Permanente [MB].
- Stati da mostrare, attivabili anche a mano: Follia Temporanea, Follia Indefinita, Follia Permanente.
- L'episodio di follia (1D10 round) lo gestisce il Custode. La scheda **non** riporta la tabella: offre un campo nota e un contatore di round facoltativo.
- Il recupero di SAN si fa con +/− e un motivo facoltativo, che finisce nel registro.

## 8. Punti Ferita
- I PF vanno da 0 al massimo e **non scendono sotto zero** [RI].
- **Applica danno** (singolo colpo) [RI]:
  - se `danno >= PF max` → **Morto**;
  - se `danno * 2 >= PF max` → **Ferita Grave**, e l'app chiede un tiro COS (se fallisce → **Privo di sensi**);
  - se i PF arrivano a 0 **con** Ferita Grave → **Morente**: serve un tiro COS alla fine di ogni round, e un fallimento significa morte. Solo il Primo Soccorso stabilizza temporaneamente;
  - se i PF arrivano a 0 **senza** Ferita Grave → Privo di sensi, senza rischio di morte.
- **Guarigione** [RI]:
  - Primo Soccorso: +1 PF, se applicato entro un'ora; può far riprendere i sensi;
  - Medicina: +1D3 PF, richiede almeno un'ora;
  - senza Ferita Grave: +1 PF al giorno;
  - con Ferita Grave: tiro COS a fine settimana. Il successo dà +1D3, il successo Estremo +2D3 e rimuove la Ferita Grave. La Ferita Grave si rimuove anche quando i PF tornano ad almeno metà del massimo.
- Stati: Ferita Grave, Privo di sensi, Morente, Morto. Ogni modifica si può annullare.

## 9. Punti Magia [RI]
- Tracker con pulsante di spesa. Se i PM non bastano, la parte mancante si scala dai PF.
- Recupero: 1 PM all'ora (pulsante +1).

---

## 10. Combattimento

### 10.1 Pannello
- Il pannello mostra BD, Struttura, Schivare (con Metà e Quinto) e MOV.
- Mostra anche la DES per l'ordine di iniziativa, con un interruttore "Arma da fuoco pronta" che porta la DES a +50 per l'ordine di turno [RI].

### 10.2 Armi
Campi di ogni arma:
- nome e **abilità collegata** (riferimento a un'abilità della scheda);
- danno (espressione) e **tipo**: contundente oppure trafigge;
- applicazione del BD: completo, metà (armi da lancio [MB]) o nessuno (armi da fuoco);
- gittata base, attacchi per round, capacità del caricatore, munizioni attuali;
- valore di malfunzionamento.

Arma predefinita non eliminabile: **Senza armi** — Combattere (Rissa), danno 1D3+BD, contundente [RI].

### 10.3 Tiro d'attacco
- Usa il motore del §5 e **non si forza** [RI].
- Pistole: da 1 a 3 colpi per round. Se se ne sparano 2 o 3, ogni colpo prende un dado penalità [RI]. Le munizioni si scalano in automatico.
- Gittata [MB]: fino alla gittata base la difficoltà è Normale; fino al doppio è Arduo; fino al quadruplo è Estremo.
- **Gittata ravvicinata**: dà un dado bonus [RI]. Dipende dalla **DES del tiratore**, non dall'arma [MB] — **confermato**.
  - Formula: `DES / 5` piedi. Con DES 60 sono 12 piedi, cioè circa 3,6 m (1 piede ≈ 30 cm).
  - L'esempio delle Regole Introduttive italiane calcola 1,8 m perché la traduzione divide la DES per 10, confondendo piedi e metri. **Va ignorato.**
  - Il calcolo del motore resta in piedi, così la logica coincide con il regolamento originale. La conversione in metri è solo di presentazione, con un interruttore nelle impostazioni per l'unità mostrata.
  - L'interfaccia mostra la distanza già calcolata accanto all'interruttore dell'arma: al tavolo si legge il numero, non la formula.
- Malfunzionamento [MB]: se il tiro è pari o superiore al valore di malfunzionamento, l'arma è **inceppata**.
- Copertura: se il bersaglio supera un tiro Schivare per cercare copertura, l'attaccante prende un dado penalità [RI]. È solo un promemoria.

### 10.4 Danno
- Danno normale: si tira l'espressione dell'arma e si aggiunge il BD come previsto.
- **Danno estremo** (attacco riuscito con livello Estremo o Critico) [RI]:
  - armi contundenti: massimo del danno dell'arma + massimo del BD;
  - armi che trafiggono: massimo del danno dell'arma + massimo del BD + un ulteriore tiro del danno dell'arma.
- [VERIFICA] Con BD negativo il danno totale non scende sotto 0.

### 10.5 Promemoria di mischia [RI]
Sono solo testo di consultazione rapida, senza automazioni:
- Chi contrattacca deve ottenere un livello **superiore** a quello dell'attaccante; chi schiva vince anche **a parità**.
- Svantaggio numerico: dopo che il difensore ha già contrattaccato o schivato nel round, gli attacchi successivi contro di lui ricevono un dado bonus (non vale per le armi da fuoco).
- Manovre: si inserisce la Struttura dell'avversario. Se è maggiore della propria, si prende un dado penalità per ogni punto di differenza, fino a un massimo di 2. Se la differenza è 3 o più, la manovra è **inefficace**.

---

## 11. Trascorsi, equipaggiamento, denaro, compagni, note
- **Trascorsi:** Descrizione Personale, Ideologia/Credo, Persone Importanti, Luoghi Importanti, Oggetti di Valore, Tratti, Ferite e Cicatrici, Fobie e Manie, Tomi Arcani/Incantesimi/Manufatti, Incontri con Entità Strane.
- **Equipaggiamento:** lista libera.
- **Contanti e Proprietà:** Livello di spesa, Contanti, Proprietà, con suggerimento dal §4.3.
- **Compagni investigatori:** nome del personaggio e nome del giocatore.
- **Note e indizi:** testo libero, con timestamp facoltativo. Al tavolo è molto utile.

## 12. Registro di sessione
- Ogni tiro e ogni modifica di risorse o stati genera una voce con: ora, tipo, dettaglio (dadi, obiettivo, livello, bonus/penalità, forzato, Fortuna spesa) e valori prima e dopo.
- Serve un **Annulla ultima azione** con una pila di almeno 20 passi.

## 13. Modello dati (indicativo)
```ts
type Investigatore = {
  id: string; versioneSchema: number;
  anagrafica: { nome; giocatore; professione; eta; sesso; residenza; luogoNascita; ritratto?: string };
  caratteristiche: Record<'FOR'|'COS'|'POT'|'DES'|'FAS'|'TAG'|'INT'|'IST', number>;
  override: Partial<{ pfMax; pmMax; sanMax; mov; bd; struttura }>;
  risorse: { pf: number; pm: number; san: number; sanInizioGiornata: number; fortuna: number };
  condizioni: { feritaGrave; privoDiSensi; morente; morto; folliaTemporanea; folliaIndefinita; folliaPermanente: boolean };
  abilita: Abilita[]; armi: Arma[];
  trascorsi: Record<string, string>; equipaggiamento: string;
  denaro: { livelloSpesa; contanti; proprieta: string };
  compagni: { personaggio; giocatore: string }[];
  note: string; registro: VoceRegistro[];
  impostazioni: { spesaFortuna: boolean; dadiFisici: boolean; unitaDistanza: 'metri'|'piedi' };
};
```
L'export/import in JSON deve validare `versioneSchema` e prevedere le migrazioni.

---

## 14. Casi di test obbligatori
| # | Caso | Atteso |
|---|---|---|
| 1 | D100: decina 00, unità 0 | 100 |
| 2 | D100: decina 00, unità 3 | 3 |
| 3 | Bonus: unità 4, decine 40 e 20 | 24 [RI] |
| 4 | Penalità: unità 1, decine 20 e 40 | 41 [RI] |
| 5 | Bonus: unità 0, decine 00 e 30 | 30 (con penalità: 100) |
| 6 | Valore 55, tiro 45, difficoltà Normale | Normale, successo |
| 7 | Valore 55, tiro 24 | Arduo [RI] |
| 8 | Valore 55, tiro 11 | Estremo |
| 9 | Valore 55, tiro 1 | Critico |
| 10 | Valore 45, Normale, tiro 96 | Disastro |
| 11 | Valore 60, Normale, tiro 96 | Fallimento (non Disastro) |
| 12 | Valore 60, Arduo (obiettivo 30), tiro 97 | Disastro |
| 13 | Metà e Quinto di 70 | 35 / 14 [RI] |
| 14 | TAG 50, COS 50 | PF 10 [RI] |
| 15 | TAG 55, COS 60 | PF 11 |
| 16 | POT 40 | PM 8 [RI] |
| 17 | FOR 60 + TAG 70 | BD +1D4, Struttura 1 [RI] |
| 18 | FOR+TAG 64 / 65 / 84 / 85 / 124 / 125 | −2 / −1 / −1 / 0 / 0 / +1D4 |
| 19 | PF max 11, danno 6 | Ferita Grave |
| 20 | PF max 11, danno 5 | nessuna Ferita Grave |
| 21 | PF max 10, danno 5 | Ferita Grave |
| 22 | PF max 11, danno 11 | Morto |
| 23 | Randello 1D6, BD +1D4, livello Estremo | 10 [RI] |
| 24 | Coltello 1D4 (trafigge), BD +1D4, livello Estremo | 8 + 1D4 [RI] |
| 25 | Sviluppo: valore 45, tiro 43 | nessun aumento [RI] |
| 26 | Sviluppo: valore 97, tiro 96 | aumento (tiro > 95) |
| 27 | Sviluppo: da 88 a 93 | +1D10 già applicato e +2D6 SAN |
| 28 | SAN 40, tiro 41 | tiro Sanità fallito [RI] |
| 29 | DES 50 con arma pronta | 100 per l'ordine di turno [RI] |
| 30 | Struttura 0 contro 1 | 1 dado penalità [RI] |
| 31 | Struttura 0 contro 3 | manovra inefficace |
| 32 | DES 65, FOR 50, TAG 55, età 31 | MOV 8 |
| 33 | DES 40, FOR 40, TAG 60, età 25 | MOV 7 |
| 34 | DES 70, FOR 70, TAG 50, età 45 | MOV 8 (9 − 1) |
| 35 | Spesa Fortuna: valore 40, tiro 45, Fortuna 50 | costo 5, Fortuna 45, successo senza spunta |
| 36 | Tentativo di forzare un tiro di combattimento | operazione non consentita |
| 37 | SAN inizio giornata 60, perdite 4 + 8 | Follia Indefinita (12 ≥ 12) |
| 38 | Spesa Fortuna su un Disastro | non consentita |
| 39 | Spesa Fortuna su un tiro di danno o su un tiro Sanità | non consentita |
| 40 | VdC 35 | contanti 70 $, beni 1.750 $, spesa 10 $, "Medio" |
| 41 | VdC 60 | contanti 300 $, beni 12.000 $, spesa 30 $, "Benestante" |
| 42 | VdC 0 / VdC 99 | 0,50 $ e nessun bene / 50.000 $ e 5.000.000 $ |
| 43 | Gittata ravvicinata, DES 60 | 12 piedi, mostrati come 12 ft o circa 3,6 m |
