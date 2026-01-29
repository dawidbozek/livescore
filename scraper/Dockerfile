# Oficjalny obraz Puppeteer - Chrome już zainstalowany
FROM ghcr.io/puppeteer/puppeteer:24.1.0

WORKDIR /app

# Skopiuj pliki package
COPY scraper/package*.json ./

# Zainstaluj zależności (puppeteer-core nie pobiera przeglądarki)
RUN npm ci --only=production

# Skopiuj kod
COPY scraper/src/ ./src/

# Chrome w tym obrazie jest pod tą ścieżką
ENV PUPPETEER_EXECUTABLE_PATH=/opt/google/chrome/chrome

CMD ["node", "src/index.js"]
