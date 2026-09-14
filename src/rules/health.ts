// Punti Ferita e Punti Magia (§8, §9).

export interface StatoSalute {
  pf: number;
  pfMax: number;
  feritaGrave: boolean;
}

export interface EsitoDanno {
  pf: number;
  morto: boolean;
  /** true se questo colpo ha causato (o mantenuto) la Ferita Grave. */
  feritaGrave: boolean;
  /** Un tiro COS va richiesto: il fallimento porta a Privo di sensi. */
  richiedeTiroCOS: boolean;
  /** PF a 0 con Ferita Grave: richiede un tiro COS a fine round, il fallimento è la morte. */
  morente: boolean;
  /** PF a 0 senza Ferita Grave: privo di sensi, nessun rischio di morte. */
  privoDiSensi: boolean;
}

/** Applica un singolo colpo di danno (§8). I PF non scendono mai sotto 0. */
export function applicaDanno(stato: StatoSalute, danno: number): EsitoDanno {
  if (danno >= stato.pfMax) {
    return { pf: 0, morto: true, feritaGrave: stato.feritaGrave, richiedeTiroCOS: false, morente: false, privoDiSensi: false };
  }
  const pf = Math.max(0, stato.pf - danno);
  const nuovaFeritaGrave = stato.feritaGrave || danno * 2 >= stato.pfMax;
  const morente = pf === 0 && nuovaFeritaGrave;
  const privoDiSensi = pf === 0 && !nuovaFeritaGrave;
  return {
    pf,
    morto: false,
    feritaGrave: nuovaFeritaGrave,
    richiedeTiroCOS: danno * 2 >= stato.pfMax,
    morente,
    privoDiSensi,
  };
}

export interface EsitoCura {
  pf: number;
  /** true se la Ferita Grave va rimossa (soglia di metà PF max raggiunta, o guarigione Estrema). */
  feritaGraveRimossa: boolean;
}

/** Applica una cura di n PF, rispettando il massimo e la rimozione della Ferita Grave a metà PF (§8). */
export function applicaCura(stato: StatoSalute, guadagno: number): EsitoCura {
  const pf = Math.min(stato.pfMax, stato.pf + guadagno);
  const feritaGraveRimossa = stato.feritaGrave && pf >= Math.ceil(stato.pfMax / 2);
  return { pf, feritaGraveRimossa };
}

export interface EsitoSpesaPM {
  pm: number;
  pf: number;
  pfPerso: number;
}

/** Spesa di Punti Magia: se non bastano, la parte mancante si scala dai PF (§9). */
export function spendiPM(pmAttuali: number, pf: number, costo: number): EsitoSpesaPM {
  if (pmAttuali >= costo) return { pm: pmAttuali - costo, pf, pfPerso: 0 };
  const mancante = costo - pmAttuali;
  return { pm: 0, pf: Math.max(0, pf - mancante), pfPerso: mancante };
}
