const express = require('express')
const app = express()
const cors = require('cors')
const { default: mongoose } = require('mongoose')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Middleware para parsear los datos enviados en el cuerpo de las solicitudes HTTP con formato URL-encoded
app.use(express.urlencoded({
  extended: true
}));

// Conexión a la base de datos MongoDB en la dirección local (127.0.0.1) y puerto 27017, usando la base de datos llamada 'freecodecamp-projects'
mongoose.connect('mongodb://127.0.0.1:27017/freecodecamp-projects');

// Definición del esquema de usuario, que tiene un campo 'username' de tipo String y único (no se pueden repetir nombres de usuario)
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true }
});

// Creación del modelo 'User' basado en el esquema 'userSchema'
let User = mongoose.model('User', userSchema);

// Definición del esquema de ejercicio, que tiene un campo 'username' que referencia al modelo 'User',
// un campo 'description' de tipo String, un campo 'duration' de tipo Number y un campo 'date' de tipo Date
const exerciseSchema = new mongoose.Schema({
  username: { type: mongoose.Schema.Types.ObjectId, ref: User },
  description: { type: String },
  duration: { type: Number },
  date: { type: Date }
});

// Creación del modelo 'Exercise' basado en el esquema 'exerciseSchema'
let Exercise = mongoose.model('Exercise', exerciseSchema);

// Ruta POST para crear un nuevo usuario o devolver un usuario existente si ya existe
app.post('/api/users', (req, res) => {
  const { username } = req.body; // Extrae el nombre de usuario del cuerpo de la solicitud

  // Busca un usuario en la base de datos con el nombre de usuario proporcionado
  User.findOne({ username: username }).then((userFind) => {
    if (userFind) return res.json(userFind); // Si el usuario ya existe, devuelve el usuario encontrado

    // Si el usuario no existe, crea un nuevo usuario con el nombre de usuario proporcionado
    const newUser = new User({ username: username });

    // Guarda el nuevo usuario en la base de datos y devuelve el usuario guardado
    newUser.save().then((savedUser) => {
      res.json(savedUser);
    }).catch((err) => res.json(err)); // Si hay un error, devuelve el error
  }).catch((err) => res.json(err)); // Si hay un error, devuelve el error
});

// Ruta GET para obtener todos los usuarios registrados en la base de datos
app.get('/api/users', (req, res) => {
  User.find().then((users) => {
    if (users) return res.json(users); // Si se encuentran usuarios, devuelve la lista de usuarios
  }).catch((err) => res.json(err)); // Si hay un error, devuelve el error
});

// Ruta POST para agregar un ejercicio a un usuario específico
app.post('/api/users/:_id/exercises', (req, res) => {
  let { description, duration, date } = req.body; // Extrae la descripción, duración y fecha del cuerpo de la solicitud
  const { _id } = req.params; // Extrae el ID del usuario de los parámetros de la URL

  // Busca el usuario por su ID en la base de datos
  User.findById(_id).then((user) => {
    if (!user) return res.json("Error"); // Si no se encuentra el usuario, devuelve un error

    // Crea un nuevo ejercicio con los datos proporcionados
    const newExercise = new Exercise({
      username: user._id, // Asocia el ejercicio con el ID del usuario
      description: description,
      duration: duration,
      date: date ? new Date(date) : new Date() // Si no se proporciona una fecha, usa la fecha actual
    });

    // Guarda el nuevo ejercicio en la base de datos
    newExercise.save().then((savedExercise) => {
      // Devuelve los detalles del ejercicio junto con la información del usuario
      res.json({
        _id: user._id,
        username: user.username,
        date: savedExercise.date.toDateString(), // Convierte la fecha a un formato legible
        duration: savedExercise.duration,
        description: savedExercise.description
      });
    }).catch((err) => res.json(err)); // Si hay un error, devuelve el error

  }).catch((err) => res.json(err)); // Si hay un error, devuelve el error
});

// Ruta GET para obtener el registro de ejercicios de un usuario específico
app.get('/api/users/:_id/logs', (req, res) => {
  const user_id = req.params._id; // Extrae el ID del usuario de los parámetros de la URL
  let { from, to, limit } = req.query; // Extrae los parámetros de consulta 'from', 'to' y 'limit'

  limit = limit ? parseInt(limit) : null; // Convierte 'limit' a un número entero si está presente

  const filter = { username: user_id }; // Filtro para buscar ejercicios asociados al usuario

  // Si se proporcionan 'from' o 'to', se agregan al filtro para buscar ejercicios dentro de un rango de fechas
  if (from || to) {
    filter.date = {};

    if (from) filter.date.$gte = new Date(from); // Fecha mayor o igual a 'from'
    if (to) filter.date.$lt = new Date(to); // Fecha menor que 'to'
  }

  // Busca el usuario por su ID en la base de datos
  User.findById(user_id).then(user => {
    if (!user) return res.json("Error"); // Si no se encuentra el usuario, devuelve un error

    // Busca los ejercicios que coincidan con el filtro
    Exercise.find(filter).then(exercises => {
      if (limit) exercises = exercises.slice(0, limit); // Limita el número de ejercicios si se proporciona 'limit'

      // Construye la respuesta con la información del usuario y los ejercicios encontrados
      const response = {
        _id: user._id,
        username: user.username,
        count: exercises.length, // Número de ejercicios encontrados
      };

      // Si se proporciona 'from', se agrega a la respuesta
      if (from) response.from = new Date(from).toDateString();
      // Si se proporciona 'to', se agrega a la respuesta
      if (to) response.to = new Date(to).toDateString();

      // Agrega el registro de ejercicios a la respuesta
      response.log = exercises.map(e => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString() // Convierte la fecha a un formato legible
      }));

      res.json(response); // Devuelve la respuesta

    }).catch((err) => console.log({ "Exercise error": err })) // Si hay un error, lo registra en la consola
  }).catch((err) => console.log({ "User error": err })) // Si hay un error, lo registra en la consola
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
