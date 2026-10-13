# Third-party notices

Confere's authored application files are MIT. Bundled components retain their own licenses.

- [Tesseract.js](https://github.com/naptha/tesseract.js), 6.0.1, Jerome Wu and contributors, Apache License 2.0.
- [Tesseract.js-core](https://github.com/naptha/tesseract.js-core), 6.1.2, Jerome Wu and contributors, Apache License 2.0.
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract), Google and contributors, Apache License 2.0. Neural LSTM engine.
- [Language trained data](https://github.com/naptha/tessdata) and [tessdata_best](https://github.com/tesseract-ocr/tessdata_best), Apache License 2.0. Portuguese and English int8 models distributed by @tesseract.js-data, version 1.0.0.
- [Leptonica](https://github.com/DanBloomberg/leptonica), Dan Bloomberg and contributors, BSD-2-Clause. Included in the WASM OCR engine.
- Tesseract.js dependency packages: bmp-js (MIT), idb-keyval (Apache-2.0), is-url (MIT), node-fetch (MIT), opencollective-postinstall (MIT), regenerator-runtime (MIT), wasm-feature-detect (Apache-2.0), zlibjs (MIT). Node-only dependencies are not served to browser visitors.

The build includes the full upstream runtime licenses as `TESSERACT_LICENSE`, `TESSERACT_CORE_LICENSE`, plus package license notices. No third-party photos, web fonts or paid services are used. The model and runtime downloads come from pinned npm/jsDelivr package URLs at build time; production inference assets are same-origin.
