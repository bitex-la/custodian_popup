FROM node:10.9.0

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake curl git zlib1g-dev \
    ca-certificates \
    nginx wget \ 
    && apt-get clean

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