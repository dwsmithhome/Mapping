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
  redisClient = require('redis').createClient({host: 'mapping_redis'}),
  directory = __dirname;

  redisClient.set("TEST", moment().format());

  app.set('views', directory + '/./views');
  app.set('view engine', 'pug');
  app.use(express.static(directory + '/./public/'));
  app.use(express.static(directory + '/./public/icons/'));
  app.use(express.static(directory + '/./public/audio/'));
  app.use(express.static(directory + '/./public/photo/'));
  app.use(express.static(directory + '/./public/video/'));

  var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    files.createUploadFolder(directory, req.session.id);
    cb(null, directory + '/./files/' + req.session.id + '/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer();

 app.use(morgan('combined'));
 app.use(session({
      store: new RedisStore({
      host: 'mapping_redis'
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

    files.createUploadFolder(directory, 'photo');
    files.createUploadFolder(directory, 'audio');
    files.createUploadFolder(directory, 'video');

    binddata(res, false);

  });
});

function binddata(res, added)
{
  var data = request('GET', config.restURL + '/datapoint/_search');
  var json = JSON.parse(data.body);
  var message = '"-"';

  if(added)
  {
    message = '"your memory has been submitted and will appear on the map shortly."';
  }

  if(json.hits != undefined)
  {
    if(json.hits.hits != undefined)
    {
      res.render('index', { title: 'Macclesfield Town Council', data: JSON.stringify(json.hits.hits), message: message });
    }
    else {
      res.render('index', { title: 'Macclesfield Town Council', data: '[]', message: message });
    }
  }
  else {
    res.render('index', { title: 'Macclesfield Town Council', data: '[]', message: message });
  }

}

app.post('/postitem', upload.none(), function (req, res, next) {

  var response = request('POST', config.restURL + '/datapoint/Story', {
  json: {
          "name": req.body.name,
          "type": req.body.pointType,
          "address": req.body.address,
          "description": req.body.description,
          "postcode": req.body.postcode,
          "location": {
              "lat": parseFloat(req.body.lat),
              "lon": parseFloat(req.body.lng)
        } },
  });


  var details = JSON.parse(response.getBody('utf8'));
  var folderid = details._id;

  binddata(res, true);

});

app.use(function(err, req, res, next){
    console.log('/handleError');
    console.log(err);
    res.status(500).send('TECHNICAL_ERROR');
});

app.listen(config.port);

console.log('Map interface running on port: ' + config.port);
