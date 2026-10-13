# Verification · October 13, 2026

## Browser inference, not mocked output

Tested in the Codex in-app Chromium browser on Windows. The Try 3 samples action authored PNG images on canvas, then passed each image to the actual Tesseract.js 6.0.1 LSTM worker with Portuguese and English trained data.

| Synthetic receipt | Source total | OCR/parser total | OCR engine score | Reading time |
| --- | ---: | ---: | ---: | ---: |
| CAFE DO BAIRRO | R$ 34,90 | R$ 34,90 | 94.0 | 0.76 s |
| PAPELARIA CENTRAL | R$ 124,90 | R$ 124,90 | 94.0 | 0.68 s |
| CAFE copy | R$ 34,90 | R$ 34,90 | Not recorded in this table | Not recorded in this table |

Reading time excludes worker/model startup and includes small local record preparation overhead. Device-specific measurements, not a performance promise. Clean synthetic receipts do not establish accuracy on photographed/faded/skewed real receipts. The third image is intentionally byte-identical to the café image.

## Interaction and export

- Initial total stayed R$ 0,00: all three records required review.
- Trying to approve the duplicate without acknowledgement showed a duplicate error and did not change the total.
- Excluding the copy and approving the two originals produced R$ 159,80 with exactly two approved records.
- CSV download contained a header and two approved rows, with 34,90 and 124,90 amounts, original filenames and image SHA-256 hashes.
- HTML evidence packet contained the two original images as data URLs plus recognized text and review metadata. No external image dependency.
- Reload restored local receipt records and the R$ 159,80 approved total.
- Editing the café amount to 34,91 immediately invalidated its approval and reduced the approved total to R$ 124,90. Restoring 34,90 and approving again restored R$ 159,80.

## Offline reproduction

1. Clicked Keep available offline and received the explicit completion message.
2. Stopped the owned local HTTP server.
3. Reloaded the browser successfully; existing records and approved total were still shown.
4. Clicked Try 3 samples again with the server stopped. A new worker loaded locally and read all three images; the receipt count increased from three to six. Newly read receipts remained pending and the approved total stayed R$ 159,80.

This exercises absence of the app/model server after cache preparation, not an OS-wide airplane-mode test. The same-origin worker/model URLs had no live server. Availability still depends on browser cache retention.

## Evidence

- `evidence/browser-reading.txt`: visible expanded reading details from both originals.
- `evidence/offline-reading.txt` and `offline-reading.png`: UI after the offline reading.
- `evidence/sample-expenses.csv` and `sample-evidence.html`: actual browser downloads; all data is fictional.
- Unit tests verify money parsing, currency rejection, subtotal/tender rejection, ambiguity, dates, duplicates, validation, exact sums and export escaping.

No customers, customer data, sales, fiscal validation or model benchmark comparisons are claimed.
