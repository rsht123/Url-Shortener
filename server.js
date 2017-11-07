// server.js
// where your node app starts

// init project
var express = require('express');
var mongoose = require('mongoose');
var app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

//Connect Mongoose
var uri = 'mongodb://' + process.env.USER + ':' + process.env.PASS + '@' + process.env.HOST + ':' + process.env.PORT + '/' + process.env.DB;
mongoose.connect(uri)
const db = mongoose.connection;

//Schema
const Schema = mongoose.Schema;
let urlSchema = Schema({full: String, short: String});
mongoose.model('google', urlSchema, 'urls');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

//Base Url
const baseUrl = 'https://url-shortener-freecodecamp.glitch.me/';


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
})


app.get('/new/:url', function(req, res) {
  const re = /(w{3}\.\w+\.\w{2,})/g
  
  let isURL = re.test(req.params.url)
  if(isURL === false) {
    res.json({"error": 'Please enter a valid URL.'})
  } else {
    mongoose.model('google').find({full: req.params.url}, (err, data) => {
      if(err) throw err;
      if(data.length === 0) {
        let num = 0;
        mongoose.model('google').find({}, (err, data) => {
          if(err) throw err;
          num = data.length + 1;
          if(num < 10) {
            num = '000' + num;
          } else if(num < 100) {
            num = '00' + num;
          } else if(num < 1000) {
            num = '0' + num;
          }
          console.log(num);
          let url = {
            "full": req.params.url,
            "short": baseUrl + num
          }
          db.collection('urls').insert(url);
          res.redirect('/new/' + req.params.url);
        })
        
        
      } else {
        res.json(data);
      }
    })
  }
})


app.get('/:num', (req, res) => {
  let num = req.params.num;
  console.log(num);
  mongoose.model('google').findOne({short: baseUrl + num}, (err, obj) => {
    if(err) {
      console.log(err);
    }
    if(obj === null) {
      res.json({"error": 'Url not in database.'});
    } else {
      res.redirect('http://' + obj.full);
    }
  })
})


// listen for requests :)
var listener = app.listen(3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
