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

let asignaDatosRedis = function (tipo, resp, aux, fun) {
    let data = { a: resp, b: aux };
    let key = tipo + JSON.stringify(data);
    return new Promise(function (resolve, reject) {
        client.get(key, function (err, reply) {
            console.log('asignaDatosRedis - key:' + key)
            console.log('asignaDatosRedis - reply: ' + reply)
            if (utils.isNumber(reply)) {
                resolve(Number(reply));
            } else {
                fun(data).then((value) => {
                    client.set(key, value);
                    resolve(value);
                });
            }
        });
    });
};


let calcular = async function (texto) {
    let resp = 0;
    let sumar = String(texto).split('+');
    console.log('Entró en calcular. Texto:' + texto);

    console.log('Calcular:' + JSON.stringify(sumar));
    for (let i = 0; i < sumar.length; i++) {
        if (utils.isNumber(sumar[i])) {
            console.log("Es valido: " + sumar[i])
            resp = await asignaDatosRedis('suma-', resp, sumar[i], consulta.suma);
        } else {
            let resp2 = 0;
            console.log("No es valido: " + sumar[i])

            if (sumar[i].split('-').length > 1) {
                console.log('es resta')
                resp2 = await calcularResta(sumar[i]);
            } else {
                console.log('no es resta')
                if (sumar[i].split('*').length > 1) {
                    console.log('es Multiplicación')
                    resp2 = await calcularMultiplicacion(sumar[i]);
                } else {
                    console.log('no es Multiplicación')
                    if (sumar[i].split('/').length > 1) {
                        console.log('es división')
                        resp2 = await calcularDividir(sumar[i]);
                    }
                }
            }
            resp = await asignaDatosRedis('suma-', resp, resp2, consulta.suma);
        }
    }
    client.set(texto, texto + ' = ' + resp);

};


let obtenerPrimerParametro = async function (texto) {
    let resp=0;
    if (utils.isNumber(texto)) {
        return texto;
    } else {
        let resp2 = 0;
        console.log("No es valido: " + texto)

        if (texto.split('-').length > 1) {
            console.log('es resta')
            resp2 = await calcularResta(texto);
        } else {
            console.log('no es resta')
            if (texto.split('*').length > 1) {
                console.log('es Multiplicación')
                resp2 = await calcularMultiplicacion(texto);
            } else {
                console.log('no es Multiplicación')
                if (texto.split('/').length > 1) {
                    console.log('es división')
                    resp2 = await calcularDividir(texto);
                }
            }
        }
        return asignaDatosRedis('suma-', resp, resp2, consulta.suma);
    }
}

let calcularResta = async function (texto) {
    
    //return new Promise(function (resolve, reject) {
    let resta = String(texto).split('-');
    let resp = await obtenerPrimerParametro(resta[0]);
    console.log('obtenerPrimerParametro 180:' + resp);
    console.log('entró en calcularResta. Texto:' + texto);
    console.log('Resta:' + JSON.stringify(resta));
    for (let j =1; j < resta.length; j++) {
        if (utils.isNumber(resta[j])) {
            resp = await asignaDatosRedis('resta-', resp, resta[j], consulta.resta);
        } else {
            let resp2 = 0;
            console.log("No es valido: " + resta[j])


            if (resta[j].split('*').length > 1) {
                console.log('es Multiplicación')
                resp2 = await calcularMultiplicacion(resta[j]);
            } else {
                console.log('no es Multiplicación')
                if (resta[j].split('/').length > 1) {
                    console.log('es división')
                    resp2 = await calcularDividir(resta[j]);
                }
            }

            resp = await asignaDatosRedis('suma-', resp, resp2, consulta.suma);
        }
    }
    return resp;
}

let calcularMultiplicacion = async function(texto) {
    let multi = String(texto).split('*');
    let resp = await obtenerPrimerParametro(multi[0]);
    for (let j = 1; j < multi.length; j++) {
        if (utils.isNumber(multi[j])) {
            resp = await asignaDatosRedis('multi-', resp, multi[j], consulta.multi);
        } else {
            let resp2=0;
            if (multi[j].split('/').length > 1) {
                console.log('es división')
                resp2 = await calcularDividir(multi[j]);
            }
            resp = await asignaDatosRedis('multi-', resp, resp2, consulta.multi);
        }
    }
    return resp;
}

let calcularDividir = async function (texto) {
    let dividir = String(texto).split('/');
    let resp = await obtenerPrimerParametro(dividir[0]);
    for (let j = 1; j < dividir.length; j++) {
        if (utils.isNumber(dividir[j])) {
            resp = await asignaDatosRedis('divide-', resp, dividir[j], consulta.dividir);
        }
    }
    return resp;
}






module.exports = router;