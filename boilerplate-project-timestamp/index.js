// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});

// Definimos la ruta para manejar las solicitudes GET en "/api/:date?", donde ":date?" es un parámetro opcional.
app.get("/api/:date?", (req, res) => {

  // Definimos una expresión regular para verificar si el parámetro "date" tiene el formato de una fecha en "YYYY-MM-DD".
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  // Obtenemos el valor del parámetro "date" de la URL.
  const date = req.params.date;

  // Si el parámetro "date" no está definido (es decir, no se proporciona en la URL).
  if (date === undefined) {
    // Responemos con el tiempo actual en formato Unix y UTC si no se pasa ningún parámetro de fecha.
    res.json({
      "unix": Date.now(), // El tiempo actual en milisegundos desde la época Unix.
      "utc": new Date().toUTCString() // La fecha en formato UTC.
    });
  }
  // Si el parámetro "date" es un número (lo tratamos como una fecha en formato Unix).
  else if (!isNaN(date)) {
    const unixDate = parseInt(date); // Convertimos el valor a un número entero.
    // Respondemos con la fecha en formato Unix y UTC correspondiente a ese valor numérico.
    res.json({
      "unix": unixDate, // El valor Unix que se pasa como parámetro.
      "utc": new Date(unixDate).toUTCString() // La fecha UTC correspondiente al valor Unix.
    });
  }
  // Si el parámetro "date" tiene un formato que coincide con la expresión regular (formato "YYYY-MM-DD").
  else if (regex.test(date)) {
    const unixDate = new Date(date).getTime(); // Convertimos la fecha "YYYY-MM-DD" a milisegundos desde la época Unix.
    // Respondemos con la fecha en formato Unix y UTC correspondiente a la fecha "YYYY-MM-DD".
    res.json({
      "unix": unixDate, // El valor Unix correspondiente a la fecha.
      "utc": new Date(unixDate).toUTCString() // La fecha UTC correspondiente a la fecha.
    });
  }
  // Si el parámetro "date" no tiene un formato numérico ni "YYYY-MM-DD", tratamos de convertirlo en una fecha válida.
  else {
    const parsedDate = new Date(date); // Intentamos crear una fecha a partir del parámetro "date".
    const unixDate = parsedDate.getTime(); // Obtenemos el valor Unix de la fecha generada.

    // Si la fecha es inválida (no se pudo convertir correctamente).
    if (isNaN(unixDate)) {
      // Respondemos con un error indicando que la fecha es inválida.
      res.json({ error: "Invalid Date" });
    }
    // Si la fecha es válida, respondemos con los valores Unix y UTC.
    else {
      res.json({
        "unix": unixDate, // El valor Unix de la fecha válida.
        "utc": parsedDate.toUTCString() // La fecha UTC de la fecha válida.
      });
    }
  }
});


// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
