FROM node:24-slim
LABEL maintainer="Eyevinn Technology <info@eyevinn.se>"

# Node 24 needs a newer glibc than the old Ubuntu 18.04 eyevinntechnology/ffmpeg-base,
# so Node comes from the official image and ffmpeg/fonts from distro packages.
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg fonts-freefont-ttf && \
    rm -rf /var/lib/apt/lists/*

ADD . /app
WORKDIR /app
RUN npm install
RUN mkdir /var/jobs

CMD [ "node", "index.js" ]
