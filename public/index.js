$(document).ready(function () {
  var socket = io();

  var usrname;
  var storedUsername ;
  var storedPass;
  var storedEmail;

  $('#usrname').val('');
  $('#email').val('');
  $("#pass").val('');
  $("#rpass").val('');
  $('#usrname').on('input', function () {
    var onusrname = $(this).val();
    socket.emit('onusrname', onusrname);
    socket.on('isUsr', function (isUsr) {
      if (onusrname != '') {
        if (isUsr != '') {
          $('.Serror').html('>'+isUsr+'<');
          $('#Ss').prop('disabled', true);
          $('#Ss').css({'opacity': '.4', 'cursor': 'not-allowed'});
        }else {
          $('.Serror').html('');
          $('#Ss').prop('disabled', false);
          $('#Ss').css({'opacity': '1', 'cursor': 'pointer'});
        }
      }else {
        $('.Serror').html('');
        $('#Ss').prop('disabled', false);
        $('#Ss').css({'opacity': '1', 'cursor': 'pointer'});
      }
    })
  });

  //sign up handle
  $('.sform').submit(function (event) {
    usrname = $('#usrname').val();
    var email = $('#email').val();
    var pass = $("#pass").val();
    var rpass = $("#rpass").val();
    $('.storeusr').val(usrname);
    $('.storepass').val(pass);
    $('.storeemail').val(email);
    storedUsername = $('.storeusr').val();
    storedPass = $('.storepass').val();
    storedEmail = $('.storeemail').val();
    event.preventDefault();
    if (pass != rpass) {
      $('.Serror').html('>Passwords do not match<');
    }
    else {
      socket.emit('usrinfo', {usrname, email, pass, rpass});
      $('.Sform').css('opacity','0');
      $('.Sheader').css('opacity','0');
      $('.sinfo').css('opacity','0');
      $('.Sp').html('');
      setTimeout(function () {
        $('.Sform').css('display','none');
        $('.Sform2').css('display','block');
      },2000);
      setTimeout("$('.Sform2').css('opacity','1')",2500);
    }
  });

  var vcode;
  //getting Authentication code
  socket.on('id', function (id) {
    vcode = id[usrname];
  });
  //verification
  $('.form2').submit(function (event) {
    $(this).val('');
    event.preventDefault();
    var getcode = $('#getcode').val();
    if (getcode != vcode) {
      alert('Your code is not match');
    }
    else {
      $('#CodeS').prop('disabled', false);
      socket.emit('emailIsOk', {storedUsername, storedPass, storedEmail});
      $('.form2').css('opacity','0');
      $('.saturn').css('opacity','0');
      $('.Sheader').css({'top':'40%','left':'50%','transition':'all .2'})
      setTimeout(function () {
        $('.saturn').css({'display':'none'});
        $('.form2').remove();
        $('.Shed').html('<h1>wellcome!</h1>');
        $('.Sheader').css('opacity','1')
      },1000);
      setTimeout(function () {
        $('.addprofpic').css({'display':'block'});
      },2000);
      setTimeout(function () {
        $('.addprofpic').css({'opacity':'1'});
        $('.skip1').css('display','block');
      },2500);
      }
  });


  $('.skip1').click(function (e) {
    $('.addprofpic').css({'opacity':'0'});
    $('.Sheader').css('opacity','0');
    $('.skip1').css('opacity','0');
    setTimeout(function () {
      $('.skip1').css('display','none');
      $('.addprofpic').css({'display':'none'});
      $('.Sheader').css({'left':'80%','top':'50%','font-size':'40px','text-align':'left','width':'40%','height':'30%'});
      $('.Sheader').html('<h1>You can complete<br>your profile now!');
    },2000);
    setTimeout(function () {
      $('.skip2').css('display','block');
      $('.Sheader').css({'opacity':'1'});
      $('.Sheader').css({'display':'block'});
    },2500);
    setTimeout(function () {
      $('.Uinfo').css({'height':'80%'});
    },3000);
    setTimeout(function () {
      $('.updateprof').css({'opacity':'1'});
      $('.skip2').css('opacity','1');
    },3300);
  });



  $('.skip2').click(function () {
    $('.Uinfo').css({'height':'0%'});
    $('.Uinfo').css('opacity','0')
    $('.skip2').css('opacity','0');
    $('.Sheader').css('opacity','0');
    setTimeout(function () {
    $('.Uinfo').css('display','none');
      $('.skip2').css('display','none');
      $('.addprofpic').css('display','none');
      $('.Sheader').css('display','none');
    },1000);
    setTimeout('$(".maincont").css("display","block")',1500);
  });



  $('#usrname').change(function () {
    var e = $('#usrnameu').val($(this).val());
  });
  $('#email').change(function () {
    $('#emailu').val($(this).val());
  });

  var cont = 0;
  $('#bios').keydown(function (e) {
    if (cont < 100) {
      if (e.keyCode != 8) {
        cont ++;
        var a = 100 - cont;
        $("#char").html(a)
      }
    }
    if (e.keyCode == 8) {
      if (cont > 0) {
        cont--;
        var a = 100 - cont;
        $("#char").html(a);
      }
    }
  });
  $('#bios').on('input',function () {
    var c = $('#bios').val().split('').length;
    $("#char").html(100-c)
  });

  //get other data of profile
  $('.updateprof').submit(function (event) {
    event.preventDefault();
    var usr = $('#usrnameu').val();
    var fname = $('#usrfn').val();
    var lname = $('#usrln').val();
    var bio = $("#bios").val();
    var rpass = $("#rpass").val();
    socket.emit('otherinfo', {usr, fname, lname, bio})
  });

  //log in handle
  $('.nform').submit(function (e) {
    e.preventDefault();
    var loginusr = $('#nusrname').val();
    var loginpass = $('#npass').val();
    $('.storeusr').val(loginusr);
    $('.storepass').val(loginpass);
    storedUsername = $('.storeusr').val();
    storedPass = $('.storeusr').val();
    socket.emit('loginCheck', {loginusr, loginpass});
    socket.on('checkRes', function (checkRes) {
      if (checkRes.checkRes == 'ok') {
        if (!checkRes.f) checkRes.f = '';
        if (!checkRes.l) checkRes.l = '';
        if (!checkRes.b) checkRes.b = '';
        $('.Nerror').html('');
        $(".SignInFrom").css('display','none');
        $(".maincont").css('display','block');
        $(".maincont").append('<div class="blackArea"></div><div class="writePost"><textarea class="postCon" name="post" maxlength="300" rows="8" cols="80" placeholder="What is your situation...?"></textarea><button class="sendPost" type="button" name="button">SharSit!</button><div class="attach"><div class="emoji"><i style="font-size:34px; color: white;line-height: 69px;" class="far">&#xf118;</i></div><div class="file"><input class="fileUp" type="file" name="" value=""></div><div class="fileSkin"><i style="font-size:34px; color: white;line-height: 69px;" class="fas">&#xf0c6;</i></div></div></div><div class="mainsec"><div class="postArea"></div></div><div class="rnav"><div class="pimg"><img class="ppicture" src="profile.png" alt="Your picture"></div><div class="acInfo"><div class="usrInfo"><h1 class="acname">'+checkRes.f+' '+checkRes.l+'</h1><h3 class="acuser">@'+checkRes.u+'</h3></div><div class="usrInfo"><span>Bio</span><p class="biocontent">'+checkRes.b+'</p></div><div class="usrInfo flw"><div class="flwr"><span id="followers">0</span><br><span>Follower</span></div><div class="flwg"><span id="followings">0</span><br><span>following</span></div></div></div></div><div class="lnav"><div class="Search"><input id="search" type="search" name="" value="" placeholder="Global Search..." autocomplete="off"></div><div class="SResC"><div class="SRC"></div></div><div class="new"><div class="newcont"><i style="font-size:50px;text-shadow: 7px 7px 7px #b2001e,7px 7px 7px #d40023;" class="fas">&#xf5ad;</i></div></div></div>')
      }else {
        $('.Nerror').html(checkRes.checkRes);
      }
    })
  })

$(document).mousemove(function (e) {
  var x = -e.pageX+940;
  var y = -e.pageY+380;
  $('.sun').css('transform','translate('+x/100+'px,'+y/33+'px)');
  $('.sun2').css('transform','translate('+x/100+'px,'+y/33+'px)');
});

  $('#Ss').mousedown(function (e) {
    var x = e.pageX-$('#Ss').offset().left ;
    var y = e.pageY-$('#Ss').offset().top;
    $("#Ssi").css({"height":"1000px","width":"1000px","opacity":"0"});
    setTimeout('$("#Ssi").css({"height":"0px","width":"0px","transition":"none"})',900);
    setTimeout('$("#Ssi").css({"opacity":"1","transition":"all .9s"})',950);
  });


  //popup
  $('.maincont').on('click', '.blackArea', function () {
    $('.blackArea').css('visibility','hidden');
    $('.writePost').css('display','none');
  });
  $('.maincont').on('click', '.new', function () {
    $('.blackArea').css('visibility','visible');
    $('.writePost').css('display','block')
  });
  $('.maincont').on('click', '.sendPost', function () {
    var d = new Date();
    var s = d.getSeconds();
    var m = d.getMinutes();
    var h = d.getHours();
    var day = d.getDate();
    var month = d.getMonth();
    var y = d.getFullYear();
    var datetime = y+'-'+month+'-'+day+' '+h+':'+m+':'+s;
    var content = $('.postCon').val();
    socket.emit('post', {content, datetime, storedUsername});
    $('.postCon').val('');
    $('.blackArea').css('visibility','hidden');
    $('.writePost').css('display','none')

  });

  socket.on('post', function (post) {
    var postId = post.thisPostId;
    var postContent = post.content;
    var postdate = post.datetime;
    $('.postArea').prepend('<div class="Post"><div class="content '+postId+'"></div><div class="postAction"><div class="postLike act"><i style="font-size:30px;color:#999;display:block;" class="far w">&#xf004;<i style="font-size:30px;color:#c60021;display:block;" class="fas bl interA '+postId+'IA" act="likeing" pId="'+postId+'">&#xf004;</i></i></div><div class="postReply act"><i style="font-size:30px;color:#999;display:block;" class="far w">&#xf075;<i style="font-size:30px;color:#996633;display:block;" class="fas bl interA '+postId+'IA" act="replying" pId="'+postId+'">&#xf075;</i></i></div><div class="postSave act"><i style="font-size:30px;color:#999;display:block;" class="fa w">&#xf097;<i style="font-size:30px;color:#00802b;display:block;" class="fa bl interA '+postId+'IA" act="saving" pId="'+postId+'">&#xf02e;</i></i></div></div><div class="postDate '+postId+'date"><time></time></div></div>')
    $('.'+postId+'').html(postContent);
    $('.'+postId+'date').html(postdate);
  });

  //global Search
  $('.maincont').on('keyup', '#search',function () {
    var searchRes = $('#search').val().trim().replace('@','');
    $('.SRC').empty();
    if (searchRes != '') {
      socket.emit('searchRes', searchRes);
      socket.on('sresult', function (s) {
        var sun = s.sun;
        var sfn = s.sfn;
        var sln = s.sln;
        var scn = s.scn;
        for (var i = 0; i < sun.length; i++) {
          if ($('.'+sun[i]+'').length == 0) {
            if (!sfn[i] && !sln[i]) {
              sfn[i] = 'SharSit';
              sln[i] = 'user'
            }
            if (!sfn[i] && sln[i]) sfn[i] = '';
            if (sfn[i] && !sln[i]) sln[i] = '';
            $('.SRC').append('<div class="SRes '+sun[i]+'"><div class="Uimg"><img src="profile.png" alt=""></div><div class="Uname '+sun[i]+'un"><h1 class="'+sfn[i]+'un">'+sfn[i]+' '+sln[i]+'</h1><p>@'+sun[i]+'</p></div></div>')
            if (scn[i] == 1) {
              $('.'+sfn[i]+'un').append('<i style="font-size:24px;color:#c60021;display: inline-block;padding:0 5px;position:relative; bottom:.5px;" class="fa">&#xf058;</i>')
            }
          }
        }
      });
    }else {
      $('.SRC').empty();
    }
  });
  $('.maincont').on('focus', '#search',function () {
    $("#search").css({'width': '100%','border-bottom-right-radius':'0px','border-bottom-left-radius':'0px'})
    $(".SResC").css({'height':'70%','width':'90%'});
    $(".SRC").css('display','block')
  });
  $('.maincont').on('blur', '#search',function () {
    $("#search").css({'width': '90%','border-bottom-right-radius':'10px','border-bottom-left-radius':'10px'})
    $(".SResC").css({'height':'0%','width':'81%'});
    $(".SRC").css('display','none');
    $("#search").val('');
    $('.SRC').empty();;
  });





  /*handle post action
  var counter = 0;
  $(".interA").click(function () {
    var act = $(event.target).attr('act');
    var pId = $(event.target).attr('pId');
    console.log(act);
    console.log(pId);
  });*/
});



/**/
