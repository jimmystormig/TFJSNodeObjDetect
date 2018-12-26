FROM node:8

#RUN echo "deb http://httpredir.debian.org/debian/ stretch main contrib non-free" | tee -a /etc/apt/sources.list

#RUN apt update

#RUN apt install linux-headers-4.9.0-8-all-amd64 -y

#RUN apt-get install nvidia-legacy-340xx-driver -y

#RUN apt-get install nvidia-xconfig

#RUN nvidia-xconfig

#RUN apt install nvidia-cuda-toolkit -y

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3001
VOLUME [ "/images" ]

CMD node index