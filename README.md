# 🌍 Jordens rotationshastighet – Interaktiv 3D-visualisering

Det här projektet demonstrerar jordens linjära rotationshastighet beroende på latitud, visualiserat som en interaktiv 3D-glob byggd med:

- React
- TypeScript
- Vite
- deck.gl
- luma.gl

Projektet körs helt i webbläsaren och visar hur snabbt olika punkter på jordens yta rör sig när planeten roterar.

---

## 🎯 Funktioner

### 1. Interaktiv 3D-glob

- Rotera, panorera och zooma.
- Globen använder verklig jordradie och Natural Earth-data.

### 2. Latitudband (fartzoner)

Varje band visar rotationshastigheten enligt:

```
v = 465 * cos(latitud)
```

- 465 m/s vid ekvatorn.
- Färgskala: snabba zoner → ljusare, långsammare zoner → mörkare.

### 3. Partikelström längs latituder

Visuella linjer som markerar:

- Rörelseriktning (österut)
- Hastighetsvariation mellan olika breddgrader

### 4. Klicka på globen → exakt hastighet

När du klickar:

1. En gul cirkel markeras på vald latitud
2. Exakt hastighet visas i m/s
3. En informationspanel öppnas
4. Jämförelse görs med en tvättmaskins centrifughastighet

### 5. Jämförelse: Jorden vs Tvättmaskin

Panelen visar:

- 🌍 Jordens hastighet i m/s
- 🧼 Tvättmaskinens trumhastighet (m/s, 1400 rpm)
- Faktor: hur många gånger snabbare jorden rör sig

### 6. Animationer

Projektet innehåller dynamiska visuella effekter, t.ex. pulserande markeringar.

---

## 🧪 Teknik

Byggt med:

- deck.gl – rendering av glob, linjer och overlays
- luma.gl – geometri (SphereGeometry)
- React + TypeScript – UI och logik
- Vite – snabb utvecklings- och buildmiljö

Fristående från deck.gl:s egna exempel.

---

## 📦 Projektstruktur

```
earth-globe/
  src/
    App.tsx
    main.tsx
    index.css
  public/
  index.html
  vite.config.ts
  package.json
```

---

## 🚀 Deployment (GitHub Pages)

För att publicera:

```
npm run build
npm run deploy
```

Detta pushar `dist/` till GitHub-branchen `gh-pages`.

Aktivera sedan:

GitHub → Settings → Pages →  
"Deploy from branch" → `gh-pages` / root

---
