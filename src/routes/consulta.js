const utils = require("./utils");
let request = require('request');

const calcSumaURL = process.env.calcSumaURL || "http://localhost:3001/suma";
const calcRestaURL = process.env.calcRestaURL || "http://localhost:3002/resta";
const calcMultiURL = process.env.calcMultiURL || "http://localhost:3003/multiplica";
const calcDivideURL = process.env.calcDivideURL || "http://localhost:3004/divide";

let options = {
    url: '',
    method: 'POST',
    json: true,
    headers: {
        'Content-Type': 'application/json'
    },
    body: {}
}

exports.suma = async function (data) {
    options.url = calcSumaURL;
    options.body = data;
    return new Promise(function (resolve, reject) {
        request.post(options, function (error, response, body) {
            console.log("entró en servicio suma:");
            if ('statusCode' in response && response.statusCode == '200') {
                resolve(String(body))
            }
        })
    });
}

exports.resta = function (data) {
    options.url = calcRestaURL;
    options.body = data;
    return new Promise(function (resolve, reject) {
        request.post(options, function (error, response, body) {
            console.log("entró en servicio suma:");
            if ('statusCode' in response && response.statusCode == '200') {
                resolve(String(body))
            }
        })
    });
}

exports.multi = function (data) {
    options.url = calcMultiURL;
    options.body = data;
    return new Promise(function (resolve, reject) {
        request.post(options, function (error, response, body) {
            console.log("entró en servicio suma:");
            if ('statusCode' in response && response.statusCode == '200') {
                resolve(String(body))
            }
        })
    });
}

exports.dividir = function (data) {
    options.url = calcDivideURL;
    options.body = data;
    return new Promise(function (resolve, reject) {
        request.post(options, function (error, response, body) {
            console.log("entró en servicio suma:");
            if ('statusCode' in response && response.statusCode == '200') {
                resolve(String(body))
            }
        })
    });
}