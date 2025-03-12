const express = require('express')
const app = express()
const cors = require('cors')
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
  date: { type: String }
})

let Exercise = mongoose.model('Exercise', exerciseSchema)

app.post('/api/users', (req, res) => {
  const { username } = req.body

  User.findOne({ username: username }).then((userFind) => {
    if (userFind) return res.json(userFind)
    const newUser = new User({ username: username })
    newUser.save().then((savedUser) => {
      res.json(savedUser)
    }).catch((err) => {
      res.json("error")
    })
  }).catch((err) => {
    res.json("Error")
  })
})

app.get('/api/users', (req, res) => {
  User.find().then((users) => {
    if (users) return res.json(users)
  }).catch((err) => {
    res.json("Error")
  })
})

app.post('/api/users/:_id/exercises', (req, res) => {
  let { description, duration, date } = req.body
  const { _id } = req.params

  date = new Date(date).toDateString()

  User.findById(_id).then((user) => {
    if (!user) return res.json("Error")

    const newExercise = new Exercise({
      username: user._id,
      description: description,
      duration: duration,
      date: date
    })

    newExercise.save().then((savedExercise) => {
      return Exercise.findById(savedExercise._id).populate('username', 'username')
    }).then((populatedExercise) => {
      res.json({
        _id: populatedExercise._id,
        username: populatedExercise.username.username,
        date: populatedExercise.date,
        duration: populatedExercise.duration,
        description: populatedExercise.description
      })
    }).catch((err) => {
      res.json("error")
    })
  }).catch((err) => {
    res.json("Error")
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  const user_id = req.params._id
  const { from, to, limit } = req.query

  User.findById(user_id).select('username').then(user => {
    if (!user) return res.json(err)
    Exercise.find({ username: user_id }).then(exercises => {

      res.json({
        username: user.username,
        _id: user._id,
        count: exercises.length,
        log: exercises.map(e => ({
          description: e.description,
          duration: e.duration,
          date: e.date
        }))
      })
    })
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
