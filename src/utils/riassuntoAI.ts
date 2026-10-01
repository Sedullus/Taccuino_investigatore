// Riassunto AI del racconto di una sessione (§ "Riassunto AI nel PDF"):
// chiama l'API Messages di Anthropic direttamente dal browser, con la
// chiave che l'utente ha salvato nelle Impostazioni. Seconda (e ultima, per
// ora) eccezione alla regola "nessuna chiamata di rete a runtime" del
// progetto, dopo la dettatura — vedi docs/decisioni.md per i limiti di
// sicurezza di tenere una chiave API lato client.

const URL_API = 'https://api.anthropic.com/v1/messages';
const MODELLO = 'claude-haiku-4-5-20251001';
const MAX_TOKEN_RISPOSTA = 700;

export class ErroreRiassuntoAI extends Error {}

export const ETICHETTE_SEZIONI_RIASSUNTO = ['NARRAZIONE', 'INDIZI', 'PERSONAGGI', 'FILONI APERTI'] as const;

const ISTRUZIONI_SISTEMA = `Aiuti chi gioca a un gioco di ruolo investigativo (ambientazione anni '20, stile Chiamata di Cthulhu) a tenere il diario della propria campagna. Ricevi il racconto scritto da chi gioca per l'ultima sessione e, se disponibile, il contesto delle sessioni precedenti della stessa avventura.

Scrivi il riassunto in italiano, fedele al testo (non inventare nulla che non sia scritto o deducibile con certezza), organizzato esattamente in queste quattro sezioni, in quest'ordine, ciascuna introdotta dalla sua etichetta seguita da due punti:

NARRAZIONE: due o tre frasi che raccontano cosa è successo in questa sessione.
INDIZI: elenco puntato (una riga per voce, che inizia con "- ") degli indizi o delle scoperte chiave di questa sessione. Scrivi "- Nessuno" se non ce ne sono.
PERSONAGGI: elenco puntato dei PNG incontrati o menzionati in questa sessione. Scrivi "- Nessuno" se non ce ne sono.
FILONI APERTI: elenco puntato di piste, domande o obiettivi ancora aperti per le prossime sessioni. Scrivi "- Nessuno" se non ce ne sono.

Il contesto delle sessioni precedenti serve solo a capire cosa i personaggi sanno già: usalo per continuità, ma riassumi solo quello che succede nella sessione da riassumere, non ripetere gli eventi delle sessioni precedenti. Non aggiungere altro testo prima, dopo o tra le sezioni.`;

export async function generaRiassunto(racconto: string, chiaveApi: string, contestoPrecedente?: string): Promise<string> {
  const contenuto = [
    contestoPrecedente ? `Contesto — sessioni precedenti della stessa avventura:\n\n${contestoPrecedente}` : null,
    `Racconto della sessione da riassumere:\n\n${racconto}`,
  ]
    .filter((parte): parte is string => !!parte)
    .join('\n\n---\n\n');

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
      max_tokens: MAX_TOKEN_RISPOSTA,
      system: ISTRUZIONI_SISTEMA,
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

export interface SezioneRiassunto {
  titolo: string;
  corpo: string;
}

/**
 * Divide il riassunto nelle sezioni etichettate dal prompt (NARRAZIONE,
 * INDIZI, PERSONAGGI, FILONI APERTI). Se l'AI non ha seguito il formato
 * richiesto (può succedere), ripiega su un'unica sezione "RIASSUNTO" con
 * tutto il testo: non deve mai sparire nulla, solo perdere la suddivisione.
 */
export function analizzaRiassunto(testo: string): SezioneRiassunto[] {
  const sezioni: SezioneRiassunto[] = [];
  let corrente: SezioneRiassunto | null = null;
  for (const riga of testo.split('\n')) {
    const pulita = riga.trim();
    const etichetta = ETICHETTE_SEZIONI_RIASSUNTO.find((e) => pulita.toUpperCase().startsWith(`${e}:`));
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
