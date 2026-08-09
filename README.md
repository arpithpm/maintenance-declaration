# Guided Maintenance Declaration

A dependency-free bilingual web form for collecting the information in the German `Unterhaltserklärung` used for support payments under § 33a EStG.

Live site: <https://arpithpm.github.io/maintenance-declaration/>

## Run locally

From the repository root:

```bash
python3 -m http.server 8080 --directory maintenance-form
```

Then open <http://localhost:8080>.

## Included

- English/German interface
- Six-step guided form with required-field validation
- Repeatable household-member and supporter sections
- Local-only autosave using `localStorage`
- Evidence checklist
- Review screen
- Downloadable JSON backup
- Direct four-page A4 PDF download using the official bilingual declaration as the visual template

This is a client-only prototype. It does not submit a tax return or upload data to a server.
