// Migrazioni tra versioni dello schema.

import { VERSIONE_SCHEMA_CORRENTE } from './schema';

type PassoMigrazione = (dati: Record<string, unknown>) => Record<string, unknown>;

/**
 * 1 → 2: aggiunta dell'icona dell'arma (campo `icona`, facoltativo). Le
 * armi salvate con lo schema 1 non hanno mai avuto questo campo: restano
 * valide così come sono (il campo è opzionale), quindi non c'è nessun
 * valore da trasformare. Il passo è comunque registrato esplicitamente,
 * seguendo la convenzione di un passo per ogni incremento di versione — la
 * scheda ricalcola il suggerimento al volo ovunque un'arma non abbia
 * un'icona salvata, quindi non serve scriverla qui dentro i dati.
 */
/**
 * 2 → 3: aggiunta del disegno a mano libera delle Note e indizi (campo
 * `noteManoscritte`, facoltativo, come `icona` in 1 → 2). Nessun dato da
 * trasformare: le schede più vecchie semplicemente non hanno un disegno.
 */
/**
 * 3 → 4: aggiunta del Taccuino delle avventure (campo `avventure`,
 * facoltativo — array di Avventura, ciascuna con le proprie Sessioni e le
 * relative immagini). Stessa storia di `icona` e `noteManoscritte`: nessun
 * dato da trasformare, le schede più vecchie semplicemente non hanno ancora
 * nessuna avventura registrata.
 */
const MIGRAZIONI: Record<number, PassoMigrazione> = {
  1: (dati) => dati,
  2: (dati) => dati,
  3: (dati) => dati,
};

export function applicaMigrazioni(dati: Record<string, unknown>, versioneIniziale: number): Record<string, unknown> {
  let corrente = dati;
  let v = versioneIniziale;
  while (v < VERSIONE_SCHEMA_CORRENTE) {
    const passo = MIGRAZIONI[v];
    if (!passo) break;
    corrente = passo(corrente);
    v += 1;
  }
  return corrente;
}
