// index.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// Definimos la ruta para manejar las solicitudes GET en "/api/whoami"
app.get('/api/whoami', (req, res) => {

  // Obtenemos la dirección IP del usuario. Si la solicitud pasa por un proxy, la IP real se encuentra en el encabezado 'x-forwarded-for'.
  // Si no, tomamos la dirección IP desde la conexión directa (req.connection.remoteAddress).
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Respondemos con un objeto JSON que contiene tres propiedades:
  res.json({
    // "ipaddress": la dirección IP obtenida en la línea anterior.
    "ipaddress": ip,

    // "language": El idioma preferido del navegador. Esto obtiene el valor de 'navigator.language' (por ejemplo, "en-US").
    "language": navigator.language,

    // "software": La plataforma del navegador. Esto obtiene el valor de 'navigator.platform', que puede ser algo como "Win32", "Linux x86_64", etc.
    "software": navigator.platform
  });
});


// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
