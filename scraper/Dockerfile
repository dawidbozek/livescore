# Użyj Node.js z Debian (ma potrzebne biblioteki dla Chrome)
FROM node:22-bookworm-slim

# Zainstaluj zależności systemowe dla Chrome
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Skopiuj pliki package
COPY scraper/package*.json ./

# Zainstaluj zależności - Puppeteer użyje systemowego Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
RUN npm install --omit=dev

# Skopiuj kod
COPY scraper/src/ ./src/

CMD ["node", "src/index.js"]
