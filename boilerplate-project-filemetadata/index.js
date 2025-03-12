var express = require('express');
var cors = require('cors');
require('dotenv').config()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

var app = express();

app.use(express.urlencoded({
  extended: true
}));

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Ruta POST para analizar un archivo subido por el usuario
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  // 'upload.single('upfile')' es un middleware de Multer que procesa la subida de un solo archivo.
  // El archivo se espera en el campo 'upfile' del formulario.

  const upfile = req.file; // 'req.file' contiene la información del archivo subido, gracias a Multer.
  console.log(upfile); // Imprime la información del archivo en la consola para fines de depuración.

  // Devuelve una respuesta JSON con detalles del archivo subido:
  res.json({
    name: upfile.originalname, // Nombre original del archivo.
    type: upfile.mimetype,     // Tipo MIME del archivo (por ejemplo, 'image/png', 'application/pdf').
    size: upfile.size,         // Tamaño del archivo en bytes.
  });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
