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
http.listen(process.env.PORT || 8080, function () {
  console.log('Server is ready');
});

//database connection
console.log('Connecting to databases...');
const con = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'Mo137777'
});
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
var conSp;

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

    //conifigure user databases
    socket.on('emailIsOk',function (emailIsOk) {
      var u = emailIsOk.storedUsername;
      var e = emailIsOk.storedEmail;
      var p = emailIsOk.storedPass;
      var insertinfo = 'INSERT INTO users (username, email, password) VALUES ("'+u+'", "'+e+'", "'+e+'")';
      var createUserDB = 'CREATE DATABASE '+u+'';
      var createUserPostDB = 'CREATE DATABASE '+u+'Post';
      var postId = 'CREATE TABLE IF NOT EXISTS '+u+'postId (id INT AUTO_INCREMENT PRIMARY KEY, content TEXT, datetime DATETIME, likeing INT, replying INT, clicking INT)';
      var flwrs = 'CREATE TABLE IF NOT EXISTS '+u+'follower (id INT AUTO_INCREMENT PRIMARY KEY, username TEXT, datetime DATETIME)';
      var flwng = 'CREATE TABLE IF NOT EXISTS '+u+'following (id INT AUTO_INCREMENT PRIMARY KEY, username TEXT, datetime DATETIME)';
      var rooms = 'CREATE TABLE IF NOT EXISTS '+u+'room (id INT AUTO_INCREMENT PRIMARY KEY, room TEXT, datetime DATETIME)';
      con.connect(function (err) {
        if (err) throw err;
        console.log('connection for creating new databases success');
      });
      console.log("Creating Database "+u+"...");
      con.query(createUserDB, function (err, r) {
        if (err) {
          throw err;
        }
        console.log("Database "+u+" created");
      });
      console.log("Creating Database "+u+"Post...");
      con.query(createUserPostDB, function (err, r) {
        if (err) {
          throw err;
        }
        console.log("Database "+u+"Post created");
      });
      var conSp = mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'Mo137777',
        database: u
      });
      setTimeout(function () {
        conSp.query(postId,function (err, r) {
          if (err) {
            throw err;
          }
          console.log('table '+u+'postId created');
        });
        conSp.query(flwrs,function (err, r) {
          if (err) {
            throw err;
          }
          console.log('table '+u+'follower created');
        });
        conSp.query(flwng,function (err, r) {
          if (err) {
            throw err;
          }
          console.log('table '+u+'following created');
        });
        conSp.query(rooms,function (err, r) {
          if (err) {
            throw err;
          }
          console.log('table '+u+'room created');
        });
      },2000);
      con1.query(insertinfo, function (err, r) {
        if (err) {
          throw err;
        }
      });
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
    });
  });

  //login proccess
  socket.on('loginCheck',function (loginCheck) {
    var loginusr = loginCheck.loginusr;
    var loginpass = loginCheck.loginpass;
    var logCh = 'SELECT * FROM users WHERE username="'+loginusr+'" AND password="'+loginpass+'"';
    con1.query(logCh, function (err, res) {
      if (err) {
        throw err;
      }
      var f = res.map(res => res.fname)[0];
      var l = res.map(res => res.lname)[0];
      var b = res.map(res => res.bio)[0];
      var u = res.map(res => res.username)[0];
      if (res == '') {
        var checkRes = 'Your username or password is incorrect!';
        socket.emit('checkRes', {checkRes, f, l, b});
      }else {
        var checkRes = 'ok';
        socket.emit('checkRes', {checkRes, f, l, b, u});
      }
    });
  });


  //recording post
  var lastId;
  socket.on('post', function (post) {
    var content = post.content;
    var datetime = post.datetime;
    var u = post.storedUsername;
    conSp = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: u
    });
    //record post as postId
    var intop = 'INSERT INTO '+u+'postId (content, datetime) VALUES ("'+content+'", "'+datetime+'")';
    conSp.query(intop, function (err, res) {
      if (err) {
        console.log('bug');
        throw err;
      }
      lastId = res.insertId;
      thisPostId = u+'_'+lastId;
      socket.join(u);
      io.to(u).emit('post', {content, datetime, u, thisPostId});
    })
    conSpI = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: u+'Post'
    });
    setTimeout(function () {
      var createPostTable = 'CREATE TABLE IF NOT EXISTS '+thisPostId+' (id INT AUTO_INCREMENT PRIMARY KEY, liker VARCHAR(255), datetime DATETIME, likes VARCHAR(255), replys TEXT, clicks VARCHAR(255))';
      conSpI.query(createPostTable, function (err, res) {
        if (err) {
          throw err;
        }
        console.log(lastId);
        console.log(res);
      });
    },2000)
  })

  //usr disconnection
  socket.on("disconnect", function (dis) {
    console.log('a usr disconnected.');
  });
});




/*----------------Under Construction--------------------------------------------

//joining all folloing rooms

var jr = 'SELECT username FROM '+u+'following';
var conSp = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'Mo137777',
  database: u
});
conSp.query(jr, function (err, res) {
  if (err) {
    throw err
  }
  var flwng = res.map(res=>res.username);
  for (var i = 0; i < flwng.length; i++) {
    socket.join(flwng[i]);
    var fp = 'SELECT content, datetime FROM '+flwng[i]+'postId';
    conSp.query(jr, function (err, res) {
      if (err) {
        throw err
      }

    }
  }
})*/


















//upload a file
