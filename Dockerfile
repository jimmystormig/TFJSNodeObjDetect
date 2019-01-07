FROM node:8

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3001
VOLUME [ "/images" ]

CMD node index