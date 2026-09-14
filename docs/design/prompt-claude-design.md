# Brief per Claude Design — "Taccuino dell'Investigatore"

## Contesto
Voglio un prototipo interattivo di una **scheda investigatore digitale** per il gioco di ruolo *Il Richiamo di Cthulhu, 7a Edizione* (edizione italiana Raven). Serve a giocare al tavolo, con un investigatore già creato, nell'ambientazione degli anni '20.

In allegato c'è `regole-scheda-7e.md`: è la fonte di verità per terminologia, calcoli e stati. Leggilo prima di progettare. Tutte le etichette devono usare i termini di quel documento.

Il prototipo verrà poi passato a Claude Code con l'handoff. Qui conta **la qualità dell'esperienza e dell'aspetto**. La logica deve essere credibile e navigabile, ma il motore di regole completo verrà implementato dopo.

## Chi la usa e dove
- I giocatori sono intorno a un tavolo, per sessioni di 3–4 ore, spesso con **luce bassa** per atmosfera.
- Si usa su **qualsiasi dispositivo**: telefono in mano, tablet appoggiato, laptop. Il layout deve essere completamente responsive.
- L'attenzione deve restare sulla storia: la scheda non deve mai diventare il centro della scena.

## Principi di esperienza
1. **Le azioni frequenti richiedono al massimo due tocchi.** Sono: tirare un'abilità, aggiornare PF/SAN/Fortuna/PM, consultare un'arma, scrivere un indizio.
2. **Modalità Gioco e Modalità Modifica sono separate.** In Gioco i valori della scheda sono bloccati, così non si cambiano per sbaglio; si aggiornano solo le risorse e gli stati.
3. **Normale, Metà e Quinto sono sempre visibili** accanto a ogni caratteristica e abilità, perché sono la base di ogni tiro.
4. **Gli stati critici sono impossibili da ignorare**, ma senza effetti invadenti: Ferita Grave, Morente, Privo di sensi, Follia Temporanea, Indefinita e Permanente.
5. **Ogni azione si può annullare.** Le azioni distruttive chiedono conferma solo quando non sono annullabili.
6. Le aree toccabili misurano almeno 44 px, i numeri usano cifre tabellari e il contrasto rispetta almeno WCAG AA in entrambi i temi.

## Schermate e stati da progettare

**A. Stato** (vista principale)
- Intestazione compatta: nome, professione, età e ritratto.
- Quattro tracker con +/−: **PF** (pulsante "Applica danno"), **SAN** (pulsante "Tiro Sanità" e SAN massima visibile), **Fortuna**, **PM**.
- Badge delle condizioni attive.
- Griglia delle 8 caratteristiche con Normale, Metà e Quinto, tirabili con un tocco.
- Striscia di combattimento: BD, Struttura, Schivare, MOV.

**B. Abilità**
- Ricerca istantanea, filtro "solo abilità allenate" (valore sopra la base) e preferite fissate in cima.
- Ogni riga mostra nome, specializzazione, Normale/Metà/Quinto e la spunta esperienza. Miti di Cthulhu e Valore di Credito non hanno la spunta.
- Toccando una riga si apre il **Pannello di tiro**.

**C. Pannello di tiro** (foglio dal basso su mobile, pannello laterale su tablet e desktop)
- Controlli: difficoltà (Normale, Arduo, Estremo), selettore dadi bonus/penalità da −2 a +2, scelta tra dadi virtuali e inserimento dei dadi fisici.
- Risultato: tutte le decine tirate, con quella scelta evidenziata, poi l'unità, il numero finale e il **livello ottenuto**.
- Azioni successive: "Forza il tiro" (con un avviso sulle conseguenze), "Spendi Fortuna" (mostra il costo), "Chiudi".
- Progetta tutte le varianti di esito: Critico, Estremo, Arduo, Normale, Fallimento, Disastro, tiro forzato fallito, azione non consentita (per esempio forzare un tiro di combattimento).

**D. Combattimento**
- Una scheda per arma: abilità collegata, danno, gittata, attacchi per round, munizioni come indicatori consumabili, stato "inceppata".
- Pulsanti "Attacca" e "Tira danno" (con la variante Danno estremo).
- Interruttore "Arma da fuoco pronta" (DES +50 per l'ordine di turno).
- Promemoria compatti: differenza tra contrattacco e schivata, svantaggio numerico, calcolo manovra con la Struttura dell'avversario.

**E. Tiro Sanità**
- Campo per la perdita in formato `0/1D6`, esito del tiro, perdita applicata.
- Se la perdita è di 5 o più punti, richiesta del tiro INT.
- Indicatore della perdita accumulata nella giornata, con pulsante "Nuova giornata".

**F. Applica danno**
- Campo numerico ed esito immediato (nessun effetto, Ferita Grave con richiesta del tiro COS, Morente, Morto), con annullamento.

**G. Trascorsi, Equipaggiamento, Denaro, Compagni, Note e indizi**
- Sezioni di testo leggibili in Gioco e modificabili in Modifica.

**H. Registro di sessione** (pannello a scomparsa)
- Cronologia di tiri e modifiche, con "Annulla ultima azione".

**I. Fine scenario — Fase di sviluppo**
- Procedura guidata: abilità spuntate, tiro, aumento, eventuale guadagno di SAN, riepilogo.

**J. Investigatori**
- Elenco dei personaggi salvati, creazione di una scheda vuota, importazione ed esportazione di file.

**K. Modalità Modifica**
- Come appare la scheda quando è sbloccata.
- Indicatore quando un valore derivato è sovrascritto a mano.

**L. Stati vuoti ed errori**
- Primo avvio senza investigatori, file di importazione non valido.

## Layout responsive
- **Telefono (fino a 600 px):** barra di navigazione in basso con Stato, Abilità, Combattimento, Trascorsi, Registro. I tracker di PF e SAN restano sempre raggiungibili.
- **Tablet (600–1100 px):** due colonne, con Stato fisso a sinistra e contenuto a schede a destra.
- **Desktop (oltre 1100 px):** tre colonne. A sinistra caratteristiche e tracker, al centro le abilità, a destra combattimento e trascorsi. Il pannello di tiro si apre di lato senza coprire la scheda.

## Direzione visiva
**Soggetto:** gli strumenti di lavoro di un investigatore del New England negli anni '20. Schedari e cartellini d'archivio, telegrammi, ricevute, inchiostro, battitura a macchina, la luce di una lampada da scrivania.

Da questi materiali voglio che nasca l'identità. Non voglio un tema "horror" generico.

**Requisiti:**
- Un **tema scuro** principale, pensato per la luce bassa, e un tema chiaro.
- Leggibilità a distanza di braccio: i numeri devono essere la cosa più leggibile dello schermo.
- Un solo elemento davvero memorabile, per esempio il modo in cui la Sanità si "consuma". Tutto il resto deve restare sobrio.
- Animazioni solo in risposta alle azioni: esito del tiro, danno applicato, spunta. Va rispettata l'opzione per la riduzione del movimento.

**Da evitare:**
- sfondo crema con titoli serif e accento terracotta;
- impaginazione a colonne da quotidiano;
- schede tutte uguali con angoli arrotondati e ombra grigia;
- etichette in maiuscolo spaziato ovunque;
- tentacoli, sangue e splatter decorativi.

**Processo:** proponi **due direzioni visive distinte**. Per ciascuna indica palette (4–6 colori con esadecimale), caratteri tipografici, concetto di layout e principi. Aspetta la mia scelta prima di sviluppare l'intero prototipo.

## Vincoli di proprietà intellettuale
- Non usare loghi o marchi Chaosium, "Call of Cthulhu", "Il Richiamo di Cthulhu" o Raven.
- Non replicare l'impaginazione o la grafica della scheda ufficiale.
- Non copiare i testi descrittivi dei manuali.
- Il nome dell'app è provvisorio: **Taccuino dell'Investigatore**.

## Dati di esempio (personaggio originale da usare in tutto il prototipo)

**Adele Marchetti** — Giornalista, 31 anni, donna. Residenza: Arkham, Massachusetts. Nata a Boston. Giocatrice: Giulia.

**Caratteristiche** (Normale / Metà / Quinto)

| | | | |
|---|---|---|---|
| FOR 50 / 25 / 10 | COS 60 / 30 / 12 | TAG 55 / 27 / 11 | DES 65 / 32 / 13 |
| FAS 70 / 35 / 14 | INT 75 / 37 / 15 | POT 60 / 30 / 12 | IST 80 / 40 / 16 |

**Risorse:** PF 8 su 11 · PM 12 su 12 · SAN 54 (massima 99, inizio giornata 60) · Fortuna 48.
**Combattimento:** BD nessuno · Struttura 0 · MOV 8 · Schivare 42 / 21 / 8.

**Abilità allenate:**
- Lingua Madre (Inglese) 80
- Biblioteconomia 60
- Persuadere 60
- Individuare 55 (spuntata)
- Psicologia 50
- Arti e Mestieri (Fotografia) 45
- Storia 40
- Furtività 40
- Ascoltare 40
- Armi da Fuoco (Pistola) 35
- Lingua (Italiano) 31
- Valore di Credito 30

Tutte le altre abilità sono al valore base.

**Armi:**
- Revolver .38 — Pistola 35, danno 1D10, trafigge, gittata 15 m, 1 attacco (fino a 3), caricatore 6, munizioni 4, malfunzionamento 100.
- Senza armi — Rissa 25, danno 1D3+BD, contundente.

**Trascorsi:**
- Ideologia/Credo: "Ogni fatto si può documentare".
- Persone Importanti: il fratello Tommaso, tipografo al porto.
- Luoghi Importanti: la redazione del giornale, di notte.
- Oggetti di Valore: la macchina fotografica regalata dal padre.
- Tratti: testarda, prende appunti su tutto.

**Equipaggiamento:** taccuino, matite, macchina fotografica, torcia elettrica, 12 colpi di scorta.
**Denaro:** Livello di spesa 10 $ · Contanti 60 $ · Proprietà 1.500 $.
**Compagni:** Dr. Elias Crane (giocatore: Marco).

## Consegna
- Un prototipo navigabile con tutte le schermate e gli stati elencati, sui tre formati.
- I dadi virtuali devono funzionare almeno a livello dimostrativo.
- Alla fine prepara l'**handoff a Claude Code**.
