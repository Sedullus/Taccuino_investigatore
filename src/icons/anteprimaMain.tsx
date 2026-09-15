// Pagina di anteprima delle icone armi (Livello 1: trattamento automatico su
// game-icons.net) — solo per collaudo visivo durante lo sviluppo, non fa
// parte della build pubblicata (non è collegata a vite.config.ts).
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../theme/tokens.css';
import { AnteprimaIcone } from './AnteprimaIcone';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnteprimaIcone />
  </StrictMode>,
);
