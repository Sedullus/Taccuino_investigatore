// Costruzione delle voci di registro (§12): ogni tiro e ogni modifica di
// risorse o stati genera una voce con ora, tipo, dettaglio.

import type { VoceRegistro } from '../rules/types';

let contatore = 0;

export function nuovaVoceRegistro(tipo: string, dettaglio: string): VoceRegistro {
  contatore += 1;
  const ora = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  return { id: `voce-${Date.now()}-${contatore}`, ora, tipo, dettaglio };
}
