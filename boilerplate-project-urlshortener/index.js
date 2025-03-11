require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// Se declara un arreglo vacío para almacenar las URLs y sus versiones acortadas
let urlObj = []

// Ruta para manejar solicitudes POST para acortar URLs
app.post('/api/shorturl/', (req, res) => {
  // Se obtiene la URL proporcionada en el cuerpo de la solicitud
  const url_input = req.body.url
  // Se analiza la URL para obtener su estructura
  const parsedUrl = url.parse(url_input)

  // Se hace una consulta DNS para verificar si el hostname de la URL es válido
  dns.lookup(parsedUrl.hostname, (error, address) => {
    // Si no se encuentra una dirección válida, se devuelve un error
    if (!address) {
      res.json({ error: "Invalid URL" })
    } else {
      // Si la dirección es válida, se crea un objeto con la URL original y el ID de la URL corta
      const newUrl = { original_url: url_input, short_url: urlObj.length + 1 }
      // Se agrega la nueva URL al arreglo urlObj
      urlObj.push(newUrl)
      // Se responde con un objeto JSON que contiene la URL original y la URL corta
      res.json({
        "original_url": newUrl.original_url,
        "short_url": newUrl.short_url
      })
    }
  })
})

// Ruta para manejar solicitudes GET que redirigen según la URL corta
app.get('/api/shorturl/:short_url', (req, res) => {
  // Se convierte el parámetro de la URL corta a un número entero
  const url = parseInt(req.params.short_url)
  // Si el parámetro no es un número válido, se responde con un error
  if (isNaN(url)) {
    return res.json("Error")
  }
  // Se recorre el arreglo de URLs almacenadas para buscar una coincidencia con el ID de la URL corta
  for (i = 0; i < urlObj.length; i++) {
    // Si se encuentra una coincidencia, se redirige a la URL original
    if (url === urlObj[i].short_url) {
      res.redirect(urlObj[i].original_url)
      return
    }
  }
  // Si no se encuentra ninguna coincidencia, se responde con un error
  res.json("Error")
})


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
