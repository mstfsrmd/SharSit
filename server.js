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
  database: 'usersinfo'
});
const con2 = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'Mo137777',
  database: 'contents'
});
con1.connect(function (err) {
  if (err) throw err;
  console.log('Connected to Database1');
})
con2.connect(function (err) {
  if (err) throw err;
  console.log('Connected to Database2');
})

//creating user info table
var table = 'CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY,username  VARCHAR(255) NOT NULL, email MEDIUMTEXT NOT NULL, password VARCHAR(255) NOT NULL, fname VARCHAR(255), lname VARCHAR(255) , bio VARCHAR(100)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci';
con1.query(table,function (err, res) {
  if (err) {
    throw err;
  }
  console.log(res);
})


//use other folders
app.use(express.static('public'));
app.use(express.static('src'));

//code generator
function codeGenerator() {
  var a = Math.round(Math.random()*10);
  var b = Math.round(Math.random()*10);
  var c = Math.round(Math.random()*10);
  var d = Math.round(Math.random()*10);
  var e = Math.round(Math.random()*10);
  var code = a+''+b+''+c+''+d+''+e;
  return code;
}


//define an array for storing socket id
var id = {};

//socket connection
io.on('connection', function (socket) {
  console.log('A user connected');

  //search if user have account or not
  socket.on('onusrname', function (onusrname) {
    var isAcount = 'SELECT * FROM users WHERE username LIKE "%'+onusrname+'"';
    con1.query(isAcount, function (err, res) {
      if (err) {
        throw err
      }
      var isUsr
      if (res != '') {
        isUsr = 'User Exists'
      }else {
        isUsr = ''
      }
      socket.emit('isUsr', isUsr);
    })
  })

  socket.on('usrinfo', function (usrinfo) {
    var username = usrinfo.usrname;
    var useremail = usrinfo.email;
    var userpass = usrinfo.pass;

    //store socket id in array
    id[username] = socket.id;
    id[socket.id] = username;
    console.log(id);

    //insert information to database if email confirmed
    socket.on('emailIsOk',function (emailIsOk) {
      var insertinfo = 'INSERT INTO users (username, email, password) VALUES ("'+username+'", "'+useremail+'", "'+userpass+'")';
      con1.query(insertinfo, function (err, res) {
        if (err) {
          throw err;
        }
        console.log(res);
      })
    });

//_____________________________________________________________________________
    //sending Authentication email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mostafasarmad96@gmail.com',
        pass: 'm09370030491'
      }
    });
    var gen = codeGenerator();
    id[usrinfo.usrname] = gen;
    console.log(id);
    const mailOptions = {
      from: 'mostafasarmad96@gmail.com',
      to: useremail ,
      subject: 'Authentication Email From SharSit',
      text: 'Hi! your code is '+ gen
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
	       console.log(error);
       } else {
         console.log('Email sent: ' + info.response);
         console.log(id);
         socket.emit('id', id);
       }
    });
  });
//_____________________________________________________________________________


  //update user data
  socket.on('otherinfo', function (otherinfo) {
    var usr = otherinfo.usr;
    var fname = otherinfo.fname;
    var lname = otherinfo.lname;
    var bio = otherinfo.bio;
    //record datas
    var updateprof = 'UPDATE users SET fname = "'+fname+'", lname="'+lname+'", bio="'+bio+'" WHERE username="'+usr+'"';
    con1.query(updateprof, function (err, res) {
      if (err) {
        throw err
      }
      console.log(res);
    });
    var up = 'SELECT * FROM users WHERE username="'+usr+'"';
    con1.query(up, function (err, res) {
      if (err) {
        throw err
      }
      console.log(res);
    });
  });

  //usr disconnection
  socket.on("disconnect", function (dis) {
    console.log('a usr disconnected.');
  });
});
























//upload a file
