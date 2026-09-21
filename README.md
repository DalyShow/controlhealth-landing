# Control Health — landing page

Preview build of the Control Health marketing landing page. Extracted from
`Control-Health/website-service` as a standalone, statically exportable app so
it can be reviewed without the monorepo's CMS and auth dependencies.

## Running it

```bash
npm install
npm run dev
```

## Deploying

Pushing to `main` builds a static export and publishes it to GitHub Pages via
`.github/workflows/deploy.yml`. The workflow sets `NEXT_PUBLIC_BASE_PATH` to
the repository name because project sites are served from a subpath.

## What's here

The hero: a full-bleed gradient with an overlay-blended video layer, three
animated stat sprites (steps, heart rate, sleep) and an interactive waveform.

- `components/marketing/` — atoms, molecules and organisms, atomic-design order
- `hooks/` — reduced-motion, the shared step beat, the heart-rate workout
- `lib/tick-sound.ts` — Web Audio tick for the waveform rollover

Hover the waveform to hear it; browsers block audio until the page has been
clicked once.

## Relationship to website-service

This is a copy, not a fork with history. Changes worth keeping belong back in
`packages/design-system/components/marketing` in the monorepo.
