const express = require("express");
var bodyParser  = require('body-parser');
const PORT = process.env.PORT || 3006;
let app = express();

app.use(express.json());
app.use(bodyParser.text({ type: 'text/plain' }))

app.use('/calcula', require('./routes/calcula'));

app.listen(PORT);
console.log(`Express server listening on port ${PORT}`);

app.on('error', function (e) {
    // Handle your error here
    console.log(e);
});
module.exports = app