'use strict';

var express = require('express'),
  session =   require('express-session'),
  config =    require('./config/environment'),
  files = require('./files/files'),
  fs = require('fs'),
  http = require('http'),
  morgan =    require('morgan'),
  app = express(),
  request = require('sync-request'),
  port = process.env.PORT || 3000,
  multer  = require('multer'),
  path = require('path'),
  moment = require('moment'),
  RedisStore =require('connect-redis')(session),
  redisClient = require('redis').createClient({host: 'memories_redis'}),
  directory = __dirname;

  redisClient.set("TEST", moment().format());

  app.set('views', directory + '/./views');
  app.set('view engine', 'pug');
  app.use(express.static(directory + '/./public'));

  var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    files.createUploadFolder(directory, req.session.id);
    cb(null, directory + '/./files/' + req.session.id + '/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

 app.use(morgan('combined'));
 app.use(session({
      store: new RedisStore({
      host: 'memories_redis'
     }),
     secret: '1a5dw67U75tN',
     cookie: { maxAge: 600000 * 5 }, // 1 hours
     resave: true,
     saveUninitialized: true,
     proxy: true
 }));

// var upload = multer({ storage : storage }).single('file');

app.get('/', function (req, res) {
    // always start again with session on initial page
    req.session.regenerate(function(err) {

      var data = request('GET', config.restURL + '/soldier/_search');

      var json = JSON.parse(data.body);
      console.log('data : ' + JSON.stringify(json.hits.hits));


      res.render('index', { title: 'Macclesfield Remembrance Project', data: JSON.stringify(json.hits.hits)});

    });

});

app.use(function(err, req, res, next){
    console.log('/handleError');
    console.log(err);
    res.status(500).send('TECHNICAL_ERROR');
});

app.listen(config.port);

console.log('Map interface running on port: ' + config.port);
