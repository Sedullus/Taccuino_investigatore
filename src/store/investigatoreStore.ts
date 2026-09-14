// Store principale (Zustand): investigatore attivo, elenco, modalità,
// pannello di tiro, pila di annullamento (≥20 passi) e persistenza su
// IndexedDB. Ogni azione che modifica lo stato produce anche una voce di
// registro (§12).

import { create } from 'zustand';
import {
  caricaInvestigatore,
  elencaInvestigatori,
  eliminaInvestigatore as eliminaInvestigatoreArchivio,
  leggiIdAttivo,
  salvaInvestigatore,
  scriviIdAttivo,
} from '../persistence/archivio';
import { esportaJSON, importaJSON } from '../persistence/importExport';
import { VERSIONE_SCHEMA_CORRENTE } from '../persistence/schema';
import { puoForzareTiro, puoSpendereFortuna, valutaTiro } from '../rules/checks';
import { combinaDadi, generatoreDefault, tiraD100Con } from '../rules/dice';
import { applicaCura, applicaDanno } from '../rules/health';
import { eFolliaIndefinita, richiedeTiroINT, risolviPerditaSanita, valutaTiroSanita } from '../rules/sanity';
import {
  ABILITA_MULTI_ISTANZA,
  ABILITA_NON_COMUNI,
  NON_SPUNTABILI,
  nomeConSpecializzazione,
} from '../rules/skills1920';
import type { Abilita, Caratteristica, ChiaveOverrideNumerico, Investigatore } from '../rules/types';
import { creaAdeleMarchetti } from '../data/adeleMarchetti';
import { nuovaVoceRegistro } from './registro';
import { creaTiro, type TiroInCorso } from './tiro';

const LIMITE_UNDO = 20;

let promessaInit: Promise<void> | null = null;

function nuovoId(): string {
  return crypto.randomUUID();
}

function conModifica(attivo: Investigatore, mutatore: (bozza: Investigatore) => void): Investigatore {
  const bozza = structuredClone(attivo);
  mutatore(bozza);
  return bozza;
}

function schedaVuota(id: string): Investigatore {
  return {
    id,
    versioneSchema: VERSIONE_SCHEMA_CORRENTE,
    anagrafica: { nome: 'Nuovo investigatore', giocatore: '', professione: '', eta: 0, sesso: '', residenza: '', luogoNascita: '' },
    caratteristiche: { FOR: 0, COS: 0, POT: 0, DES: 0, FAS: 0, TAG: 0, INT: 0, IST: 0 },
    override: {},
    risorse: { pf: 0, pm: 0, san: 0, sanInizioGiornata: 0, fortuna: 0 },
    condizioni: {
      feritaGrave: false,
      privoDiSensi: false,
      morente: false,
      morto: false,
      folliaTemporanea: false,
      folliaIndefinita: false,
      folliaPermanente: false,
    },
    abilita: [],
    armi: [
      {
        id: 'senza-armi',
        nome: 'Senza armi',
        abilitaCollegata: nomeConSpecializzazione('Combattere', 'Rissa'),
        danno: '1D3',
        tipo: 'contundente',
        bdMode: 'completo',
        gittataBase: 'contatto',
        attacchiPerRound: 1,
        caricatore: 0,
        munizioni: 0,
        malfunzionamento: 101,
        inceppata: false,
      },
    ],
    trascorsi: {
      descrizionePersonale: '',
      ideologiaCredo: '',
      personeImportanti: '',
      luoghiImportanti: '',
      oggettiDiValore: '',
      tratti: '',
      feriteECicatrici: '',
      fobieEManie: '',
      tomiArcani: '',
      incontriConEntitaStrane: '',
    },
    equipaggiamento: [],
    denaro: { livelloSpesa: 0, contanti: 0, proprieta: 0 },
    compagni: [],
    note: '',
    registro: [],
    impostazioni: { spesaFortuna: true, dadiFisici: false, unitaDistanza: 'metri' },
  };
}

export interface VoceElenco {
  id: string;
  nome: string;
  nota: string;
}

function voceElencoDi(i: Investigatore): VoceElenco {
  return { id: i.id, nome: i.anagrafica.nome, nota: [i.anagrafica.professione, i.anagrafica.residenza].filter(Boolean).join(' · ') };
}

interface StatoStore {
  elenco: VoceElenco[];
  attivo: Investigatore | null;
  undoStack: Investigatore[];
  modalita: 'gioco' | 'modifica';
  caricato: boolean;
  erroreImportMessaggio: string | null;
  tiro: TiroInCorso | null;

  init: () => Promise<void>;
  selezionaScheda: (id: string) => Promise<void>;
  creaSchedaVuota: () => Promise<void>;
  duplicaScheda: (id: string) => Promise<void>;
  eliminaScheda: (id: string) => Promise<void>;
  esportaSchedaAttiva: () => string | null;
  importaScheda: (testo: string) => Promise<boolean>;
  chiudiErroreImport: () => void;
  setModalita: (m: 'gioco' | 'modifica') => void;

  aggiornaAnagrafica: (patch: Partial<Investigatore['anagrafica']>) => void;
  aggiornaCaratteristica: (car: Caratteristica, valore: number) => void;
  aggiornaOverride: (chiave: ChiaveOverrideNumerico, valore: number | undefined) => void;
  aggiornaOverrideBD: (valore: string | undefined) => void;

  deltaRisorsa: (campo: 'pf' | 'pm' | 'san' | 'fortuna', n: number, max: number) => void;
  applicaDannoInvestigatore: (danno: number) => ReturnType<typeof applicaDanno> | null;
  applicaCuraInvestigatore: (guadagno: number, motivo: string) => void;
  eseguiTiroSanitaInvestigatore: (formato: string, roll: number) => { perdita: number; disastro: boolean; riuscito: boolean; richiedeINT: boolean } | null;
  nuovaGiornata: () => void;
  toggleCondizione: (chiave: keyof Investigatore['condizioni']) => void;

  toggleSpuntaAbilita: (id: string) => void;
  togglePreferitaAbilita: (id: string) => void;
  aggiornaValoreAbilita: (id: string, valore: number) => void;
  aggiungiAbilitaPersonalizzata: (nome: string, base: number) => void;
  aggiungiAbilitaDaCatalogo: (radice: string, specializzazione?: string) => void;
  rimuoviAbilita: (id: string) => void;

  apriTiro: (base: { tipo: TiroInCorso['tipo']; nome: string; valore: number; skillId?: string; armaId?: string; conseguenza?: TiroInCorso['conseguenza'] }) => void;
  impostaDifficoltaTiro: (d: TiroInCorso['difficolta']) => void;
  impostaDadiTiro: (n: number) => void;
  toggleFisicoTiro: () => void;
  tiraVirtuale: () => void;
  applicaDadiFisici: (unita: number, decine: number[]) => void;
  applicaRisultatoManuale: (numero: number) => void;
  forzaTiroAttivo: () => void;
  spendiFortunaTiroAttivo: () => void;
  chiudiTiro: () => void;

  toggleImpostazione: (chiave: 'spesaFortuna' | 'dadiFisici') => void;
  setUnitaDistanza: (u: 'metri' | 'piedi') => void;

  undo: () => void;
}

export const useInvestigatoreStore = create<StatoStore>((set, get) => {
  function aggiornaConUndo(nuovoAttivo: Investigatore, tipo?: string, dettaglio?: string) {
    const s = get();
    if (!s.attivo) return;
    const undoStack = [structuredClone(s.attivo), ...s.undoStack].slice(0, LIMITE_UNDO);
    const conRegistro = tipo
      ? conModifica(nuovoAttivo, (b) => {
          b.registro = [nuovaVoceRegistro(tipo, dettaglio ?? ''), ...b.registro].slice(0, 200);
        })
      : nuovoAttivo;
    set({ attivo: conRegistro, undoStack, elenco: s.elenco.map((v) => (v.id === conRegistro.id ? voceElencoDi(conRegistro) : v)) });
    void salvaInvestigatore(conRegistro);
  }

  function mutaAttivo(mutatore: (bozza: Investigatore) => void, tipo?: string, dettaglio?: string) {
    const s = get();
    if (!s.attivo) return;
    aggiornaConUndo(conModifica(s.attivo, mutatore), tipo, dettaglio);
  }

  function applicaConseguenzeTiro(riuscito: boolean, livello: string, forzato: boolean) {
    const s = get();
    if (!s.tiro) return;
    const dettaglio = `${s.tiro.nome} · ${s.tiro.esito?.roll ?? ''} su ${s.tiro.valore} · ${livello}${forzato ? ' · forzato' : ''}`;
    const skillId = s.tiro.tipo === 'abilita' && riuscito ? s.tiro.skillId : undefined;
    const conseguenza = s.tiro.conseguenza;
    const scattaConseguenza = conseguenza ? conseguenza.alSuccesso === riuscito : false;
    mutaAttivo((b) => {
      if (skillId) {
        const a = b.abilita.find((x) => x.id === skillId);
        if (a && !a.nonSpuntabile) a.spunta = true;
      }
      if (conseguenza && scattaConseguenza) b.condizioni[conseguenza.condizione] = true;
    }, 'Tiro', dettaglio + (conseguenza ? (scattaConseguenza ? ` · conseguenza: ${conseguenza.condizione}` : ' · nessuna conseguenza') : ''));
  }

  function applicaEsitoTiro(roll: number, dettagliDadi: { unita?: number; decine?: number[]; sceltaIndex?: number }) {
    const s = get();
    if (!s.tiro) return;
    const esitoValutato = valutaTiro(s.tiro.valore, roll, s.tiro.difficolta);
    set({
      tiro: {
        ...s.tiro,
        esito: { roll, obiettivo: esitoValutato.obiettivo, livello: esitoValutato.livello, riuscito: esitoValutato.riuscito, ...dettagliDadi },
      },
    });
    applicaConseguenzeTiro(esitoValutato.riuscito, esitoValutato.livello, false);
  }

  return {
    elenco: [],
    attivo: null,
    undoStack: [],
    modalita: 'gioco',
    caricato: false,
    erroreImportMessaggio: null,
    tiro: null,

    async init() {
      // React StrictMode invoca gli effetti due volte in sviluppo: senza
      // questa guardia, due chiamate concorrenti potrebbero controllare
      // l'archivio vuoto prima che la prima abbia salvato Adele, creandone
      // due copie.
      if (get().caricato) return;
      if (promessaInit) {
        await promessaInit;
        return;
      }
      promessaInit = (async () => {
        let salvati = await elencaInvestigatori();
        if (salvati.length === 0) {
          const adele = creaAdeleMarchetti(nuovoId());
          await salvaInvestigatore(adele);
          salvati = [adele];
        }
        const idAttivo = (await leggiIdAttivo()) ?? salvati[0]?.id;
        const attivo = salvati.find((i) => i.id === idAttivo) ?? salvati[0] ?? null;
        set({ elenco: salvati.map(voceElencoDi), attivo, caricato: true });
      })();
      await promessaInit;
    },

    async selezionaScheda(id) {
      const investigatore = await caricaInvestigatore(id);
      if (!investigatore) return;
      await scriviIdAttivo(id);
      set({ attivo: investigatore, undoStack: [], modalita: 'gioco', tiro: null });
    },

    async creaSchedaVuota() {
      const nuova = schedaVuota(nuovoId());
      await salvaInvestigatore(nuova);
      await scriviIdAttivo(nuova.id);
      set((s) => ({ elenco: [...s.elenco, voceElencoDi(nuova)], attivo: nuova, undoStack: [], modalita: 'modifica' }));
    },

    async duplicaScheda(id) {
      const originale = await caricaInvestigatore(id);
      if (!originale) return;
      const copia: Investigatore = { ...structuredClone(originale), id: nuovoId() };
      copia.anagrafica = { ...copia.anagrafica, nome: `${copia.anagrafica.nome} (copia)` };
      await salvaInvestigatore(copia);
      set((s) => ({ elenco: [...s.elenco, voceElencoDi(copia)] }));
    },

    async eliminaScheda(id) {
      await eliminaInvestigatoreArchivio(id);
      set((s) => {
        const elenco = s.elenco.filter((v) => v.id !== id);
        const attivo = s.attivo?.id === id ? null : s.attivo;
        return { elenco, attivo };
      });
    },

    esportaSchedaAttiva() {
      const s = get();
      return s.attivo ? esportaJSON(s.attivo) : null;
    },

    async importaScheda(testo) {
      const risultato = importaJSON(testo);
      if (!risultato.ok) {
        set({ erroreImportMessaggio: risultato.errore });
        return false;
      }
      const importato: Investigatore = { ...risultato.investigatore, id: nuovoId() };
      await salvaInvestigatore(importato);
      await scriviIdAttivo(importato.id);
      set((s) => ({ elenco: [...s.elenco, voceElencoDi(importato)], attivo: importato, undoStack: [], erroreImportMessaggio: null }));
      return true;
    },

    chiudiErroreImport() {
      set({ erroreImportMessaggio: null });
    },

    setModalita(m) {
      set({ modalita: m });
    },

    aggiornaAnagrafica(patch) {
      mutaAttivo((b) => {
        b.anagrafica = { ...b.anagrafica, ...patch };
      });
    },

    aggiornaCaratteristica(car, valore) {
      mutaAttivo((b) => {
        b.caratteristiche[car] = valore;
      });
    },

    aggiornaOverride(chiave, valore) {
      mutaAttivo((b) => {
        if (valore == null || Number.isNaN(valore)) delete b.override[chiave];
        else b.override[chiave] = valore;
      }, 'Override', `${chiave} ${valore == null ? 'rimosso' : `impostato a ${valore}`}`);
    },

    aggiornaOverrideBD(valore) {
      mutaAttivo((b) => {
        if (valore == null || valore === '') delete b.override.bd;
        else b.override.bd = valore;
      }, 'Override', `BD ${valore == null || valore === '' ? 'rimosso' : `impostato a ${valore}`}`);
    },

    deltaRisorsa(campo, n, max) {
      const s = get();
      if (!s.attivo) return;
      const attuale = s.attivo.risorse[campo];
      const nuovo = Math.max(0, Math.min(max, attuale + n));
      mutaAttivo((b) => {
        b.risorse[campo] = nuovo;
      }, campo.toUpperCase(), `${attuale} → ${nuovo}`);
    },

    applicaDannoInvestigatore(danno) {
      const s = get();
      if (!s.attivo) return null;
      const pfMax = calcolaPfMax(s.attivo);
      const esito = applicaDanno({ pf: s.attivo.risorse.pf, pfMax, feritaGrave: s.attivo.condizioni.feritaGrave }, danno);
      mutaAttivo((b) => {
        b.risorse.pf = esito.pf;
        b.condizioni.feritaGrave = esito.feritaGrave;
        b.condizioni.morto = esito.morto || b.condizioni.morto;
        b.condizioni.morente = esito.morente || (b.condizioni.morente && !esito.morto);
        b.condizioni.privoDiSensi = esito.privoDiSensi || b.condizioni.privoDiSensi;
      }, 'Applica danno', `${danno} danno · PF ${s.attivo.risorse.pf} → ${esito.pf}`);
      return esito;
    },

    applicaCuraInvestigatore(guadagno, motivo) {
      const s = get();
      if (!s.attivo) return;
      const pfMax = calcolaPfMax(s.attivo);
      const esito = applicaCura({ pf: s.attivo.risorse.pf, pfMax, feritaGrave: s.attivo.condizioni.feritaGrave }, guadagno);
      mutaAttivo((b) => {
        b.risorse.pf = esito.pf;
        if (esito.feritaGraveRimossa) {
          b.condizioni.feritaGrave = false;
          b.condizioni.morente = false;
        }
      }, 'Cura', `${motivo} · PF ${s.attivo.risorse.pf} → ${esito.pf}`);
    },

    eseguiTiroSanitaInvestigatore(formato, roll) {
      const s = get();
      if (!s.attivo) return null;
      const esito = valutaTiroSanita(s.attivo.risorse.san, roll, formato);
      const { perdita, dettaglio } = risolviPerditaSanita(esito, { full: '0', half: '0' }, generatoreDefault);
      const sanPrima = s.attivo.risorse.san;
      const sanDopo = Math.max(0, sanPrima - perdita);
      const persiOggiDopo = Math.max(0, s.attivo.risorse.sanInizioGiornata - sanDopo);
      const folliaIndefinita = eFolliaIndefinita(persiOggiDopo, s.attivo.risorse.sanInizioGiornata);
      mutaAttivo((b) => {
        b.risorse.san = sanDopo;
        b.condizioni.folliaPermanente = sanDopo <= 0 || b.condizioni.folliaPermanente;
        b.condizioni.folliaIndefinita = folliaIndefinita || b.condizioni.folliaIndefinita;
      }, 'Tiro Sanità', `roll ${roll} su ${sanPrima} · ${esito.riuscito ? 'successo' : 'fallimento'}${esito.disastro ? ' (Disastro)' : ''} · perdita ${perdita} (${dettaglio}) · SAN ${sanPrima} → ${sanDopo}${folliaIndefinita ? ' · Follia Indefinita' : ''}`);
      return { perdita, disastro: esito.disastro, riuscito: esito.riuscito, richiedeINT: richiedeTiroINT(perdita) };
    },

    nuovaGiornata() {
      const s = get();
      if (!s.attivo) return;
      mutaAttivo((b) => {
        b.risorse.sanInizioGiornata = b.risorse.san;
      }, 'Nuova giornata', `SAN di riferimento impostata a ${s.attivo.risorse.san}`);
    },

    toggleCondizione(chiave) {
      mutaAttivo((b) => {
        b.condizioni[chiave] = !b.condizioni[chiave];
      }, 'Condizione', chiave);
    },

    toggleSpuntaAbilita(id) {
      mutaAttivo((b) => {
        const a = b.abilita.find((x) => x.id === id);
        if (a && !a.nonSpuntabile) a.spunta = !a.spunta;
      });
    },

    togglePreferitaAbilita(id) {
      mutaAttivo((b) => {
        const a = b.abilita.find((x) => x.id === id);
        if (a) a.preferita = !a.preferita;
      });
    },

    aggiornaValoreAbilita(id, valore) {
      mutaAttivo((b) => {
        const a = b.abilita.find((x) => x.id === id);
        if (a) a.valore = valore;
      });
    },

    aggiungiAbilitaPersonalizzata(nome, base) {
      mutaAttivo((b) => {
        b.abilita.push({ id: crypto.randomUUID(), nome, radice: nome, base, valore: base, spunta: false, preferita: false, nonSpuntabile: false });
      }, 'Abilità aggiunta', nome);
    },

    aggiungiAbilitaDaCatalogo(radice, specializzazione) {
      const voci = ABILITA_MULTI_ISTANZA[radice] ?? ABILITA_NON_COMUNI.filter((v) => v.nome === radice);
      const voce = specializzazione ? voci.find((v) => v.nome === specializzazione) : voci[0];
      const base = voce?.base ?? 1;
      const nome = nomeConSpecializzazione(radice, specializzazione);
      mutaAttivo((b) => {
        if (b.abilita.some((a) => a.nome === nome)) return;
        b.abilita.push({
          id: crypto.randomUUID(),
          nome,
          radice,
          specializzazione,
          base,
          valore: base,
          spunta: false,
          preferita: false,
          nonSpuntabile: NON_SPUNTABILI.has(radice),
        });
      }, 'Abilità aggiunta', nome);
    },

    rimuoviAbilita(id) {
      mutaAttivo((b) => {
        b.abilita = b.abilita.filter((a) => a.id !== id);
      });
    },

    apriTiro(base) {
      set({ tiro: creaTiro(base) });
    },

    impostaDifficoltaTiro(d) {
      set((s) => (s.tiro ? { tiro: { ...s.tiro, difficolta: d, esito: undefined } } : s));
    },

    impostaDadiTiro(n) {
      set((s) => (s.tiro ? { tiro: { ...s.tiro, dadiNetti: Math.max(-2, Math.min(2, n)) } } : s));
    },

    toggleFisicoTiro() {
      set((s) => (s.tiro ? { tiro: { ...s.tiro, fisico: !s.tiro.fisico } } : s));
    },

    tiraVirtuale() {
      const s = get();
      if (!s.tiro) return;
      const { unita, decine, scelto, valori } = tiraD100Con(generatoreDefault, s.tiro.dadiNetti);
      applicaEsitoTiro(scelto, { unita, decine, sceltaIndex: valori.indexOf(scelto) });
    },

    applicaDadiFisici(unita, decine) {
      const s = get();
      if (!s.tiro) return;
      const { scelto } = combinaDadi(unita, decine, s.tiro.dadiNetti);
      applicaEsitoTiro(scelto, { unita, decine, sceltaIndex: undefined });
    },

    applicaRisultatoManuale(numero) {
      applicaEsitoTiro(numero, {});
    },

    forzaTiroAttivo() {
      const s = get();
      if (!s.tiro || !s.tiro.esito) return;
      const permesso = puoForzareTiro(s.tiro.tipo, s.tiro.esito.riuscito, s.tiro.forzato);
      if (!permesso.consentito) return;
      const { unita, decine, scelto, valori } = tiraD100Con(generatoreDefault, s.tiro.dadiNetti);
      const esitoValutato = valutaTiro(s.tiro.valore, scelto, s.tiro.difficolta);
      set({
        tiro: {
          ...s.tiro,
          forzato: true,
          esito: { roll: scelto, obiettivo: esitoValutato.obiettivo, livello: esitoValutato.livello, riuscito: esitoValutato.riuscito, unita, decine, sceltaIndex: valori.indexOf(scelto) },
        },
      });
      applicaConseguenzeTiro(esitoValutato.riuscito, esitoValutato.livello, true);
    },

    spendiFortunaTiroAttivo() {
      const s = get();
      if (!s.tiro || !s.tiro.esito || !s.attivo) return;
      const esitoValutato = valutaTiro(s.tiro.valore, s.tiro.esito.roll, s.tiro.difficolta);
      const permesso = puoSpendereFortuna(esitoValutato, {
        tipo: s.tiro.tipo,
        livello: s.tiro.esito.livello,
        forzato: s.tiro.forzato,
        spesaFortunaAbilitata: s.attivo.impostazioni.spesaFortuna,
      });
      if (!permesso.consentito || permesso.costo == null) return;
      const costo = permesso.costo;
      const fortunaPrima = s.attivo.risorse.fortuna;
      mutaAttivo((b) => {
        b.risorse.fortuna = Math.max(0, fortunaPrima - costo);
      }, 'Fortuna spesa', `${costo} punti · ${s.tiro!.nome} diventa successo, senza spunta`);
      set((st) => (st.tiro ? { tiro: { ...st.tiro, fortunaSpesa: costo, esito: st.tiro.esito ? { ...st.tiro.esito, riuscito: true } : st.tiro.esito } } : st));
    },

    chiudiTiro() {
      set({ tiro: null });
    },

    toggleImpostazione(chiave) {
      mutaAttivo((b) => {
        b.impostazioni[chiave] = !b.impostazioni[chiave];
      });
    },

    setUnitaDistanza(u) {
      mutaAttivo((b) => {
        b.impostazioni.unitaDistanza = u;
      });
    },

    undo() {
      const s = get();
      const [precedente, ...resto] = s.undoStack;
      if (!precedente || !s.attivo) return;
      const conRegistro = conModifica(precedente, (b) => {
        b.registro = [nuovaVoceRegistro('Annullata l\'ultima azione', `ripristinati PF ${precedente.risorse.pf} · SAN ${precedente.risorse.san} · Fortuna ${precedente.risorse.fortuna}`), ...b.registro].slice(0, 200);
      });
      set({ attivo: conRegistro, undoStack: resto });
      void salvaInvestigatore(conRegistro);
    },
  };
});

function calcolaPfMax(investigatore: Investigatore): number {
  const override = investigatore.override.pfMax;
  if (override != null) return override;
  const { TAG, COS } = investigatore.caratteristiche;
  return Math.floor((TAG + COS) / 10);
}

export type { Abilita };
