const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const shortid = require("shortid")
const cors = require('cors')

const mongoose = require('mongoose')
//mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//local storage

const users=[];
const exercises=[]


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/exercise/new-user", (req, res)=>{
  const newUser = {
    username: req.body.username,
    _id: shortid.generate()
  }
  users.push(newUser)
  res.json(newUser)
})

app.get("/api/exercise/users", (req,res)=>{
  res.json(users)
})

app.post("/api/exercise/add", (req,res)=>{
    
    const findUser = users.filter(user=>{
      
      return user._id == req.body.userId
    })
   
    
    
    const _id = req.body.userId;
    const description = req.body.description;
    const duration = parseInt(req.body.duration);
    const date = req.body.date
      ? new Date(req.body.date).toDateString()
      : new Date().toDateString();
    const username = findUser[0].username
    
    
    if (findUser.length === 0) {
      res.json({ error: "User ID not registered, please create a new user" });
    }
    const newExercise =({
      _id,
      description,
      duration,
      date,
      username
    });
    exercises.push(newExercise);
   
    res.json(newExercise)
  
  })

app.get("/api/exercise/log", (req, res) => {
  const { userId, from, to, limit } = req.query;
  let newLog= exercises.filter(exercise=>{
    return exercise._id === userId
  })
      

      if (from && new Date(from) !== undefined && from !== undefined) {
        newLog = newLog.filter(item => {
          
          return new Date(item.date) >= new Date(from);
        });
      }
      
      
      
      if (to && new Date(to) !== undefined && to !== undefined) {
        newLog = newLog.filter(item => {
          
          return new Date(item.date) <= new Date(to);
        });
      }
  
      

      if (limit && Number(limit) !== NaN) {
        newLog = newLog.slice(0, Number(limit));
      }
      
      
      let log = ({
        userId: userId,
        username: exercises[0].username,
        count: newLog.length,
        log: newLog.map(item => {
          console.log(item.date, exercises, "hello")
          return {
            description: item.description,
            duration: item.duration,
            date: item.date
          };
        })
      })
      
      res.json(log)
    })

    



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
