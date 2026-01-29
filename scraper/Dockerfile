# Użyj oficjalnego obrazu Puppeteer - ma już zainstalowany Chromium
FROM ghcr.io/puppeteer/puppeteer:23.11.1

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj pliki package
COPY package*.json ./

# Zainstaluj zależności (bez pobierania Chromium - już jest w obrazie)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN npm ci --only=production

# Skopiuj kod źródłowy
COPY src/ ./src/

# Puppeteer w tym obrazie jest w /usr/bin/google-chrome-stable
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Uruchom scraper
CMD ["node", "src/index.js"]
