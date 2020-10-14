//requests
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const mysql = require('mysql');
const fs = require('fs');
const nodemailer = require('nodemailer');
const io = require('socket.io')(http);
const formidable = require('formidable');
const fileUpload = require('express-fileupload');

//server connection
console.log('Connecting to server...');
http.listen(8080, function () {
  console.log('Server is ready');
});

//database connection
console.log('Connecting to databases...');
const con1 = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'Mo137777',
  db: 'usersinfo'
});
const con2 = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'Mo137777',
  db: 'contents'
});
con1.connect(function (err) {
  if (err) throw err;
  console.log('Connected to Database1');
})
con2.connect(function (err) {
  if (err) throw err;
  console.log('Connected to Database2');
})

//use other folders
app.use(express.static('public'));
app.use(express.static('src'));

//socket connection
io.on('connection', function (socket) {
  console.log('A user connected');

  socket.on('usrinfo', function (usrinfo) {
    console.log(usrinfo.usrname);
    console.log(usrinfo.email);
    console.log(usrinfo.pass);
    console.log(usrinfo.rpass);
  });

  //usr disconnection
  socket.on("disconnect", function (dis) {
    console.log('a usr disconnected.');
  });
});
























//upload a file
