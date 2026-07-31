# LuGa-Tech – Website

Moderne Website für **LuGa-Tech Gas- und Drucklufttechnik** (Koblach, AT & Eschen, LI).

## Merkmale

- 5 Seiten: Startseite, Unternehmen, Produkte, Service, Kontakt
- Hell & clean im Look der Logofarben (Blau `#2fb4e9`, Grau `#dedede`)
- Alle Assets lokal – auch die Schrift (Manrope, self-hosted woff2), keine externen Requests
- Mobil optimiert (responsives Layout, Burger-Menü)
- Interaktiv: Druckluft-Partikelanimation im Hero, Scroll-Animationen, Zähler, Service-Akkordeon, Kontaktformular (mailto)

## Lokal starten

```bash
npm start
# → http://localhost:3000
```

Keine Abhängigkeiten – `server.js` ist ein statischer Webserver mit reinem Node.js.

## Deployment (Railway)

Das Repo kann direkt auf Railway deployt werden:

1. Neues Projekt → „Deploy from GitHub repo"
2. Region: **EU West (Amsterdam)**
3. Railway erkennt Node.js automatisch und startet `npm start` (Port via `$PORT`)

<!-- Deploy-Trigger: v3 -->

_Stand: Juli 2026 – v3_
