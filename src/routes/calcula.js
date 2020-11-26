const { Router } = require('express');
const utils = require("./utils");
const consulta = require("./consulta");
const redis = require("./redis");
const router = Router();
const client = redis.client;

router.post("/input", function (req, res) {
    let body = req.body.split('\n')
    let consultar = [];
    console.log('body:' + JSON.stringify(body));
    try {
        for (let key of body) {
            console.log('key:' + String(key));
            client.get(key, function (err, reply) {
                console.log('reply:' + String(reply))
                if (!utils.validaNotNull(reply)) {
                    console.log('entró:' + String(reply))
                    consultar.push(key);
                }
            });
        }
        console.log('consultar:'+JSON.stringify(consultar));
        if (consultar.length == 0) {
            res.status(200).send('Calculos Realizados');
        } else {
            for (let i = 0; i < consultar.length; i++) {
                calcular(consultar[i])
                if (i == consultar.length) {
                    res.status(200).send('Calculos Realizados');
                }
            }
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
                if (x == body.length-1) {
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
    client.get(JSON.stringify(data), function (err, reply) {
        if (utils.isNumber(reply)) {
            return Number(reply);
        } else {
            fun(data).then((value) => {
                client.set(JSON.stringify(data), value);
                return value;
            });
        }
    });
};


let calcular = function (texto) {
    let resp = 0;
    let aux = 0;
    let sumar = String(texto).split('+');

    for (let i = 0; i < sumar.length; i++) {
        if (sumar[i + 1] && utils.isNumber(sumar[i]) && utils.isNumber(sumar[i + 1])) {
            resp = asignaDatosRedis(resp, suma[i], consulta.suma);
        } else {
            validaOperacion(sumar[i]).then(aux => {
                resp = asignaDatosRedis(resp, aux, consulta.suma);
            });

        }
    }
}

let validaOperacion = function (texto) {
    if (texto.match('-')) {
        return calcularResta(texto);
    } else if (texto.match('*')) {
        return calcularMultiplicacion(texto);
    } else if (texto.match('/')) {
        return calcularDividir(texto);
    }
}

let obtenerPrimerParametro = function (texto) {
    if (utils.isNumber(texto)) {
        return texto;
    } else {
        validaOperacion(texto).then(aux => {
            return asignaDatosRedis(0, aux, consulta.suma);
        });
    }
}

let calcularResta = (texto) => {
    let resta = String(texto).split('-');
    let resp = obtenerPrimerParametro(resta[0]);
    for (let j = 1; j < resta.length; j++) {
        if (utils.isNumber(resta[j])) {
            resp = asignaDatosRedis(resp, resta[i], consulta.resta);
        } else {
            validaOperacion(sumar[i]).then(aux => {
                resp = asignaDatosRedis(resp, aux, consulta.resta);
            });
        }
    }
    return resp;
}

let calcularMultiplicacion = (texto) => {
    let multi = String(texto).split('*');
    let resp = obtenerPrimerParametro(multi[0]);
    for (let j = 1; j < sumar.length; j++) {
        if (utils.isNumber(multi[j])) {
            resp = asignaDatosRedis(resp, multi[i], consulta.multi);
        } else {
            validaOperacion(multi[j]).then(aux => {
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