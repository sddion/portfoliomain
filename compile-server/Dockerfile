FROM node:20-bookworm

# Install arduino-cli binary directly (not via install script)
RUN curl -fsSL https://downloads.arduino.cc/arduino-cli/arduino-cli_1.1.1_Linux_64bit.tar.gz -o /tmp/arduino-cli.tar.gz \
    && tar -xzf /tmp/arduino-cli.tar.gz -C /usr/local/bin \
    && rm /tmp/arduino-cli.tar.gz \
    && chmod +x /usr/local/bin/arduino-cli

# Install board cores
RUN arduino-cli core update-index \
    && arduino-cli core install arduino:avr \
    && arduino-cli config add board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json \
    && arduino-cli config add board_manager.additional_urls https://arduino.esp8266.com/stable/package_esp8266com_index.json \
    && arduino-cli core update-index \
    && arduino-cli core install esp32:esp32 \
    && arduino-cli core install esp8266:esp8266

# Install common libraries
RUN arduino-cli lib install WiFi ArduinoJson Adafruit_NeoPixel FastLED DHT

WORKDIR /app

COPY package.json server.js ./

RUN npm install

EXPOSE 3001

CMD ["node", "server.js"]
