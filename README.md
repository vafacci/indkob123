# 🛒 Fælles indkøbsliste

En simpel, mobilvenlig indkøbsliste til to personer.
Next.js (App Router) + TypeScript + Tailwind CSS + Neon (Postgres), deployet gratis på Vercel.

## Funktioner

- Fælles adgangskode – I skriver bare jeres navn første gang, og telefonen husker det
- Tilføj vare (Enter) med valgfrit antal, tryk for at krydse af, ✕ for at slette, "Ryd købte"
- Listen opdaterer sig selv hos den anden (henter ca. hver 3. sekund)
- Initial og farve viser, hvem der tilføjede varen
- Optimistiske opdateringer, lys/mørk tilstand efter systemet
- Kan tilføjes til hjemmeskærmen (PWA)

## Projektstruktur

```
db/schema.sql                      Tabellen (køres én gang)
src/app/page.tsx                   Hovedsiden
src/app/login/page.tsx             Login
src/app/actions.ts                 Server-funktioner: login, tilføj, afkryds, slet
src/components/ShoppingList.tsx    Selve listen
src/lib/session.ts                 Signeret login-cookie
src/lib/items.ts                   Database-adgang (Neon)
src/middleware.ts                  Sender ikke-loggede brugere til /login
src/app/manifest.ts, pwa-icon, apple-icon.tsx   PWA
```

## 1. Opret Neon-database

1. Log ind på <https://neon.tech> og opret et projekt (vælg region *Frankfurt*, hvis den findes).
2. Tryk **Connect** og kopiér **connection string** (starter med `postgresql://…`).

## 2. Opret tabellen

Kør indholdet af `db/schema.sql` ét af disse steder:
- Neon → **SQL Editor** → indsæt → **Run**, eller
- pgAdmin: opret en server med Neons forbindelsesoplysninger, åbn *Query Tool* på databasen og kør filen.

## 3. Miljøvariabler (.env.local)

Kopiér `.env.local.example` til `.env.local` og udfyld:

| Variabel | Hvad |
|---|---|
| `DATABASE_URL` | Connection string fra Neon |
| `APP_PASSWORD` | Den fælles adgangskode I begge logger ind med |
| `SESSION_SECRET` | Lang tilfældig tekst (fx 40+ tegn). Skal holdes hemmelig |

## 4. Kør lokalt

Kræver Node.js 18.18 eller nyere.

```bash
npm install
npm run dev
```

Åbn <http://localhost:3000>, skriv dit navn og adgangskoden.

## 5. Deploy til Vercel (gratis)

1. Læg projektet på GitHub (`.env.local` bliver ikke med, den er i `.gitignore`).
2. På <https://vercel.com>: **Add New → Project** → vælg repoet.
3. Under **Environment Variables** tilføj `DATABASE_URL`, `APP_PASSWORD` og `SESSION_SECRET` (samme værdier som lokalt).
4. Tryk **Deploy**. Send adresse (`https://….vercel.app`) til din kæreste.

Skal I skifte adgangskode, så ret `APP_PASSWORD` i Vercel og tryk *Redeploy*. Skift `SESSION_SECRET` for at logge alle ud.

## 6. Tilføj til hjemmeskærmen

- **iPhone (Safari):** Del-knappen → *Føj til hjemmeskærm*.
- **Android (Chrome):** Menu (⋮) → *Installér app* / *Føj til startskærm*.

Husk at logge ind i selve appen første gang, den åbnes fra hjemmeskærmen.

## Gode at vide

- Alle der kender adgangskoden og adressen kan bruge listen – hold dem for jer selv.
- Neons gratis database går i dvale, når den ikke bruges, så første åbning kan tage et sekund ekstra.
- Slet sker med ✕-knap (ingen swipe), og appen virker ikke offline.
