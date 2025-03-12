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

app.use(express.urlencoded({
  extended: true
}));

mongoose.connect('mongodb://127.0.0.1:27017/freecodecamp-projects');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true }
})

let User = mongoose.model('User', userSchema)

const exerciseSchema = new mongoose.Schema({
  username: { type: mongoose.Schema.Types.ObjectId, ref: User },
  description: { type: String },
  duration: { type: Number },
  date: { type: Date }
})

let Exercise = mongoose.model('Exercise', exerciseSchema)

app.post('/api/users', (req, res) => {
  const { username } = req.body

  User.findOne({ username: username }).then((userFind) => {
    if (userFind) return res.json(userFind)
    const newUser = new User({ username: username })
    newUser.save().then((savedUser) => {
      res.json(savedUser)
    }).catch((err) => res.json(err))
  }).catch((err) => res.json(err))
})

app.get('/api/users', (req, res) => {
  User.find().then((users) => {
    if (users) return res.json(users)
  }).catch((err) => res.json(err))
})

app.post('/api/users/:_id/exercises', (req, res) => {
  let { description, duration, date } = req.body
  const { _id } = req.params

  User.findById(_id).then((user) => {
    if (!user) return res.json("Error")

    const newExercise = new Exercise({
      username: user._id,
      description: description,
      duration: duration,
      date: date ? new Date(date) : new Date()
    })

    newExercise.save().then((savedExercise) => {
      res.json({
        _id: user._id,
        username: user.username,
        date: savedExercise.date.toDateString(),
        duration: savedExercise.duration,
        description: savedExercise.description
      })
    }).catch((err) => res.json(err))

  }).catch((err) => res.json(err))
})

app.get('/api/users/:_id/logs', (req, res) => {
  const user_id = req.params._id
  let { from, to, limit } = req.query

  limit = limit ? parseInt(limit) : null

  const filter = { username: user_id }

  if (from || to) {
    filter.date = {}

    if (from) filter.date.$gte = new Date(from)
    if (to) filter.date.$lt = new Date(to)
  }

  User.findById(user_id).then(user => {
    if (!user) return res.json("Error")
    Exercise.find(filter).then(exercises => {
      if (limit) exercises = exercises.slice(0, limit)
      const response = {
        _id: user._id,
        username: user.username,
        count: exercises.length,
      }

      if (from) response.from = new Date(from).toDateString()
      if (to) response.to = new Date(to).toDateString()

      response.log = exercises.map(e => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString()
      }))

      res.json(response)

    }).catch((err) => console.log({ "Exercise error": err }))
  }).catch((err) => console.log({ "User error": err }))
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
