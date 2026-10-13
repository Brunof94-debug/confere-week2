# Confere · Receipts, reviewed.

A private-by-design receipt review workspace for Brazilian freelancers. New project started on October 13, 2026 during DEV Hacktoberfest Week 2: Side Hustle (October 12–18).

## Use it

Public demo: https://brunof94-debug.github.io/confere-week2/

1. Add PNG/JPG/WebP receipts or try three clearly fictional sample images.
2. A real Tesseract LSTM model reads the images in a browser worker. Inspect the image, source text and labeled total.
3. Correct merchant, date, BRL amount and category. Exclude duplicates, or explicitly acknowledge a separate expense and explain why.
4. Approve manually. Only approved expenses enter the total and exports.
5. Download a spreadsheet-safe CSV or a self-contained HTML evidence packet with the original images, text, SHA-256 hashes, corrections and approval timestamps. The packet can be printed or opened without this app.

EN/PT interface. No accounts, bank connections, analytics or inference API keys. This does not establish a document's fiscal authenticity or make tax decisions. Browser storage can be evicted; exports are the durable copy.

## Open neural recognition is the core

- Tesseract.js **6.0.1**, Apache-2.0, runs Tesseract through WebAssembly in a worker.
- tesseract.js-core **6.1.2**, Apache-2.0, LSTM-only OEM 1; SIMD and non-SIMD builds are included.
- Portuguese and English trained data: `@tesseract.js-data/por@1.0.0` and `@tesseract.js-data/eng@1.0.0`, `4.0.0_best_int`, Apache-2.0. Model assets are distributed with the app. `asset-manifest.json` records content hashes.
- The model turns actual pixels into text. The parser then conservatively extracts labeled totals. It does not invent merchant names, totals or missing dates. Multiple disagreeing totals produce an empty amount for review. No generative model or closed inference endpoint is used.
- Confidence is the engine's reading score, **not** a calibrated probability that the total is correct. Every receipt requires human approval regardless of confidence.
- Financial arithmetic uses integer cents. It is deterministic application logic, not a model output or financial recommendation.

## Locality and offline limits

Runtime code, worker, WASM and model weights are self-hosted. Images are passed to the local worker and stored with their text in IndexedDB. They are never uploaded by the app. Hosting receives ordinary request metadata for pages and assets; no claim of anonymous hosting is made. Export files deliberately contain the selected receipt data.

First use needs network access to obtain app/model assets. The explicit **Keep available offline** action caches all required LSTM assets using a service worker. Offline availability depends on retained browser storage and compatible WebAssembly/IndexedDB. Failure is reported. PDF, handwriting, arbitrary currencies, fiscal QR validation and mobile camera integrations are outside v1. Clean synthetic fixtures cannot establish real-world OCR accuracy; skew, glare, small print and faded thermal paper remain important limitations.

## Run and verify

Node.js 22+. From this project directory:

```sh
npm ci --ignore-scripts
npm run build
npm test
npm run check
npm start
```

Open http://127.0.0.1:4327/ . `build.mjs` downloads pinned language assets and copies the app/runtime into a flat `dist/` directory. GitHub Actions tests and builds the source, then publishes `dist/` as the Pages artifact. No server application or paid service is required.

The unit suite exercises decimal validation, subtotal/tender rejection, conflicting totals, invalid dates, duplicate handling, approval constraints, approved-only sums, CSV formula protection and HTML escaping. Real browser OCR and export verification are recorded separately in `docs/evidence/`; unit tests are not OCR accuracy measurements. Synthetic sample labels and OCR results are always distinguished.

## Business hypothesis

A Brazilian freelancer or small bookkeeping practice could plausibly pay for less receipt re-entry and a traceable handoff. The current prototype is free. No revenue, customers, interviews, willingness-to-pay validation or time savings are claimed. A future paid service could provide local deployment, tailored exports and support. No checkout or billing has been implemented.

## Attribution and development

Application code: MIT, Bruno Fernandes. See `LICENSE`. Tesseract, its open language data and JS/WASM dependencies are credited in `THIRD_PARTY_NOTICES.md`; vendor license texts accompany the deployed build. Synthetic receipt graphics are authored in canvas and have no fiscal validity. Codex assisted implementation, documentation and testing. No use of GitHub Copilot is claimed.

All substantive application code was started from scratch on October 13, 2026, inside the Week 2 window. This is a separate repository from the previously submitted Week 1 and Kaggle projects. Changes after October 19, 2026 at 03:59 BRT must be disclosed here before further contest claims.
