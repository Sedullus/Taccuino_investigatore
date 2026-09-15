// Schema zod dell'Investigatore (§13), usato per validare export/import JSON
// e i dati letti da IndexedDB. Tiene traccia di `versioneSchema` per le migrazioni.

import { z } from 'zod';
import { CARATTERISTICHE } from '../rules/types';

export const VERSIONE_SCHEMA_CORRENTE = 3;

const caratteristicheSchema = z.object(
  Object.fromEntries(CARATTERISTICHE.map((c) => [c, z.number()])) as Record<(typeof CARATTERISTICHE)[number], z.ZodNumber>,
);

const overrideSchema = z
  .object({
    pfMax: z.number().optional(),
    pmMax: z.number().optional(),
    sanMax: z.number().optional(),
    mov: z.number().optional(),
    bd: z.string().optional(),
    struttura: z.number().optional(),
    schivare: z.number().optional(),
  })
  .partial();

const abilitaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  radice: z.string(),
  specializzazione: z.string().optional(),
  base: z.number(),
  valore: z.number(),
  spunta: z.boolean(),
  preferita: z.boolean(),
  nonSpuntabile: z.boolean(),
});

const iconaArmaSchema = z.object({
  id: z.string(),
  sorgente: z.enum(['manuale', 'game-icons']),
  bloccata: z.boolean(),
  corpo: z.object({ viewBox: z.string(), percorsi: z.array(z.string()) }).optional(),
});

const armaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  abilitaCollegata: z.string(),
  danno: z.string(),
  tipo: z.enum(['contundente', 'trafigge']),
  bdMode: z.enum(['completo', 'metà', 'nessuno']),
  gittataBase: z.string(),
  attacchiPerRound: z.number(),
  caricatore: z.number(),
  munizioni: z.number(),
  malfunzionamento: z.number(),
  inceppata: z.boolean(),
  icona: iconaArmaSchema.optional(),
});

const condizioniSchema = z.object({
  feritaGrave: z.boolean(),
  privoDiSensi: z.boolean(),
  morente: z.boolean(),
  morto: z.boolean(),
  folliaTemporanea: z.boolean(),
  folliaIndefinita: z.boolean(),
  folliaPermanente: z.boolean(),
});

const anagraficaSchema = z.object({
  nome: z.string(),
  giocatore: z.string(),
  professione: z.string(),
  eta: z.number(),
  sesso: z.string(),
  residenza: z.string(),
  luogoNascita: z.string(),
  ritratto: z.string().optional(),
});

const risorseSchema = z.object({
  pf: z.number(),
  pm: z.number(),
  san: z.number(),
  sanInizioGiornata: z.number(),
  fortuna: z.number(),
});

const compagnoSchema = z.object({ personaggio: z.string(), giocatore: z.string() });

const trascorsiSchema = z.object({
  descrizionePersonale: z.string(),
  ideologiaCredo: z.string(),
  personeImportanti: z.string(),
  luoghiImportanti: z.string(),
  oggettiDiValore: z.string(),
  tratti: z.string(),
  feriteECicatrici: z.string(),
  fobieEManie: z.string(),
  tomiArcani: z.string(),
  incontriConEntitaStrane: z.string(),
});

const denaroSchema = z.object({
  livelloSpesa: z.number(),
  contanti: z.number(),
  proprieta: z.number(),
});

const voceRegistroSchema = z.object({
  id: z.string(),
  ora: z.string(),
  tipo: z.string(),
  dettaglio: z.string(),
  prima: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).optional(),
  dopo: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).optional(),
});

const impostazioniSchema = z.object({
  spesaFortuna: z.boolean(),
  dadiFisici: z.boolean(),
  unitaDistanza: z.enum(['metri', 'piedi']),
});

export const investigatoreSchema = z.object({
  id: z.string(),
  versioneSchema: z.number(),
  anagrafica: anagraficaSchema,
  caratteristiche: caratteristicheSchema,
  override: overrideSchema,
  risorse: risorseSchema,
  condizioni: condizioniSchema,
  abilita: z.array(abilitaSchema),
  armi: z.array(armaSchema),
  trascorsi: trascorsiSchema,
  equipaggiamento: z.array(z.string()),
  denaro: denaroSchema,
  compagni: z.array(compagnoSchema),
  note: z.string(),
  noteManoscritte: z.string().optional(),
  registro: z.array(voceRegistroSchema),
  impostazioni: impostazioniSchema,
});

export type InvestigatoreValidato = z.infer<typeof investigatoreSchema>;
