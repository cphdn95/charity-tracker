# Charity Pledge

A small site where people **pledge** donations to one of three charities
(Charity One, Two, and Three). No real money changes hands — a donation is a
promise to pay later. Anyone with the link can pledge from their phone or
laptop, and every pledge shows up **live** in the donation history sidebar on
everyone's screen.

## How it works

- **`app/page.tsx`** — the donation view: pick a charity, enter your name and an
  amount, and pledge. A sidebar lists the full donation history and running
  totals.
- **`app/api/donations/route.ts`** — `GET` returns the history + per-charity
  totals; `POST` records a new pledge to `data/donations.json` and broadcasts it.
- **`app/api/events/route.ts`** — a Server-Sent Events stream. Every open browser
  holds one connection; new pledges are pushed to all of them in real time, so
  the history updates across devices without a refresh.
- **`lib/charities.ts`** — edit the three charities (names, blurbs, colors) here.

Donations are stored in `data/donations.json`. On a single-instance deploy this
persists between requests; note that ephemeral hosts reset the file on redeploy.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Open it in a second tab (or on your phone, using
your machine's LAN IP) and watch pledges appear in both at once.

## Build

```bash
npm run build && npm start
```
