// Genera le icone PWA (public/icons/) direttamente come PNG, senza dipendenze
// di disegno esterne: un piccolo encoder PNG scritto a mano (zlib è built-in
// in Node) più poche primitive di disegno rettangolare/lineare.
// Esegui una volta con: node scripts/generate-icons.mjs — non fa parte della build.

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const COLORI = {
  sfondo: [0x15, 0x18, 0x1b, 255],
  bordo: [0x3a, 0x41, 0x48, 255],
  accento: [0xc8, 0xa4, 0x65, 255],
  testo: [0xec, 0xe7, 0xdc, 255],
};

function creaTela(size) {
  const px = new Uint8ClampedArray(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    px[i * 4] = COLORI.sfondo[0];
    px[i * 4 + 1] = COLORI.sfondo[1];
    px[i * 4 + 2] = COLORI.sfondo[2];
    px[i * 4 + 3] = 255;
  }
  return { px, size };
}

function setPixel(tela, x, y, colore) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= tela.size || y >= tela.size) return;
  const i = (y * tela.size + x) * 4;
  tela.px[i] = colore[0];
  tela.px[i + 1] = colore[1];
  tela.px[i + 2] = colore[2];
  tela.px[i + 3] = colore[3];
}

function fillRect(tela, x, y, w, h, colore) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) setPixel(tela, xx, yy, colore);
}

function strokeRect(tela, x, y, w, h, spessore, colore) {
  fillRect(tela, x, y, w, spessore, colore);
  fillRect(tela, x, y + h - spessore, w, spessore, colore);
  fillRect(tela, x, y, spessore, h, colore);
  fillRect(tela, x + w - spessore, y, spessore, h, colore);
}

function thickLine(tela, x0, y0, x1, y1, spessore, colore) {
  const dx = x1 - x0, dy = y1 - y0;
  const passi = Math.max(Math.abs(dx), Math.abs(dy)) * 2;
  for (let i = 0; i <= passi; i++) {
    const t = i / passi;
    const cx = x0 + dx * t, cy = y0 + dy * t;
    fillRect(tela, cx - spessore / 2, cy - spessore / 2, spessore, spessore, colore);
  }
}

function disegnaIcona(size, conMargine) {
  const tela = creaTela(size);
  const m = conMargine ? size * 0.2 : size * 0.14;
  const cardW = size - m * 2;
  const cardH = cardW * 1.28;
  const cardX = m;
  const cardY = (size - cardH) / 2;
  const spessoreBordo = Math.max(2, size * 0.012);

  strokeRect(tela, cardX, cardY, cardW, cardH, spessoreBordo, COLORI.bordo);

  const tabW = cardW * 0.32;
  const tabH = cardH * 0.06;
  fillRect(tela, cardX + cardW * 0.12, cardY - tabH * 0.5, tabW, tabH, COLORI.accento);

  const spessoreLinea = Math.max(2, size * 0.014);
  const lineXs = cardX + cardW * 0.16;
  const lineXe = cardX + cardW * 0.84;
  const lineYs = cardY + cardH * 0.32;
  const gap = cardH * 0.13;
  for (let i = 0; i < 4; i++) {
    const y = lineYs + gap * i;
    const shrink = i === 3 ? 0.55 : 1;
    thickLine(tela, lineXs, y, lineXs + (lineXe - lineXs) * shrink, y, spessoreLinea, COLORI.testo);
  }

  const spessoreFirma = Math.max(2, size * 0.016);
  thickLine(tela, cardX + cardW * 0.18, cardY + cardH * 0.85, cardX + cardW * 0.5, cardY + cardH * 0.78, spessoreFirma, COLORI.accento);
  thickLine(tela, cardX + cardW * 0.5, cardY + cardH * 0.78, cardX + cardW * 0.82, cardY + cardH * 0.88, spessoreFirma, COLORI.accento);

  return tela;
}

// ── Encoder PNG minimale (8 bit, RGBA, nessuna interlaccia) ────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(tipo, dati) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(dati.length, 0);
  const tipoBuf = Buffer.from(tipo, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([tipoBuf, dati])), 0);
  return Buffer.concat([len, tipoBuf, dati, crcBuf]);
}

function scriviPNG(percorso, tela) {
  const { size, px } = tela;
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(px.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = deflateSync(raw);
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(percorso, png);
  console.log('scritto', percorso.pathname ?? percorso);
}

mkdirSync(new URL('../public/icons/', import.meta.url), { recursive: true });
scriviPNG(new URL('../public/icons/icon-192.png', import.meta.url), disegnaIcona(192, false));
scriviPNG(new URL('../public/icons/icon-512.png', import.meta.url), disegnaIcona(512, false));
scriviPNG(new URL('../public/icons/icon-maskable-512.png', import.meta.url), disegnaIcona(512, true));
