FROM node:10.9.0

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake curl git zlib1g-dev \
    ca-certificates \
    nginx wget \ 
    && apt-get clean

# Install geckodriver
RUN cd /tmp \ 
    && wget https://github.com/mozilla/geckodriver/releases/download/v0.11.1/geckodriver-v0.11.1-linux64.tar.gz \
    && tar -xvzf geckodriver-v0.11.1-linux64.tar.gz \
    && rm geckodriver-v0.11.1-linux64.tar.gz \
    && mv geckodriver /usr/bin \
    && chmod +x /usr/bin/geckodriver

# Setup chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update \
    && apt-get -y install google-chrome-stable 

WORKDIR /custodian_popup
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 80
EXPOSE 9966

CMD [ "npm", "run", "dev" ]