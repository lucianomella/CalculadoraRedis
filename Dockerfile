FROM node:12-slim

ENV PORT=3001
ENV calcSumaURL = "http://localhost:3001/suma"
ENV calcRestaURL = "http://localhost:3002/resta"
ENV calcMultiURL = "http://localhost:3003/multiplica"
ENV calcDivideURL = "http://localhost:3004/divide"

COPY ./ ./

RUN npm i

EXPOSE 3001
CMD ["npm","start"] 