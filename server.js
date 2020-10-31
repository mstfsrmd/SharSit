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
var table = 'CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY,username  VARCHAR(255) NOT NULL, email MEDIUMTEXT NOT NULL, emailKey TEXT, password VARCHAR(255) NOT NULL, passwordKey TEXT, fname VARCHAR(255), lname VARCHAR(255), bio VARCHAR(100),location VARCHAR(100), certification INT, follower TEXT, following TEXT, profile TEXT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci';
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

//encoding
const list = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@!$%&*_-+=. '.split('');
function encode(name) {
  var main = name.split('');
  var store = name.split('');
  var key = [];
  var rand;
  for (var i = 0; i < main.length; i++) {
    rand = list[Math.round(Math.random()*73)];
    key[i] = list.indexOf(rand) - list.indexOf(store[i]);
    if (key[i]<0) {
      i = i-1;
      continue;
    }
    main[i] = rand;
  }
  var code = main.join('');
  var key = key.join(',');
  return [code, key];
}
//decoding
function decode(code, key) {
  var code = code.split('');
  var key = key.split(',');
  for (var i = 0; i < key.length; i++) {
    var uncode = list.indexOf(code[i]) - key[i];
    code[i] = list[uncode];
  }
  code = code.join('');
  return code;
}

function GetTime() {
  var d = new Date();
  var s = d.getSeconds();
  var m = d.getMinutes();
  var h = d.getHours();
  var day = d.getDate();
  var month = d.getMonth();
  var y = d.getFullYear();
  if (s<10) var s = '0'+d.getSeconds();
  if (m<10) var m = '0'+d.getMinutes();
  if (h<10) var h = '0'+d.getHours();
  if (day<10) var day = '0'+d.getDate();
  if (month<10) var month = '0'+d.getMonth();
  day = day - 1;
  var datetime = y+'-'+month+'-'+day+' '+h+':'+m+':'+s;
  return datetime;
}

var poid = '';
function getstring() {
  const list = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
  for (var i = 0; i < 10; i++) {
    rand = list[Math.round(Math.random()*61)];
    poid = poid + rand;
  }
  return poid;
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
        return console.log(err);
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

    //get profile pic
    socket.on('profilePic', function (file) {
      socket.emit('profilePic', file);
    });


    //conifigure user databases
    socket.on('emailIsOk',function (emailIsOk) {
      var u = emailIsOk.storedUsername;
      var e = emailIsOk.storedEmail;
      var p = emailIsOk.storedPass;
      var enE = encode(e);var enP = encode(p);
      var codeE = enE[0]; var codeP = enP[0];
      var keyE = enE[1]; var keyP = enP[1];
      var tzRe = /\(([\w\s]+)\)/; // Look for "(", any words (\w) or spaces (\s), and ")"
      var d = new Date().toString();
      var userlocation = tzRe.exec(d)[1].replace(' Standard Time', '');
      var insertinfo = 'INSERT INTO users (username, email, emailKey, password, passwordKey, certification ,follower, following, location) VALUES ("'+u+'", "'+codeE+'", "'+keyE+'", "'+codeP+'", "'+keyP+'", "0", "0", "0", "'+userlocation+'")';
      var createUserDB = 'CREATE DATABASE '+u+' CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci';
      var createUserPostDB = 'CREATE DATABASE '+u+'Post CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci';
      var postId = 'CREATE TABLE IF NOT EXISTS '+u+'postId (id INT AUTO_INCREMENT PRIMARY KEY, content TEXT, datetime DATETIME, likeing INT, replying INT, clicking INT, postId TEXT, author VARCHAR(255) default "'+u+'", image TEXT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;';
      var flwrs = 'CREATE TABLE IF NOT EXISTS '+u+'follower (id INT AUTO_INCREMENT PRIMARY KEY, username TEXT, datetime DATETIME) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;';
      var flwng = 'CREATE TABLE IF NOT EXISTS '+u+'following (id INT AUTO_INCREMENT PRIMARY KEY, username TEXT, datetime DATETIME) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;';
      var rooms = 'CREATE TABLE IF NOT EXISTS '+u+'room (id INT AUTO_INCREMENT PRIMARY KEY, room TEXT, datetime DATETIME) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;';
      var blocked = 'CREATE TABLE IF NOT EXISTS '+u+'blocked (id INT AUTO_INCREMENT PRIMARY KEY, blockingUsr VARCHAR(255), datetime DATETIME) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;';
      var blocking = 'CREATE TABLE IF NOT EXISTS '+u+'blocking (id INT AUTO_INCREMENT PRIMARY KEY, blockedUsr VARCHAR(255), datetime DATETIME) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;';
      var like = 'CREATE TABLE IF NOT EXISTS '+u+'like (id INT AUTO_INCREMENT PRIMARY KEY, postId TEXT, datetime DATETIME, author VARCHAR(255)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;';
      var reply = 'CREATE TABLE IF NOT EXISTS '+u+'reply (id INT AUTO_INCREMENT PRIMARY KEY, postId TEXT, datetime DATETIME, author VARCHAR(255), hasLike INT, RpostId text) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;';
      var save = 'CREATE TABLE IF NOT EXISTS '+u+'save (id INT AUTO_INCREMENT PRIMARY KEY, postId TEXT, datetime DATETIME, author VARCHAR(255), hasLike INT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;';
      var click = 'create table '+u+'click (id int auto_increment PRIMARY KEY,userclicked varchar(255) null,postId text null,number int default 1 null)'
      con.connect(function (err) {
        if (err) return console.log(err);
        console.log('connection for creating new databases success');
      });
      console.log("Creating Database "+u+"...");
      con.query(createUserDB, function (err, r) {
        if (err) {
          return console.log(err);
        }
        console.log("Database "+u+" created");
      });
      console.log("Creating Database "+u+"Post...");
      con.query(createUserPostDB, function (err, r) {
        if (err) {
          return console.log(err);
        }
        console.log("Database "+u+"Post created");
      });
      con1.query(insertinfo, function (err, r) {
        if (err) {
          return console.log(err);
        }else {
          console.log('information inserted');
        }
      var conSp = mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'Mo137777',
        database: u
      });
      setTimeout(function () {
        conSp.query(postId,function (err, r) {
          if (err) {
            return console.log(err);
          }
          console.log('table '+u+'postId created');
        });
        conSp.query(flwrs,function (err, r) {
          if (err) {
            return console.log(err);
          }
          console.log('table '+u+'follower created');
        });
        conSp.query(flwng,function (err, r) {
          if (err) {
            return console.log(err);
          }
          console.log('table '+u+'following created');
        });
        conSp.query(rooms,function (err, r) {
          if (err) {
            return console.log(err);
          }
          console.log('table '+u+'room created');
        });
        conSp.query(blocked,function (err, r) {
          if (err) {
            return console.log(err);
          }
          console.log('table '+u+'blocked created');
        });
        conSp.query(blocking,function (err, r) {
          if (err) {
            return console.log(err);
          }
          console.log('table '+u+'blocking created');
        });
        conSp.query(like,function (err, r) {
          if (err) {
            return console.log(err);
          }
          console.log('table '+u+'like created');
        });
        conSp.query(reply,function (err, r) {
          if (err) {
            return console.log(err);
          }
          console.log('table '+u+'reply created');
        });
        conSp.query(save,function (err, r) {
          if (err) {
            return console.log(err);
          }
          console.log('table '+u+'save created');
        });
        conSp.query(click,function (err, r) {
          if (err) {
            return console.log(err);
          }
          console.log('table '+u+'click created');
        });
      },2000);
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
      from: 'info@SharSit.com',
      to: useremail ,
      subject: 'Authentication Email From SharSit',
      text: 'Hi! your code is <b>'+gen+'</b>'
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


  socket.on('setProfile', function (data) {
    var pic = data.src;
    var usrpic = data.storedUsername;
    var insertprof = 'UPDATE users SET profile = "'+pic+'" WHERE username = "'+usrpic+'"';
    con1.query(insertprof, function (errpr) {
      if (errpr) return console.log(errpr);
      console.log('inserted profile pic to database successfull');
    });
  });
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
    var decP; var loginpass;
    var u; var f;
    var l; var c;
    var givenloginpass = loginCheck.loginpass;
    id[loginusr] = socket.id;
    id[socket.id] = loginusr;
    console.log(id);
    var dec = 'SELECT * FROM users WHERE username=?';
    con1.query(dec,loginusr, function (err, res) {
      if (err) return console.log(err);
      f = res.map(res => res.fname)[0];
      l = res.map(res => res.lname)[0];
      var b = res.map(res => res.bio)[0];
      u = res.map(res => res.username)[0];
      c = res.map(res => res.certification)[0];
      var fr = res.map(res => res.follower)[0];
      var fg = res.map(res => res.following)[0];
      var src = res.map(res => res.profile)[0];
      if (res == '') {
        var checkRes = 'Your username or password is incorrect!';
        socket.emit('checkRes', {checkRes, f, l, b, c, fr, fg, src});
      }else {
        loginpasskey = res.map(res => res.passwordKey)[0];
        loginpass = res.map(res => res.password)[0];
        loginpass = decode(loginpass, loginpasskey);
        if (loginpass != givenloginpass) {
          var checkRes = 'Your username or password is incorrect!';
          socket.emit('checkRes', {checkRes, f, l, b, c, fr, fg, src});
        }else {
          var checkRes = 'ok';
          socket.emit('checkRes', {checkRes, f, l, b, u, c, fr, fg, src});
          //reading user and followings posts
          setTimeout(function () {
            if (u) {
              conSp = mysql.createConnection({
                host:'localhost',
                user:'root',
                password:'Mo137777',
                database: u
              });
              //selecting following users
              var statement = '';
              var flgpst = 'SELECT username FROM '+u+'following'
              conSp.query(flgpst, function (err, resu) {
                if(err) console.log(err.message);
                if (resu != '') {
                  var resu = resu.map(resu => resu.username);
                  for (var i = 0; i < resu.length; i++) {
                    statement = statement + ' UNION ALL SELECT content, datetime, likeing, replying, author, postId, image FROM '+resu[i]+'.'+resu[i]+'postId ';
                  }
                  statement = statement +' ORDER BY datetime ';
                }
              })
              setTimeout(function () {
                var ff = [], ll = [], cc = [], lik = [], ss = [];
                var logpost = 'SELECT content,datetime, likeing, replying, author, postId, image FROM '+u+'.'+u+'postId'+ statement;
                conSp.query(logpost, function (err, res) {
                  if (err) return console.log(err.message);
                  //get username of post author
                  u = res.map(res => res.author);
                  var iNfO = [];
                  for (var i = 0; i < u.length; i++) {
                    var getFL = 'SELECT * FROM users WHERE username = "'+u[i]+'"';
                    con1.query(getFL, function (err, resF) {
                      if (err) console.log(err.message);
                      iNfO.push(resF);
                    });
                  }
                  setTimeout(function () {
                    var fff;
                    for (var i = 0; i < u.length; i++) {
                      fff = iNfO[i];
                      ff.push(fff.map(fff => fff.fname));
                      ll.push(fff.map(fff => fff.lname));
                      cc.push(fff.map(fff => fff.certification));
                      ss.push(fff.map(fff => fff.profile));
                    };
                    u = res.map(res => res.author);
                    var p = res.map(res => res.content);
                    var d = res.map(res => res.datetime);
                    var lk = res.map(res => res.likeing);
                    var rp = res.map(res => res.replying);
                    var pi = res.map(res => res.postId);
                    var im = res.map(res => res.image);
                    //check whiche post is liked by me
                    conSpLike = mysql.createConnection({
                      host:'localhost',
                      user:'root',
                      password:'Mo137777',
                      database: loginusr
                    });
                    var isLike = [];
                    for (var i = 0; i < pi.length; i++) {
                      var isliker = 'SELECT * FROM '+loginusr+'like WHERE postId = "'+pi[i]+'"';
                      conSpLike.query(isliker, function (err0, isLikeRes) {
                        if (err0) return console.log(err0);;;
                        isLikeRes = isLikeRes.map(isLikeRes => isLikeRes.author);
                        if (isLikeRes == '') {
                          isLike.push(false);
                        }else {
                          isLike.push(true);
                        }
                      });
                    }
                    setTimeout(function () {
                      socket.emit('postload', {im, p, d, lk, rp, u, ff, ll, cc, pi, isLike, ss});
                    }, 50);
                  },1000);
                })
                // joining all following rooms
                socket.join(u);
                var jroom = 'SELECT * FROM '+u+'room';
                conSp.query(jroom, function (err, res) {
                  if (err) throw err;
                  var j = res.map(res => res.room);
                  for (var i = 0; i < j.length; i++) {
                    socket.join(j[i]);
                  }
                })
              },100);
            }
          }, 100);
        }
      }
    });

  });

  //go to time line
  socket.on('goTime', function (tIme) {
    var rooM = tIme.rooM;
    var u = tIme.storedUsername;
    var f; var l; var c;
    if (rooM) {
      for (var i = 0; i < rooM.length; i++) {
        socket.leave(rooM[i]);
        console.log('leaving '+rooM[i]);
      }
    }
    var decP; var loginpass;
    //reading user and followings posts
    conSp = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: u
    });
      var jroom = 'SELECT * FROM '+u+'room';
      conSp.query(jroom, function (err, res) {
        if (err) throw err;
        var j = res.map(res => res.room);
        for (var i = 0; i < j.length; i++) {
          socket.join(j[i]);
        }
      });
      //selecting following users
      var statement = '';
      var flgpst = 'SELECT username FROM '+u+'following'
      conSp.query(flgpst, function (err, resu) {
        if(err) console.log(err.message);
        if (resu != '') {
          var resu = resu.map(resu => resu.username);
          for (var i = 0; i < resu.length; i++) {
            statement = statement + ' UNION ALL SELECT content, datetime, likeing, replying, author, postId, image FROM '+resu[i]+'.'+resu[i]+'postId ';
          }
          statement = statement +' ORDER BY datetime ';
        }
      });
      //get all posts
      setTimeout(function () {
        var ff = [], ll = [], cc = [], ss = [];
        var logpost = 'SELECT content,datetime, likeing, replying, author, postId, image FROM '+u+'.'+u+'postId'+ statement;
        conSp.query(logpost, function (err, res) {
          if (err) console.log('err');
          //get name of post author
          usr = res.map(res => res.author);
          var iNfO = [];
          for (var i = 0; i < usr.length; i++) {
            var getFL = 'SELECT * FROM users WHERE username = "'+usr[i]+'"';
            con1.query(getFL, function (err, resF) {
              if (err) console.log(err.message);
              iNfO.push(resF);
            });
          }

          setTimeout(function () {
            var fff;
            for (var i = 0; i < usr.length; i++) {
              fff = iNfO[i];
              ff.push(fff.map(fff => fff.fname));
              ll.push(fff.map(fff => fff.lname));
              cc.push(fff.map(fff => fff.certification));
              ss.push(fff.map(fff => fff.profile));
            };
            var p = res.map(res => res.content);
            var d = res.map(res => res.datetime);
            var lk = res.map(res => res.likeing);
            var rp = res.map(res => res.replying);
            var pi = res.map(res => res.postId);
            var im = res.map(res => res.image);
            //check whiche post is liked by me
            conSpLikeT = mysql.createConnection({
              host:'localhost',
              user:'root',
              password:'Mo137777',
              database: u
            });
            var isLikeTimeLine = [];
            for (var i = 0; i < pi.length; i++) {
              var islikerT = 'SELECT * FROM '+u+'like WHERE postId = "'+pi[i]+'"';
              conSpLikeT.query(islikerT, function (err0T, isLikeResT) {
                if (err0T) return console.log(err0T);;
                isLikeResT = isLikeResT.map(isLikeResT => isLikeResT.author);
                if (isLikeResT == '') {
                  isLikeTimeLine.push(false);
                }else {
                  isLikeTimeLine.push(true);
                }
              });
            }
            setTimeout(function () {
              var jroom = 'SELECT * FROM '+u+'room';
              conSp.query(jroom, function (err, res) {
                if (err) throw err;
                var j = res.map(res => res.room);
                for (var i = 0; i < j.length; i++) {
                  socket.join(j[i]);
                  console.log('joining to '+ j[i]);
                }
              });
              socket.emit('Timepostload', {im, p, d, lk, rp, usr, ff, ll, cc, pi, isLikeTimeLine, ss});
            }, 50);
          },200);
        })
      },200);

    });

  //go to home
  socket.on('goHome', function (home) {
    var rooM = home.rooM;
    var u = home.storedUsername;
    var f, l, c, s;
    if (rooM) {
      for (var i = 0; i < rooM.length; i++) {
        socket.leave(rooM[i]);
        console.log('leaved '+rooM[i]);
      }
    }
    var dec = 'SELECT * FROM users WHERE username="'+u+'"';
    con1.query(dec, function (err, res) {
      if (err) throw err;
      f = res.map(res => res.fname)[0];
      l = res.map(res => res.lname)[0];
      var b = res.map(res => res.bio)[0];
      u = res.map(res => res.username)[0];
      c = res.map(res => res.certification)[0];
      var fr = res.map(res => res.follower)[0];
      var fg = res.map(res => res.following)[0];
      s = res.map(res => res.profile)[0];
    });
    if (u) {
      conSp = mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'Mo137777',
        database: u
      });
      var logpost = 'SELECT * FROM '+u+'postId';
      conSp.query(logpost, function (err, res) {
        if (err) throw err;
        var p = res.map(res => res.content);
        var d = res.map(res => res.datetime);
        var lk = res.map(res => res.likeing);
        var rp = res.map(res => res.replying);
        var pi = res.map(res => res.postId);
        var im = res.map(res => res.image);
        //check whiche post is liked by me
        var isLikeHome = [];
        for (var i = 0; i < pi.length; i++) {
          var islikerH = 'SELECT * FROM '+u+'like WHERE postId = "'+pi[i]+'"';
          conSp.query(islikerH, function (err0H, isLikeResH) {
            if (err0H) return console.log(err0H);;
            isLikeResH = isLikeResH.map(isLikeResH => isLikeResH.author);
            if (isLikeResH == '') {
              isLikeHome.push(false);
            }else {
              isLikeHome.push(true);
            }
          });
        }
        setTimeout(function () {
          socket.emit('Homepostload', {p, d, lk, rp, u, f, l, c, pi, isLikeHome, s, im});
        }, 50);
      });
      var jroom = 'SELECT * FROM '+u+'room';
      conSp.query(jroom, function (err, res) {
        if (err) throw err;
        var j = res.map(res => res.room);
        for (var i = 0; i < j.length; i++) {
          socket.join(j[i]);
          console.log('joining to '+ j[i]);
        }
      });
    }
  });

  //reading clicked user information
  socket.on('selectedusr', function (selectedusr) {
    var f, l, b, su = selectedusr.sResUser, src;
    var myUsr = selectedusr.storedUsername;
    var c, fr, fg, myflg, loc;
    conSpp = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: myUsr
    });
    var isflg = 'SELECT * FROM '+myUsr+'following';
    conSpp.query(isflg, function (erris, resis) {
      if (erris) console.log(erris.message);
      resis = resis.map(resis => resis.username);
      for (var i = 0; i < resis.length; i++) {
        if (resis[i] == su) {
          myflg = true;
          break;
        }else {
          myflg = false;
        }
      }
    });
    setTimeout(function () {
      var selectedusr = 'SELECT * FROM users WHERE username = "'+su+'"';
      con1.query(selectedusr, function (err, res) {
        if (err) console.log(err.message);
        // joining selected user room
        socket.join(su);
        console.log('joining1 '+su);
        f = res.map(res => res.fname)[0];
        l = res.map(res => res.lname)[0];
        b = res.map(res => res.bio)[0];
        u = res.map(res => res.username)[0];
        c = res.map(res => res.certification)[0];
        fr = res.map(res => res.follower)[0];
        fg = res.map(res => res.following)[0];
        loc = res.map(res => res.location)[0];
        s = res.map(res => res.profile)[0];
        socket.emit('suresult', {f,l, b, c, fr, fg, u, myflg, loc, s});
      });

      //reading selected user post
      setTimeout(function () {
        conSp = mysql.createConnection({
          host:'localhost',
          user:'root',
          password:'Mo137777',
          database: su
        });
        var logpost = 'SELECT * FROM '+su+'postId';
        conSp.query(logpost, function (err, res) {
          if (err) console.log(err.message);;
          var p = res.map(res => res.content);
          var d = res.map(res => res.datetime);
          var lk = res.map(res => res.likeing);
          var rp = res.map(res => res.replying);
          var pi = res.map(res => res.postId);
          var im = res.map(res => res.image);
          //check whiche post is liked by me
          conSpLikeC = mysql.createConnection({
            host:'localhost',
            user:'root',
            password:'Mo137777',
            database: myUsr
          });
          var isLikeSUsr = [];
          for (var i = 0; i < pi.length; i++) {
            var islikerC = 'SELECT * FROM '+myUsr+'like WHERE postId = "'+pi[i]+'"';
            conSpLikeC.query(islikerC, function (err0C, isLikeResC) {
              if (err0C) return console.log(err0C);;
              isLikeResC = isLikeResC.map(isLikeResC => isLikeResC.author);
              if (isLikeResC == '') {
                isLikeSUsr.push(false);
              }else {
                isLikeSUsr.push(true);
              }
            });
          }
          setTimeout(function () {
            socket.emit('Cpostload', {p, d, lk, rp, su, f, l, c, pi, isLikeSUsr, s, im});
          }, 50);
        })
      }, 1000);
    }, 300);
  });

  //leave all unfollow rooms
  socket.on('leave', function (res) {
    for (var i = 0; i < res.length; i++) {
      socket.leave(res[i]);
      console.log('leaving1 '+res[i]);
    }
  });

  //recording post
  var lastId;
  socket.on('post', function (post) {
    var content = post.content, pfname, plname, pcert, psrc;
    var datetime = GetTime(), images = post.all;
    var u = post.storedUsername, image = [];
    var pSId = datetime.replace(' ', '').replace(':','').replace(':','').replace(':','').replace('-','').replace('-','');
    var strng = getstring();
    console.log(strng);
    var thisPostId = u+pSId+strng+'poSt';
    console.log(thisPostId);
    for (var i = 0; i < images.length; i++) {
      image.push(images[i]);
    }
    conSp = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: u
    });
    conSpI = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: u+'Post'
    });
    //get my info
    function RPost(content, datetime, u, thisPostId, image) {
      return new Promise(function(resolve, reject) {
        var ininfo = 'SELECT * FROM users WHERE username="'+u+'"';
        con1.query(ininfo, function (errRi, resRi) {
          if (errRi) {
            reject(errRi);
          }
          pfname = resRi.map(resRi => resRi.fname);
          plname = resRi.map(resRi => resRi.lname);
          pcert = resRi.map(resRi => resRi.certification);
          psrc = resRi.map(resRi => resRi.profile);
          resolve([pfname, plname, pcert, psrc]);
        });
      }).then(function (result) {
        return new Promise(function(resolve, reject) {
          //record post as Id
          var intop = 'INSERT INTO '+u+'postId (content, datetime, likeing, replying, clicking, postId, image) VALUES ("'+content+'", "'+datetime+'", "0", "0", "0", "'+thisPostId+'", "'+image+'")';
          conSp.query(intop, function (errR, resR) {
            if (errR) {
              reject(errR);
            }else {
              resolve();
            }
          });
        }).then(function (result1) {
          return new Promise(function(resolve, reject) {
            var createPostTable = 'CREATE TABLE IF NOT EXISTS '+thisPostId+' (id INT AUTO_INCREMENT PRIMARY KEY, liker VARCHAR(255), datetime DATETIME, likes VARCHAR(255), replys TEXT, clicks VARCHAR(255)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;';
            conSpI.query(createPostTable, function (errRc, resRc) {
              if (errRc) {
                reject(errRc);
              }else {
                resolve();
              }
            });
          }).then(function (result2) {
            var pfname = result[0][0], plname = result[1][0];
            var pcert = result[2][0], psrc = result[3][0];
            io.to(u).emit('post', {pfname, plname, pcert, psrc, content, datetime, u, thisPostId, image});
          });
        });
      });
    }
    RPost(content, datetime, u, thisPostId, image);

  });

  //get post pic
  socket.on('postPic', function (file) {
    socket.emit('postPic', file);
  });

  //record reply
  socket.on('reply', function (data) {
    var rcont = data.content, rdate = data.datetime, replier = data.storedUsername, pId=data.pId, uId=data.uId;
    var rSId = rdate.replace(' ', '').replace(':','').replace(':','').replace(':','').replace('-','').replace('-','');
    var thisReplyId = replier+rSId+getstring()+'rePly', f, l, c, s;
    conSpR = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: replier
    });
    //record reply as Id
    var intor = 'INSERT INTO '+replier+'postId (content, datetime, likeing, replying, clicking, postId) VALUES ("'+rcont+'", "'+rdate+'", "0", "0", "0", "'+thisReplyId+'")';
    conSpR.query(intor, function (errRr, resRr) {
      if (errRr) return console.log(errRr);
      var sl = 'SELECT * FROM users WHERE username = "'+replier+'"'
      con1.query(sl, function (err, res) {
        if (err) return console.log(err);
        else {
          f = res.map(res => res.fname);c = res.map(res => res.certification);
          l = res.map(res => res.lname);
          s = res.map(res => res.profile);
          io.to(replier).emit('reply', {uId, f, l, c, rcont, rdate, replier, thisReplyId, s});
        }
      });
    });
    var intort = 'INSERT INTO '+replier+'reply (postId, datetime, author, RpostId) VALUES ("'+pId+'", "'+rdate+'", "'+uId+'", "'+thisReplyId+'")';
    conSpR.query(intort, function (errRrm, resRrm) {
      if (errRrm) return console.log(errRrm);
    });
    conSpRD = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: replier+'Post'
    });
    var intord = 'CREATE TABLE IF NOT EXISTS '+thisReplyId+' (id INT AUTO_INCREMENT PRIMARY KEY, liker VARCHAR(255), datetime DATETIME, likes VARCHAR(255), replys TEXT, clicks VARCHAR(255)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;';
    conSpRD.query(intord, function (errRrm, resRrm) {
      if (errRrm) return console.log(errRrm);
    });
    conSpI = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: uId
    });
    setTimeout(function () {
      var repn = 'UPDATE '+uId+'postId SET replying = +replying + 1 WHERE postId = "'+pId+'"';
      conSpI.query(repn, function (errRnr, resRnr) {
        if (errRnr) return console.log(errRnr);
      });
    },200)
    conSpID = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: uId+'Post'
    });
    setTimeout(function () {
      var intoauthor = 'INSERT INTO '+pId+' (liker, datetime, replys) VALUES ("'+replier+'", "'+rdate+'", "'+thisReplyId+'")';
      conSpID.query(intoauthor, function (erria, resia) {
        if (erria) return console.log(erria);
      });
    },200)
  });

  //global search
  socket.on("searchRes", function (searchRes) {
    var glsr = 'SELECT * FROM users WHERE username LIKE "%'+searchRes+'%" OR fname LIKE "%'+searchRes+'%" OR lname LIKE "%'+searchRes+'%" ORDER BY certification DESC';
    con1.query(glsr, function (err, res) {
      if (err) throw err;
      if (res != '') {
        var sun = res.map(res => res.username);
        var sfn = res.map(res => res.fname);
        var sln = res.map(res => res.lname);
        var scn = res.map(res => res.certification);
        var ssrc = res.map(res => res.profile);
        socket.emit('sresult', {sun, sfn, sln, scn, ssrc});
      }
    });
  });

  //click on a post
  socket.on('clickedPost', function (result) {
    var postId = result.poId, clicker = result.storedUsername, result = result.poId, datetime = GetTime();
    var userId = result.slice(0,result.indexOf('2')), replier, rdatetime, replyCon, likeR, replyR, datetimeR;
    var mpcontent, mplike, mpdatetime, mpreply;
    var repCon = [];
    conSpGI = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: userId
    });
    //get post replies
    var getpostinfo = 'SELECT * FROM '+userId+'postId WHERE postId = "'+postId+'"';
    conSpGI.query(getpostinfo, function (errpi, respi) {
      if (errpi) return console.log(errpi);
      else {
        mpcontent = respi.map(respi => respi.content)[0];
        mplike = respi.map(respi => respi.likeing)[0];
        mpdatetime = respi.map(respi => respi.datetime)[0];
        mpreply = respi.map(respi => respi.replying)[0];
      }
    });
    conSpGR = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: userId+'Post'
    });
    setTimeout(function () {
      //get post replies
      var getReply = 'SELECT * FROM '+postId+' WHERE replys IS NOT NULL ORDER BY datetime';
      conSpGR.query(getReply, function (err, res) {
        if (err) return console.log(err);
        else {
          replier = res.map(res => res.liker);
          rdatetime = res.map(res => res.datetime);
          replyId = res.map(res => res.replys);
        }
        //record my click in my own database
        conSpGR = mysql.createConnection({
          host:'localhost',
          user:'root',
          password:'Mo137777',
          database: clicker
        });
        setTimeout(function () {
          var meisliker = 'SELECT * FROM '+clicker+'click WHERE postId = "'+postId+'"';
          conSpGR.query(meisliker, function (recorderr, recordres) {
            if (recorderr) return console.log(recorderr);
            else {
              if (recordres != '') {
                var uclicked = 'UPDATE '+clicker+'click SET  number = number + 1 WHERE postId="'+postId+'"';
                conSpGR.query(uclicked, function (isnerr, isnres) {
                  if (isnerr) return console.log(isnerr);
                });
              }else {
                var uclicked = 'INSERT INTO '+clicker+'click (userclicked, postId) VALUES ("'+userId+'", "'+postId+'")';
                conSpGR.query(uclicked, function (iserr, isres) {
                  if (iserr) return console.log(iserr);
                });
              }
            }
          });
        }, 100);
        //read replies
        var replyS = [], replyC =[], replyL=[], replyD=[], replyR=[], replyf=[], replyb=[], replylo=[], replyr=[], replyt=[], replyr=[], replyl=[];
        for (var i = 0; i < replier.length; i++) {
          conSpQR = mysql.createConnection({
            host:'localhost',
            user:'root',
            password:'Mo137777',
            database: replier[i]
          });
            var rpost = 'SELECT * FROM '+replier[i]+'postId WHERE postId = "'+replyId[i]+'"';
            conSpQR.query(rpost, function (rerr, rres) {
              if (rerr) return console.log(rerr);
              ctnt = rres.map(rres => rres.content);
              lkng = rres.map(rres => rres.likeing);
              rplg = rres.map(rres => rres.replying);
              rpld = rres.map(rres => rres.datetime);
              replyC.push(ctnt[0]);
              replyL.push(lkng[0]);
              replyR.push(rplg[0]);
              replyD.push(rpld[0]);
            });
        }
        for (var i = 0; i < replier.length; i++) {
            var rusr = 'SELECT * FROM users WHERE username = "'+replier[i]+'"';
            con1.query(rusr, function (ruerr, rures) {
              if (ruerr) return console.log(ruerr);
              fkng = rures.map(rures => rures.fname);
              lkng = rures.map(rures => rures.lname);
              crtfc = rures.map(rures => rures.certification);
              rsrc = rures.map(rures => rures.profile);
              replyf.push(fkng[0]);
              replyl.push(lkng[0]);
              replyt.push(crtfc[0]);
              replyS.push(rsrc[0]);
            });
        }
        var rathr = 'SELECT * FROM users WHERE username = "'+userId+'"';
        con1.query(rathr, function (raerr, rares) {
          if (raerr) return console.log(raerr);
          fknga = rares.map(rares => rares.fname)[0];
          lknga = rares.map(rares => rares.lname)[0];
          crtfca = rares.map(rares => rares.certification)[0];
          rsrca = res.map(res => res.profile)[0];
        });
        var isLikeReply = [];
        var islikerR = 'SELECT * FROM '+clicker+'like WHERE postId = "'+postId+'"';
        conSpGR.query(islikerR, function (err0Rp, isLikeResRp) {
          if (err0Rp) return console.log(err0Rp);;
          isLikeResRp = isLikeResRp.map(isLikeResRp => isLikeResRp.author);
          if (isLikeResRp == '') {
            isLikeReply.push(false);
          }else {
            isLikeReply.push(true);
          }
        });
        console.log(isLikeReply);
        setTimeout(function () {
          socket.emit('ClPsRes',{replyS, isLikeReply, mpcontent, mplike, mpdatetime, mpreply, rsrca, fknga, lknga, crtfca, postId, userId, replyD, replier, replyId, replyC, replyL, replyR, replyf, replyt, replyl});
        }, 100);
      });
    }, 100);
  });

  //call mentioned usr
  socket.on('callMention', function (call) {
    var atsn = call.atsn, callmy = call.storedUsername;
    socket.to(id[atsn]).emit('callM', {atsn, callmy});
  })


  //reading async info
  socket.on('AS', function (resu) {
    function AIQuery(result) {
      return new Promise(function(resolve, reject) {
        var si = 'SELECT * FROM users WHERE username ="'+result+'"';
        con1.query(si, function (err , res) {
          if (err) {
            reject(console.log(err));
          };
          var user = res.map(res => res.username);
          var fnam = res.map(res => res.fname);
          var lnam = res.map(res => res.lname);
          var cert = res.map(res => res.certification);
          var loc = res.map(res => res.location);
          var flwr= res.map(res => res.follower);
          var flwg = res.map(res => res.following);
          var bio = res.map(res => res.bio);
          var src = res.map(res => res.profile);
          resolve({user, fnam, lnam, cert, loc, flwr, flwg, bio, src})
        });
      });
    }
    async function startAI() {
      socket.emit('ASr', await AIQuery(resu));
    }
    startAI();
  });


  //follow handle
  socket.on('flw', function (fa) {
    fu = fa.userFA; myU = fa.storedUsername;
    var thistime = GetTime();
    conSpFl = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: myU
    });
    //set numbur of user followers
    var ufl = 'UPDATE users SET follower = follower + 1 WHERE username = "'+fu+'"';
    con1.query(ufl, function (err, res) {
      if (err) throw err;
    });
    //set numbur of my followings
    var ufg = 'UPDATE users SET following = following + 1 WHERE username = "'+myU+'"';
    con1.query(ufg, function (err4, res4) {
      if (err4) throw err4;
    });
    //recorde name of user follower
    var myflg = 'INSERT INTO '+myU+'following (username, datetime) VALUES ("'+fu+'", "'+thistime+'")';
    conSpFl.query(myflg, function (err2,res2) {
      if (err2) throw err2;
    });
    var myflg = 'INSERT INTO '+myU+'room (room, datetime) VALUES ("'+fu+'", "'+thistime+'")';
    conSpFl.query(myflg, function (err5,res5) {
      if (err5) throw err5;
    });
    //recored name of my following
    conSpFg = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: fu
    });
    setTimeout(function () {
      var myflg = 'INSERT INTO '+fu+'follower (username, datetime) VALUES ("'+myU+'", "'+thistime+'")';
      conSpFg.query(myflg, function (err3,res3) {
        if (err3) throw err3;
      });
      socket.emit('flwSuc', fu);
      var usrId = id[fu];
      console.log(usrId);
      socket.to(usrId).emit('followYou', myU);
    }, 200);
  });

  //unfollow handle
  socket.on('unflw', function (fa) {
    fu = fa.userFA; myU = fa.storedUsername;
    var thistime = GetTime();
    conSpFl = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: myU
    });
    //set numbur of user followers
    var ufl = 'UPDATE users SET follower = +follower - 1 WHERE username = "'+fu+'"';
    con1.query(ufl, function (err, res) {
      if (err) throw err;
    });
    //set numbur of my followings
    var ufg = 'UPDATE users SET following = +following - 1 WHERE username = "'+myU+'"';
    con1.query(ufg, function (err4, res4) {
      if (err4) throw err4;
    });
    //recorde name of user follower
    var myflg = 'DELETE FROM '+myU+'following WHERE username = "'+fu+'"';
    conSpFl.query(myflg, function (err2,res2) {
      if (err2) throw err2;
    });
    var myflg = 'DELETE FROM '+myU+'room WHERE room = "'+fu+'"';
    conSpFl.query(myflg, function (err5,res5) {
      if (err5) throw err5;
    });
    //recored name of my following
    conSpFg = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: fu
    });
    setTimeout(function () {
      var myflg = 'DELETE FROM '+fu+'follower WHERE username = "'+myU+'"';
      conSpFg.query(myflg, function (err3,res3) {
        if (err3) throw err3;
      });
      socket.emit('unflwSuc', fu);
    }, 200);
  });

  //liking handle
  socket.on('like', function (res) {
    var uId = res.uId; var pId = res.pId;
    var mId = res.storedUsername;
    var datetime = GetTime();
    conSpLk = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: uId
    });
    conSpMyLk = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: mId
    });
    //set numbur of usr likeing
    var ul = 'UPDATE '+uId+'postId SET likeing = +likeing +1 WHERE postId = "'+pId+'"';
    conSpLk.query(ul, function (err, resuul) {
      if (err) throw err;
    });
    //set what post I liked
    var il = 'INSERT INTO '+mId+'like (postId, datetime, author) VALUES ("'+pId+'", "'+datetime+'", "'+uId+'")';
    conSpMyLk.query(il, function (err, resil) {
      if (err) throw err;
    });
    //recored name of liker
    conSpFg = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: uId+'Post'
    });
    setTimeout(function () {
      var myflg = 'INSERT INTO '+pId+' (liker, datetime, likes) VALUES ("'+mId+'", "'+datetime+'", "true")';
      conSpFg.query(myflg, function (err2,res2) {
        if (err2) throw err2;
      });
      socket.emit('liked', {uId, pId, mId});
      io.to(uId).emit('likedN', {uId, pId, mId});
    }, 200);
  });

  //unlike handle
  socket.on('unlike', function (res) {
    var uId = res.uId; var pId = res.pId;
    var mId = res.storedUsername;
    var datetime = GetTime();
    conSpLk = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: uId
    });
    conSpMyLk = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: mId
    });
    //set numbur of usr likeing
    var ul = 'UPDATE '+uId+'postId SET likeing = +likeing -1 WHERE postId = "'+pId+'"';
    conSpLk.query(ul, function (err, resuul) {
      if (err) throw err;
    });
    //set what post I liked
    var il = 'DELETE FROM '+mId+'like WHERE postId = "'+pId+'"';
    conSpMyLk.query(il, function (err, resil) {
      if (err) throw err;
    });
    //recored name of liker
    conSpFg = mysql.createConnection({
      host:'localhost',
      user:'root',
      password:'Mo137777',
      database: uId+'Post'
    });
    setTimeout(function () {
      var myflg = 'DELETE FROM '+pId+' WHERE liker = "'+mId+'"';
      conSpFg.query(myflg, function (err2,res2) {
        if (err2) throw err2;
      });
      socket.emit('unliked', {uId, pId, mId});
      io.to(uId).emit('unlikedN', {uId, pId, mId});
    }, 200);
  })

  socket.on('img', function (data) {
    var dat = data.buffer;
    var dt = "data:image/png;base64,"+dat.toString("base64");
    socket.emit('pic', dt);
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
