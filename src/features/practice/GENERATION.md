# Practice — generación de frases (estado actual + cómo subir de nivel)

> Documento de referencia para la generación de frases de práctica. Decidido el
> **2026-06-28**. Léelo antes de tocar `content/` o el handler de
> `/api/practice/:word`.

## Por qué existe

El overlay de Practice (`PracticeOverlay`) muestra ~8–10 frases de ejemplo con la
palabra que el usuario guardó. Antes, solo **14 palabras** tenían frases
precomputadas (`src/content/practice/*.json`), así que cualquier palabra que el
usuario guardaba desde un cuento caía a un estado vacío **"coming soon"**.

## Estado actual: Gemini Flash + cascada de fallback

Hoy **toda** palabra recibe frases — nunca aparece "coming soon".

```
GET /api/practice/:word?t=<gloss>
        │
        ▼
resolvePracticeSet(word)            ── 14 muestras autoradas (src/content/practice/*.json) → instantáneo, gratis
        │  (miss)
        ▼
generatePracticeSet(word, t)        ── Gemini Flash (free tier) genera 6 frases en/es/fr/pt A2  [requiere GEMINI_API_KEY]
        │  (sin key / error / timeout)
        ▼
templatePracticeSet(word, t)        ── 8 plantillas offline (content/templates.ts) → siempre responde
```

- **Ruta real:** `src/app/api/practice/[word]/route.ts` (Node, dinámica). El mock
  MSW del navegador sirve las precomputadas y hace `passthrough()` en un miss
  hacia esta ruta (en tests se queda determinista con plantillas, sin red).
- **Gemini:** `server/generateWithGemini.ts` — REST `fetch` a
  `gemini-2.5-flash` (configurable con `GEMINI_MODEL`), JSON estricto, validación
  de forma, **reintentos** en errores transitorios (503/429/404 del free tier),
  timeout 15s. Devuelve `null` ante cualquier problema → cascada al fallback.
  La **key vive solo en el servidor** (`GEMINI_API_KEY` en `.env.local`), nunca
  en el navegador ni en git.
- **Caché en memoria** por `lemma:nonce` en la ruta: cada palabra se genera una
  vez (las plantillas NO se cachean, así un fallo transitorio reintenta Gemini
  la próxima vez). `nonce>0` ("New sentences") = generación fresca (con
  temperature) o barajado en las precomputadas.

- **`content/templates.ts`** → `templatePracticeSet(word, translation?)`: 8 frames
  autorados en los 4 idiomas con un hueco `{w}`. La palabra inglesa va en `en`;
  el **gloss en el idioma activo** (el `translation` que el overlay ya muestra en
  el header, primera opción antes de la coma) rellena las líneas de traducción.
- El gloss viaja por el request como `?t=`:
  `PracticeOverlay` → `usePractice(word, nonce, open, translation)` →
  `getPracticeSentences(word, nonce, translation)` → `?t=`. **No** va en el query
  key (el gloss es estable por palabra).
- `nonce > 0` baraja ("New sentences"), igual que con las muestras precomputadas.

**Limitación aceptada:** los frames asumen sustantivo masculino singular, así que
algún artículo/género saldrá un poco off ("el/la", "un/una"). Es el trade-off de
algo gratis y offline. Calidad "básica", a propósito.

## ¿Y un LLM gratis? (opciones sin pagar por token)

Claude **no** tiene tier gratis programático (aunque Haiku es ~gratis a bajo
volumen — ver tabla abajo). Pero hay alternativas realmente gratis:

| Opción | ¿Key? | ¿Servidor? | Calidad | Notas |
|---|---|---|---|---|
| **Plantillas (lo de hoy)** | No | No | Básica | $0, offline, ya funciona |
| **Chrome on-device AI** (Prompt + Translator API, Gemini Nano) | No | No | Media | Gratis, offline, **solo Chrome** (138+) con HW capaz; degrada en otros navegadores |
| **WebLLM / Transformers.js** (modelo open en el navegador, WebGPU) | No | No | Media | Gratis pero descarga pesada (cientos de MB–GB) y lento en móvil |
| **Google Gemini Flash** (free tier) | Sí (gratis, AI Studio) | Ruta server | Alta | Cuota gratis generosa; **no es Anthropic** (integración distinta) |
| **Groq** (Llama, free tier) | Sí (gratis) | Ruta server | Alta | Rápido; **no es Anthropic** |
| **Claude Haiku** | Sí (de pago) | Ruta server | Alta | ~0,3¢/palabra; no gratis pero centavos |

**Combo gratis recomendado sin key:** mantener las plantillas para el inglés y
usar la **Translator API on-device de Chrome** (gratis, offline) para traducir
las líneas `es`/`fr`/`pt` cuando el navegador la soporte — con fallback al gloss
actual donde no esté. Cero costo, mejor traducción, solo se activa donde existe.

**Combo gratis con mejor calidad:** **Gemini Flash** (free tier) detrás de la
ruta real `src/app/api/practice/[word]/route.ts` — misma arquitectura que el
camino Claude de abajo, cambiando el SDK por `@google/generative-ai`. No es
código Claude; sería una integración aparte.

## Cómo subir de nivel: generación real con un LLM (Claude)

El seam ya está listo: **reemplaza la rama de fallback** y nada más cambia (ni el
overlay, ni el tipo `PracticeResponse`, ni los demás handlers).

### El cambio mínimo

Crear una **ruta real** `src/app/api/practice/[word]/route.ts` que:

1. Intente `resolvePracticeSet(word)` primero (las 14 muestras = gratis e instantáneo).
2. En miss, llame a Claude para generar 5–8 frases `{ en, es, fr, pt }` a nivel CEFR
   A2 con la palabra (structured outputs / `output_config.format`).
3. Cachee por palabra (un `Map` en memoria, o KV/DB en serio) para no regenerar.
4. Si falla o no hay API key, caiga a `templatePracticeSet` (degradado elegante).

Y hacer que el handler MSW del navegador haga **`passthrough()`** en el miss (en
test, mantener el comportamiento determinista actual), para que en dev/prod la
petición llegue a la ruta real. (MSW es el "backend" de esta app hoy; corre en el
navegador en dev y prod.)

### Costo (precios actuales)

Cada generación ≈ 5 frases × 4 idiomas ≈ **~400 tokens entrada + ~500 salida**.

| Modelo | ID | Precio | Por palabra única | 100 palabras |
|---|---|---|---|---|
| **Haiku 4.5** (recomendado) | `claude-haiku-4-5` | $1 / $5 por 1M | **~$0.003** (0,3¢) | ~$0.30 |
| Opus 4.8 | `claude-opus-4-8` | $5 / $25 por 1M | ~$0.015 (1,5¢) | ~$1.50 |

Controles de costo ya inherentes al diseño:
- Las 14 precomputadas → $0.
- Caché por palabra: cada palabra única se genera **una sola vez**.
- Solo cuestan las palabras nuevas; "New sentences" (nonce) = otra llamada.

**Recomendación:** `claude-haiku-4-5` — frases A2 simples no necesitan más, y es
~5× más barato y más rápido. (Nota: la skill de Claude API pide por defecto
`claude-opus-4-8`; usar Haiku es una decisión explícita justificada por el
volumen/latencia de este caso.)

### Requisitos

- `ANTHROPIC_API_KEY` en el entorno de deploy (se factura a tu cuenta Anthropic).
- `npm i @anthropic-ai/sdk` y usar el SDK oficial (no `fetch` crudo).
- Cargar la skill `claude-api` antes de escribir la integración (IDs de modelo,
  structured outputs, manejo de errores).

## Archivos involucrados

- `content/templates.ts` — el fallback actual (reemplazable).
- `content/index.ts` — `resolvePracticeSet` (las 14) + re-export de `templatePracticeSet`.
- `api/getPractice.ts` · `hooks/usePractice.ts` — pasan el `translation` (`?t=`).
- `components/PracticeOverlay.tsx` — consumidor; **no cambia** al subir de nivel.
- `tests/mocks/handlers.ts` — handler `/api/practice/:word` (la rama a reemplazar).
- `types.ts` — `PracticeResponse` / `PracticeSentence` (el contrato, estable).
