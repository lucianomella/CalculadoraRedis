
let isNumber = (value) => {
    if (String(value).match(/^[0-9]+$/) == null) {
        return false;
    }
    return true;
}

exports.validaDatos = (data) => {
    return ('a' in data && 'b' in data && isNumber(data.a) && isNumber(data.b));
}

exports.validaNotNull = (value) => {
    return (value != null && value != undefined && value != '');
}

exports.isNumber = isNumber;