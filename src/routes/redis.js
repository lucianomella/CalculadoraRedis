
let redis = require('redis');
client = redis.createClient(); //creates a new client

client.on('connect', function () {
    console.log('connected');
});

client.on("error", function (err) {
    console.log("Error " + err);
});

exports.client= client;