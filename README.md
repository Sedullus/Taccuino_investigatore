# Taccuino dell'Investigatore

Una scheda investigatore digitale, pensata per giocare al tavolo a un gioco di ruolo investigativo anni '20 con un sistema basato su percentuali. Funziona **offline**, non ha un account, e **tutti i dati restano sul dispositivo** (IndexedDB del browser) — non c'è alcun server, alcuna sincronizzazione, alcuna chiamata di rete a runtime, con un'unica eccezione facoltativa: il pulsante "Detta" nel Taccuino delle avventure usa il riconoscimento vocale del browser, che su Chrome/Edge invia l'audio ai server di Google (mai attivo di default — vedi [`docs/decisioni.md`](docs/decisioni.md)).

Le regole implementate e le scelte di modellazione sono documentate in [`docs/regole-scheda-7e.md`](docs/regole-scheda-7e.md) (fonte di verità) e [`docs/decisioni.md`](docs/decisioni.md) (i punti ambigui e come sono stati risolti). Lo storico delle fasi di sviluppo è in [`CHANGELOG.md`](CHANGELOG.md). Le icone delle armi usano sagome di terze parti con licenza aperta: l'attribuzione è in [`LICENSES.md`](LICENSES.md) e nella schermata Crediti dell'app.

> Nessun logo, marchio o testo dei manuali ufficiali è riprodotto in quest'app: è uno strumento indipendente, scritto da zero.

---

## Indice

- [Avvio in locale](#avvio-in-locale)
- [Installazione su telefono o tablet](#installazione-su-telefono-o-tablet)
- [Backup dei dati](#backup-dei-dati)
- [Pubblicazione gratuita su GitHub Pages](#pubblicazione-gratuita-su-github-pages)
- [Struttura del progetto](#struttura-del-progetto)
- [Comandi disponibili](#comandi-disponibili)

---

## Avvio in locale

Serve [Node.js](https://nodejs.org/) (versione 20 o successiva) installato sul computer.

```bash
npm install
npm run dev
```

Il terminale mostrerà un indirizzo tipo `http://localhost:5173/`: aprilo nel browser. Ogni modifica al codice si riflette subito, senza bisogno di ricaricare a mano.

Per verificare che tutto funzioni prima di affidarti all'app:

```bash
npm test
npm run build
```

Il primo esegue tutti i test automatici del motore di regole (compresi i casi obbligatori del §14 della specifica); il secondo produce la versione pronta per la pubblicazione nella cartella `dist/` e segnala eventuali errori TypeScript.

## Installazione su telefono o tablet

L'app è una **PWA (Progressive Web App)**: una volta aperta nel browser, si può installare come se fosse un'app nativa, con la sua icona in home screen e funzionamento offline.

**Prima di tutto**, apri l'app dall'indirizzo pubblicato (vedi la sezione su GitHub Pages qui sotto) o dal server locale, **almeno una volta con connessione attiva**: solo così il dispositivo scarica e salva tutto il necessario per funzionare offline in seguito.

**Su Android (Chrome):**
1. Apri l'indirizzo dell'app.
2. Tocca il menu (⋮) in alto a destra.
3. Scegli **"Installa app"** o **"Aggiungi a schermata Home"**.

**Su iPhone/iPad (Safari — solo Safari permette l'installazione su iOS):**
1. Apri l'indirizzo dell'app in Safari.
2. Tocca l'icona di condivisione (il quadrato con la freccia verso l'alto).
3. Scegli **"Aggiungi a Home"**.

**Su computer (Chrome, Edge):**
1. Apri l'indirizzo dell'app.
2. Cerca l'icona di installazione nella barra degli indirizzi (di solito un monitor con una freccia), oppure il menu (⋮) → **"Installa Taccuino dell'Investigatore"**.

Una volta installata, l'app si apre a schermo intero come le altre app, e continua a funzionare anche senza connessione: i dati restano salvati sul dispositivo anche a telefono spento o offline.

## Backup dei dati

**I dati vivono solo sul dispositivo**: se cambi telefono, cancelli i dati del browser, o disinstalli l'app, l'investigatore va perso — a meno di aver fatto un backup.

Per fare il backup:
1. Apri **Investigatori** in alto.
2. Apri (o assicurati sia aperta) la scheda che vuoi salvare.
3. Tocca **"Esporta la scheda aperta"**: scarica un file `.json` con tutti i dati dell'investigatore.
4. Conserva quel file da qualche parte al sicuro (email a te stesso, cloud personale, chiavetta USB — dove preferisci).

Per ripristinare (o passare un investigatore a un altro dispositivo):
1. Apri **Investigatori**.
2. Tocca **"Importa file"** (o **"Importa un file"** se non ci sono ancora investigatori salvati).
3. Scegli il file `.json` esportato in precedenza.

L'app avvisa se il file non è leggibile (per esempio, se è di una versione più recente dello schema dati) senza toccare l'investigatore che avevi aperto.

## Pubblicazione gratuita su GitHub Pages

Questi passaggi permettono di pubblicare l'app a un indirizzo pubblico (`https://<tuo-utente>.github.io/<nome-repository>/`), gratis, senza dover gestire un server. Non serve esperienza di sviluppo web: sono comandi da copiare-incollare.

**1. Crea un account GitHub**, se non ce l'hai già, su [github.com](https://github.com).

**2. Crea un nuovo repository** (il "contenitore" del progetto):
- Vai su [github.com/new](https://github.com/new).
- Dai un nome al repository (es. `taccuino-investigatore`). Può restare **pubblico** (serve per usare Pages gratis su un account normale) o privato se hai un account che lo consente.
- Non aggiungere README, licenza o `.gitignore`: il progetto li ha già.
- Crea il repository.

**3. Collega il progetto locale e caricalo**, da un terminale aperto nella cartella del progetto:

```bash
git remote add origin https://github.com/<tuo-utente>/<nome-repository>.git
git branch -M main
git push -u origin main
```

Sostituisci `<tuo-utente>` e `<nome-repository>` con i tuoi. Se richiesto, accedi con le tue credenziali GitHub (o un token, se GitHub lo richiede — segue le istruzioni a schermo).

**4. Attiva GitHub Pages:**
- Nella pagina del repository su GitHub, vai su **Settings → Pages**.
- Alla voce **"Build and deployment" → "Source"**, scegli **"GitHub Actions"**.

Questo progetto include già un flusso automatico (`.github/workflows/deploy-pages.yml`): ogni volta che invii modifiche al branch `main` (`git push`), GitHub Actions esegue i test, compila l'app e la pubblica da sola. Dopo il primo push con Pages attivo, aspetta un paio di minuti e l'app sarà visitabile su `https://<tuo-utente>.github.io/<nome-repository>/` (l'indirizzo esatto è mostrato anche in **Settings → Pages** una volta pronto).

Per pubblicare aggiornamenti futuri, basta fare `git add`, `git commit` e `git push`: la pubblicazione riparte da sola.

## Struttura del progetto

```
src/
  rules/          motore di regole puro (nessuna dipendenza da React), con i test
  persistence/     IndexedDB, schema di validazione, export/import, migrazioni
  store/           stato dell'app (Zustand): investigatore attivo, pannello di tiro, annullamento
  components/      interfaccia, organizzata per vista (stato, abilita, combattimento, ...)
  data/            personaggio di esempio precaricato
  theme/           token di colore/tipografia, tema chiaro e scuro
  hooks/           Wake Lock, tema
  icons/           icone delle armi: catalogo, suggerimento, selettore, trattamento a incisione
docs/
  regole-scheda-7e.md   fonte di verità per le regole
  decisioni.md           punti ambigui della specifica e scelta adottata
  design/                 riferimento visivo del prototipo
scripts/
  generate-icons.mjs         genera le icone della PWA (già eseguito; da rilanciare solo se cambia il disegno)
  estrai-icone-curate.mjs    verifica e ricava i percorsi SVG del catalogo curato (npm run verifica-icone)
  estrai-tutte-le-icone.mjs  estrae il catalogo completo per la ricerca (blocco lazy separato)
  disegna-protagoniste.mjs   le 12 icone armi originali
```

## Comandi disponibili

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Avvia il server di sviluppo con ricaricamento automatico |
| `npm test` | Esegue tutti i test del motore di regole |
| `npm run build` | Controlla i tipi TypeScript e produce la build di produzione in `dist/` |
| `npm run preview` | Serve la build di produzione in locale, per un ultimo controllo (anche offline) |
| `npm run lint` | Controllo di stile del codice |
| `npm run verifica-icone` | Verifica il catalogo delle icone armi contro il pacchetto reale (eseguito anche automaticamente da `npm run build`) |
