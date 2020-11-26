"use strict";
const { Router } = require('express');
const utils = require("./utils");
const consulta = require("./consulta");
const redis = require("./redis");
const co = require('co');


const router = Router();
const client = redis.client;

router.post("/input", function (req, res) {
    let body = req.body.split('\n')
    let consultar = [];
    console.log('body:' + JSON.stringify(body));
    try {
        for (let i = 0; i < body.length; i++) {
            console.log('key:' + String(body[i]));
            client.get(body[i], function (err, reply) {
                console.log('reply:' + String(reply))
                if (!utils.validaNotNull(reply)) {
                    console.log('entró:' + String(reply))
                    consultar.push(body[i]);
                }
                if (i == body.length - 1) {
                    console.log('consultar:' + JSON.stringify(consultar));
                    if (consultar.length == 0) {
                        console.log('consultar if -- consultar.length:' + consultar.length);
                        res.status(200).send('Calculos Solicitado');
                    } else {
                        console.log('consultar else -- consultar.length:' + consultar.length);
                        for (let j = 0; j < consultar.length; j++) {
                            calcular(consultar[j]);
                            if (j == consultar.length - 1) {
                                res.status(200).send('Calculos Solicitado');
                            }
                        }
                    }
                }
            });
        }

    } catch {
        res.status(400).send("Error en datos");
    }
})

router.get("/healt", function (req, res) {
    res.status(200).send('API esta activa');
})

router.post("/output", function (req, res) {
    let body = String(req.body).split('\n');
    let resp = '';
    try {
        for (let x = 0; x < body.length; x++) {
            console.log('key:' + String(body[x]));
            client.get(body[x], function (err, reply) {
                if (err) {
                    res.status(400).send("Error al consultar:" + String(err));
                }
                console.log('reply:' + String(reply))
                if (reply) {
                    resp = resp + String(reply) + '\n'
                }
                console.log('x:' + String(x) + ' - body.lengh:' + body.length)
                if (x == body.length - 1) {
                    res.status(200).send(resp);
                }
            });
        }

    } catch {
        res.status(400).send("Error al consultar");
    }
})

let asignaDatosRedis = function (resp, aux, fun) {
    let data = { a: resp, b: aux };
    return new Promise(function (resolve, reject) {
        client.get(JSON.stringify(data), function (err, reply) {
            console.log('asignaDatosRedis - data:' + JSON.stringify(data))
            console.log('asignaDatosRedis - reply: ' + reply)
            if (utils.isNumber(reply)) {
                resolve(Number(reply));
            } else {
                fun(data).then((value) => {
                    client.set(JSON.stringify(data), value);
                    resolve(value);
                });
            }
        });
    });
};


let calcular = async function (texto) {
    let resp = 0;
    let sumar = String(texto).split('+');
    console.log('entró en calcular. Texto:' + texto);

    console.log('Sumar:' + JSON.stringify(sumar));
    for (let i = 0; i < sumar.length; i++) {
        if (utils.isNumber(sumar[i])) {
            resp = await asignaDatosRedis(resp, sumar[i], consulta.suma);
        } else {
            let resp2 = 0
            if (sumar[i].match('-') != -1) {
                resp2 = await calcularResta(sumar[i]);
            } else if (sumar[i].match('*') != -1) {
                resp2 = await calcularMultiplicacion(sumar[i]);
            } else if (sumar[i].match('/') != -1) {
                resp2 = await calcularDividir(sumar[i]);
            }
            resp = await asignaDatosRedis(resp, resp, consulta.suma);
        }
    }
    client.set(texto, texto + ' = ' + resp);
   
};

let validaOperacion = function (texto) {
    if (texto.match('-') != -1) {
        return calcularResta(texto);
    } else if (texto.match('*') != -1) {
        return calcularMultiplicacion(texto);
    } else if (texto.match('/') != -1) {
        return calcularDividir(texto);
    }
}

let obtenerPrimerParametro = function (texto) {
    if (utils.isNumber(texto)) {
        return texto;
    } else {
        validaOperacion(texto, (aux) => {
            return asignaDatosRedis(0, aux, consulta.suma);
        });
    }
}

let calcularResta = (texto) => {

    return new Promise(function (resolve, reject) {
        let resta = String(texto).split('-');
        let resp = obtenerPrimerParametro(resta[0]);
        console.log('entró en calcularResta. Texto:' + texto);
        console.log('Resta:' + JSON.stringify(resta));
        for (let j = 1; j < resta.length; j++) {
            if (utils.isNumber(resta[j])) {
                resp = asignaDatosRedis(resp, resta[j], consulta.resta);
            } else {
                validaOperacion(sumar[i], (aux) => {
                    resp = asignaDatosRedis(resp, aux, consulta.resta);
                    if (j == resta.length - 1) {
                        resolve(resp);
                    }
                });
            }
            if (j == resta.length - 1) {
                resolve(resp);
            }
        }
    });
}

let calcularMultiplicacion = (texto) => {
    let multi = String(texto).split('*');
    let resp = obtenerPrimerParametro(multi[0]);
    for (let j = 1; j < sumar.length; j++) {
        if (utils.isNumber(multi[j])) {
            resp = asignaDatosRedis(resp, multi[j], consulta.multi);
        } else {
            validaOperacion(multi[j], (aux) => {
                resp = asignaDatosRedis(resp, aux, consulta.multi);
            });
        }
    }
    return resp;
}

let calcularDividir = (texto) => {
    let dividir = String(texto).split('/');
    let resp = obtenerPrimerParametro(dividir[0]);
    for (let j = 1; j < sumar.length; j++) {
        if (utils.isNumber(dividir[j])) {
            resp = asignaDatosRedis(resp, dividir[i], consulta.dividir);
        }
    }
    return resp;
}






module.exports = router;