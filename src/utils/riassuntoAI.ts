// Riassunto AI del racconto di una sessione (§ "Riassunto AI nel PDF"):
// chiama l'API Messages di Anthropic direttamente dal browser, con la
// chiave che l'utente ha salvato nelle Impostazioni. Seconda (e ultima, per
// ora) eccezione alla regola "nessuna chiamata di rete a runtime" del
// progetto, dopo la dettatura — vedi docs/decisioni.md per i limiti di
// sicurezza di tenere una chiave API lato client.

const URL_API = 'https://api.anthropic.com/v1/messages';
const MODELLO = 'claude-haiku-4-5-20251001';
const MAX_TOKEN_RISPOSTA = 400;

export class ErroreRiassuntoAI extends Error {}

export async function generaRiassunto(racconto: string, chiaveApi: string): Promise<string> {
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
      messages: [
        {
          role: 'user',
          content:
            'Riassumi in italiano, in modo fedele e conciso (massimo 120 parole), il racconto di questa sessione di un gioco di ruolo investigativo. Non inventare dettagli che non sono nel testo, non aggiungere commenti o titoli: solo il riassunto.\n\n' +
            racconto,
        },
      ],
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
