FROM node:12-slim

ENV PORT=3001

COPY ./ ./

RUN npm i

EXPOSE 3001
CMD ["npm","start"] 