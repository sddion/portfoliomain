FROM node:20

# Install arduino-cli
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh && \
    mv bin/arduino-cli /usr/local/bin/ && \
    rm -rf bin

# Install board cores
RUN arduino-cli core update-index && \
    arduino-cli core install arduino:avr && \
    arduino-cli config add board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json && \
    arduino-cli config add board_manager.additional_urls https://arduino.esp8266.com/stable/package_esp8266com_index.json && \
    arduino-cli core update-index && \
    arduino-cli core install esp32:esp32 && \
    arduino-cli core install esp8266:esp8266

# Install common libraries
RUN arduino-cli lib install WiFi ArduinoJson Adafruit_NeoPixel FastLED DHT

WORKDIR /app

# Copy server code
COPY package.json server.js ./

RUN npm install

EXPOSE 3001

CMD ["node", "server.js"]
