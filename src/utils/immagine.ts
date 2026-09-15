// Ridimensionamento del ritratto lato client, prima di salvarlo in IndexedDB
// (§11, Fase 3): evita di appesantire l'archivio con foto a piena risoluzione.

export function ridimensionaImmagine(file: File, latoMassimo = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const lettore = new FileReader();
    lettore.onerror = () => reject(new Error('Lettura del file fallita.'));
    lettore.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Immagine non valida.'));
      img.onload = () => {
        const scala = Math.min(1, latoMassimo / Math.max(img.width, img.height));
        const w = Math.round(img.width * scala);
        const h = Math.round(img.height * scala);
        const tela = document.createElement('canvas');
        tela.width = w;
        tela.height = h;
        const ctx = tela.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas non disponibile.'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(tela.toDataURL('image/jpeg', 0.85));
      };
      img.src = lettore.result as string;
    };
    lettore.readAsDataURL(file);
  });
}
