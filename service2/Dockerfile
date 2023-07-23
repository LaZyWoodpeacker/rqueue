FROM node:18
WORKDIR /app
COPY package.json ./
COPY index.js ./
RUN ["mkdir", "log"]
RUN ["npm", "i","--omit=dev"]
CMD ["node", "index.js"]