// Riassunto AI del racconto di una sessione (§ "Riassunto AI nel PDF"):
// chiama l'API Messages di Anthropic direttamente dal browser, con la
// chiave che l'utente ha salvato nelle Impostazioni. Seconda (e ultima, per
// ora) eccezione alla regola "nessuna chiamata di rete a runtime" del
// progetto, dopo la dettatura — vedi docs/decisioni.md per i limiti di
// sicurezza di tenere una chiave API lato client.

const URL_API = 'https://api.anthropic.com/v1/messages';
const MODELLO = 'claude-haiku-4-5-20251001';
const MAX_TOKEN_RISPOSTA = 900;

export class ErroreRiassuntoAI extends Error {}

export const ETICHETTE_SEZIONI_RIASSUNTO = ['NARRAZIONE', 'INDIZI', 'PERSONAGGI', 'LUOGHI E OGGETTI', 'FILONI APERTI'] as const;

const ISTRUZIONI_SISTEMA = `Aiuti chi gioca a un gioco di ruolo investigativo (ambientazione anni '20, stile Chiamata di Cthulhu) a tenere il diario della propria campagna. Ricevi il racconto scritto da chi gioca per l'ultima sessione e, se disponibili, fino a tre tipi di contesto dalle sessioni precedenti della stessa avventura:
- "Appunti e correzioni dell'investigatore (fonte autorevole)": scritti a mano da chi gioca apposta per correggere o chiarire fatti sull'avventura. Se qualunque altro materiale (racconto, riepilogo, riferimenti trovati automaticamente) sembra in conflitto con questi appunti, fidati sempre degli appunti.
- un riepilogo delle sessioni più recenti, per continuità narrativa;
- "Riferimenti trovati nella cronologia per nomi ricorrenti": estratti raccolti cercando, in tutte le sessioni passate (anche le più vecchie, non solo le recenti), gli stessi nomi propri che compaiono nel racconto di questa sessione. Sono trovati con un'euristica automatica, non da una lettura intelligente: alcuni potrebbero non essere nomi propri rilevanti (parole capitalizzate a caso). Usa il buon senso e ignora quelli che non sembrano un personaggio, un luogo o un oggetto vero.

Scrivi il riassunto in italiano, fedele al testo (non inventare nulla che non sia scritto o deducibile con certezza dal materiale fornito), organizzato esattamente in queste cinque sezioni, in quest'ordine, ciascuna introdotta dalla sua etichetta seguita da due punti:

NARRAZIONE: due o tre frasi che raccontano cosa è successo in questa sessione.
INDIZI: elenco puntato (una riga per voce, che inizia con "- ") degli indizi o delle scoperte chiave di questa sessione. Scrivi "- Nessuno" se non ce ne sono.
PERSONAGGI: elenco puntato dei PNG rilevanti di questa sessione. Per ogni PNG nominato, una riga nel formato "- Nome: ruolo o descrizione, e cosa si sa di loro finora" — se i riferimenti dalla cronologia includono quel nome, usali per arricchire la descrizione con quanto emerso anche in sessioni non recenti, non solo in questa. Scrivi "- Nessuno" se non ce ne sono.
LUOGHI E OGGETTI: elenco puntato di luoghi o oggetti ricorrenti rilevanti (non ogni dettaglio di scena, solo quelli che sembrano importanti per la trama), stesso trattamento dei PNG: nome e cosa si sa finora. Scrivi "- Nessuno" se non ce ne sono.
FILONI APERTI: elenco puntato di piste, domande o obiettivi ancora aperti per le prossime sessioni. Scrivi "- Nessuno" se non ce ne sono.

Il riepilogo delle sessioni recenti e i riferimenti dalla cronologia servono solo a dare contesto: riassumi gli eventi solo di questa sessione, non ripetere quanto già successo prima, a meno che non serva per spiegare chi è un personaggio o cos'è un luogo/oggetto. Non aggiungere altro testo prima, dopo o tra le sezioni.`;

async function chiamaAnthropic(sistema: string, contenuto: string, chiaveApi: string, maxToken: number): Promise<string> {
  const risposta = await fetch(URL_API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': chiaveApi,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODELLO,
      max_tokens: maxToken,
      system: sistema,
      messages: [{ role: 'user', content: contenuto }],
    }),
  });

  if (!risposta.ok) {
    const corpo = await risposta.text().catch(() => '');
    throw new ErroreRiassuntoAI(`Anthropic ha risposto ${risposta.status}${corpo ? `: ${corpo.slice(0, 200)}` : '.'}`);
  }

  const dati = (await risposta.json()) as { content?: { type: string; text?: string }[] };
  const blocco = dati.content?.find((b) => b.type === 'text' && b.text);
  if (!blocco?.text) throw new ErroreRiassuntoAI('La risposta non contiene testo.');
  return blocco.text.trim();
}

export async function generaRiassunto(racconto: string, chiaveApi: string, contestoPrecedente?: string): Promise<string> {
  const contenuto = [
    contestoPrecedente ? `Contesto — sessioni precedenti della stessa avventura:\n\n${contestoPrecedente}` : null,
    `Racconto della sessione da riassumere:\n\n${racconto}`,
  ]
    .filter((parte): parte is string => !!parte)
    .join('\n\n---\n\n');
  return chiamaAnthropic(ISTRUZIONI_SISTEMA, contenuto, chiaveApi, MAX_TOKEN_RISPOSTA);
}

// ── Riassunto finale dell'avventura (§ "Riassunto finale"): una lettura
// d'insieme di tutte le sessioni, non la somma dei riassunti di sessione. ──

const MAX_TOKEN_RIASSUNTO_FINALE = 2500;

export const ETICHETTE_SEZIONI_RIASSUNTO_FINALE = ['TRAMA', 'PERSONAGGI', 'LUOGHI E OGGETTI', 'MISTERI SVELATI', 'QUESTIONI APERTE'] as const;

const ISTRUZIONI_SISTEMA_FINALE = `Aiuti chi gioca a un gioco di ruolo investigativo (ambientazione anni '20, stile Chiamata di Cthulhu) a chiudere il diario di un'avventura. Ricevi il racconto di tutte le sessioni dell'avventura, in ordine cronologico, scritto da chi gioca, e — se presenti — i suoi "Appunti e correzioni (fonte autorevole)": fatti che ha scritto a mano apposta per correggere o chiarire. Se qualunque racconto sembra in conflitto con questi appunti, fidati sempre degli appunti.

Scrivi il riassunto finale dell'intera avventura in italiano, fedele al materiale (non inventare nulla che non sia scritto o deducibile con certezza), come una lettura d'insieme e non come un elenco sessione per sessione. Organizzalo esattamente in queste cinque sezioni, in quest'ordine, ciascuna introdotta dalla sua etichetta seguita da due punti:

TRAMA: il racconto dell'avventura dall'inizio alla fine, in due-quattro paragrafi di prosa: come è cominciata, come si è sviluppata, come si è conclusa (o dove si è interrotta).
PERSONAGGI: elenco puntato (una riga per voce, che inizia con "- ") dei PNG che hanno contato nell'avventura, nel formato "- Nome: chi era, che ruolo ha avuto, come è finita per lui/lei". Scrivi "- Nessuno" se non ce ne sono.
LUOGHI E OGGETTI: elenco puntato di luoghi e oggetti importanti per la trama, con il loro ruolo nell'avventura. Scrivi "- Nessuno" se non ce ne sono.
MISTERI SVELATI: elenco puntato di cosa gli investigatori hanno scoperto o risolto. Scrivi "- Nessuno" se non ce ne sono.
QUESTIONI APERTE: elenco puntato di domande rimaste senza risposta, minacce non sconfitte, fili da riprendere in un'avventura futura. Scrivi "- Nessuno" se non ce ne sono.

Non aggiungere altro testo prima, dopo o tra le sezioni.`;

export async function generaRiassuntoFinale(materiale: string, chiaveApi: string): Promise<string> {
  return chiamaAnthropic(ISTRUZIONI_SISTEMA_FINALE, materiale, chiaveApi, MAX_TOKEN_RIASSUNTO_FINALE);
}

export interface SezioneRiassunto {
  titolo: string;
  corpo: string;
}

/**
 * Divide il riassunto nelle sezioni etichettate dal prompt (di default
 * quelle del riassunto di sessione). Se l'AI non ha seguito il formato
 * richiesto (può succedere), ripiega su un'unica sezione "RIASSUNTO" con
 * tutto il testo: non deve mai sparire nulla, solo perdere la suddivisione.
 */
export function analizzaRiassunto(testo: string, etichette: readonly string[] = ETICHETTE_SEZIONI_RIASSUNTO): SezioneRiassunto[] {
  const sezioni: SezioneRiassunto[] = [];
  let corrente: SezioneRiassunto | null = null;
  for (const riga of testo.split('\n')) {
    const pulita = riga.trim();
    const etichetta = etichette.find((e) => pulita.toUpperCase().startsWith(`${e}:`));
    if (etichetta) {
      if (corrente) sezioni.push(corrente);
      corrente = { titolo: etichetta, corpo: pulita.slice(etichetta.length + 1).trim() };
    } else if (corrente) {
      corrente.corpo += (corrente.corpo ? '\n' : '') + pulita;
    }
  }
  if (corrente) sezioni.push(corrente);
  return sezioni.length > 0 ? sezioni.map((s) => ({ ...s, corpo: s.corpo.trim() })) : [{ titolo: 'RIASSUNTO', corpo: testo.trim() }];
}
