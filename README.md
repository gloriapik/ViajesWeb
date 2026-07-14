# Planeador de viajes

Proyecto Vite + React listo para desplegar en Vercel.

## Correr en local

```bash
npm install
npm run dev
```

## Desplegar en Vercel

1. Sube esta carpeta a un repositorio de GitHub (o conecta la carpeta directo si usas la CLI de Vercel).
2. En Vercel: "Add New Project" → importa el repo.
3. Vercel detecta Vite automáticamente. No hace falta configurar nada manual:
   - Build command: `vite build` (o `npm run build`)
   - Output directory: `dist`
4. Deploy.

No se necesita ninguna variable de entorno ni API key — el catálogo de destinos está embebido en el código (ver nota al inicio de `src/App.jsx`), sin llamadas a servicios externos en tiempo de ejecución.

## Qué cambió respecto a la versión de artifact de Claude

- `window.storage` (API exclusiva del entorno de artifacts de Claude) se reemplazó por `localStorage` en `src/lib/storage.js`, con el mismo contrato (`set`/`list`/`get`). El historial de viajes ahora se guarda en el navegador del usuario, igual que antes en cuanto a alcance (sin sesión entre dispositivos — ver spec, sección 10).
- Las fuentes (Fraunces, Inter, Space Mono) se cargan como `<link>` en `index.html` en vez de inyectarse en tiempo de ejecución.
- Tailwind se carga vía CDN (`cdn.tailwindcss.com`) en `index.html`, no como build compilado. Es válido para desplegar, pero para producción a largo plazo conviene migrar a una instalación compilada de Tailwind (PostCSS), que es más liviana y no muestra el aviso de "no usar en producción" de la CDN.

## Pendiente de verificación real (no se pudo probar en el entorno donde se generó este proyecto)

- Flujo completo en navegador real: modal, wizard, teclado, lectores de pantalla.
- Que las imágenes de Wikimedia Commons carguen correctamente.
- Build real (`npm run build`) — no se ejecutó `npm install` porque el entorno de generación no tiene acceso al registro de npm.

Ver `docs/verification/2026-07-13-planeador-viajes.md` en la carpeta `Outputs/` del proyecto para el detalle de qué sí se verificó y cómo.
