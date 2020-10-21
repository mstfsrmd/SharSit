$(document).ready(function () {
  var socket = io();

  var usrname;
  var storedUsername ;
  var storedPass;
  var storedEmail;
  var fname;
  var lname;
  var bio;

  $('#usrname').val('');
  $('#email').val('');
  $("#pass").val('');
  $("#rpass").val('');

  //check if username exist
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

  //getting Authentication code
  var vcode;
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

  //skip1 button
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

  //skip2 button
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

  //charachter counter
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
    fname = $('#usrfn').val();
    lname = $('#usrln').val();
    bio = $("#bios").val();
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
  });

  socket.on('checkRes', function (checkRes) {
    if (checkRes.checkRes == 'ok') {
      $('.Nerror').html('');
      var c = '';
      if (!checkRes.f) checkRes.f = '';
      if (!checkRes.l) checkRes.l = '';
      if (!checkRes.b) checkRes.b = '';
      if (checkRes.c) c = '<i style="font-size:24px;color:#c60021;display: inline-block;padding:0 5px;position:relative; bottom:.5px;" class="fa">&#xf058;</i>';
      $('.Nerror').html('');
      $(".SignInFrom").css('display','none');
      $(".maincont").css('display','block');
      $(".maincont").append('<div class="homeicon"><i class="fa" id="homeicon">&#xf015;</i></div><div class="menuicon"><i class="fa" id="menuicon">&#xf0c9;</i></div><div class="menu"><div class="secr"><div class="rsect"><div class="rtsecr"><div class="profCont"><div class="pimg"><img class="ppicture" src="mstfsrmd.jpeg"" alt="Your picture"></div><div class="Usinfo"><h1>'+checkRes.f+' '+checkRes.l+c+'</h1><h3>@'+checkRes.u+'</h3></div></div></div><div class="rtsecl"><div class="usrInfo bioSec"><span>Bio</span><p>'+checkRes.b+'</p></div><div class="usrInfo flw"><div class="flwr"><span id="followers'+checkRes.u+'">'+checkRes.fr+'</span><br><span>Follower</span></div><div class="flwg"><span id="followings">'+checkRes.fg+'</span><br><span>following</span></div></div></div></div><div class="rsecb"></div></div><div class="secl"><div class="controlnav"><div class="cn setting"><i style="font-size:44px" class="fa">&#xf013;</i></div><div class="cn profileset"><i style="font-size:44px" class="fa">&#xf2c0;</i></div><div class="cn saved"><i style="font-size:44px" class="fa">&#xf097;</i></div><div class="cn notif"><i style="font-size:44px" class="fa">&#xf0a2;</i></div><div class="cn flfg"><i class="material-icons" id="j">&#xe915;</i></div></div></div></div><div class="blackArea"></div><div class="blackArea2"></div><div class="writePost"><textarea class="postCon" name="post" maxlength="300" rows="8" cols="80" placeholder="What is your situation...?"></textarea><button class="sendPost" type="button" name="button">SharSit!</button><div class="attach"><div class="emoji"><i style="font-size:34px; color: white;line-height: 69px;" class="far">&#xf118;</i></div><div class="file"><input class="fileUp" type="file" name="" value=""></div><div class="fileSkin"><i style="font-size:34px; color: white;line-height: 69px;" class="fas">&#xf0c6;</i></div></div></div><div class="mainsec"><div class="postArea '+checkRes.u+'pA" ></div></div><div class="rnav"></div><div class="lnav"><div class="Search"><input id="search" type="search" name="" value="" placeholder="Global Search..." autocomplete="off"></div><div class="SResC"><div class="SRC"></div></div><div class="new"><div class="newcont"><i style="font-size:50px;text-shadow: 7px 7px 7px #b2001e,7px 7px 7px #d40023;" class="fas">&#xf5ad;</i></div></div></div>')
    }else {
      $('.Nerror').html(checkRes.checkRes);
      }
  });
  socket.on('postload', function (p) {
    var pcont = p.p;
    var pdate = p.d;
    var pl = p.lk;
    var pr = p.rp;
    var puser = p.u;
    var pfname = p.f; var plname =p.l;
    var pcert = p.c;
    if (p.c){ pcert = '<i style="font-size:24px;color:#c60021;display: inline-block;padding:0 5px;position:relative; bottom:.5px;" class="fa">&#xf058;</i>';
  }else pcert = '';
    if (!pfname && !plname) {
      pfname = 'SharSit';
      plname = 'user';}
    if (!pfname && plname) pfname = '';
    if (pfname && !plname) plname = '';
    for (var i = 0; i < pcont.length; i++) {
      $('.'+puser+'pA').prepend('<div class="Post '+puser+'PoSt"><div class="posterInfo"><div class="Pimg"><img src="mstfsrmd.jpeg" alt=""></div><div class="Pname"><h1>'+pfname+' '+plname+pcert+'</h1><p>@'+p.u+'</p></div></div><div class="content">'+pcont[i].replace(/(?:\r\n|\r|\n)/g, "<br />")+'<div class="postDate"><time>'+pdate[i].replace('T','<br/>').replace('.000Z','')+'</time></div><div class="postAction"><div class="postLike act"><i style="font-size:30px;color:#999;display:block;" class="far w">&#xf004;<i style="font-size:30px;color:#c60021;display:block;" class="fas bl" id="like">&#xf004;</i></i></div><div class="postReply act"><i style="font-size:30px;color:#999;display:block;" class="far w">&#xf075;<i style="font-size:30px;color:#996633;display:block;" class="fas bl" id="reply">&#xf075;</i></i></div><div class="postSave act"><i style="font-size:30px;color:#999;display:block;" class="fa w">&#xf097;<i style="font-size:30px;color:#00802b;display:block;" class="fa bl" id="save">&#xf02e;</i></i></div></div></div></div>');
    }
  });

  $('.maincont').on('click', '.homeicon', function (e) {
    socket.emit('goHome', storedUsername);
    $(".mainsec").empty();
  })

  //main page animation
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
  $('.maincont').on('click', '.blackArea2', function () {
    $('.blackArea2').css({'z-index':'-2', 'opacity':'0'});
    $('.writePost').css('display','none');

  });
  $('.maincont').on('click', '.new', function () {
    $('.blackArea2').css({'z-index':'2', 'opacity':'.4'});
    $('.writePost').css('display','block')
  });

  //send post
  $('.maincont').on('click', '.sendPost', function (e) {
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
      $('.blackArea2').css({'z-index':'-2', 'opacity':'0'});
      $('.writePost').css('display','none');
  });

  //getting post from server
  socket.on('post', function (post) {
    var postId = post.thisPostId;
    var postContent = post.content;
    console.log(postContent);
    var postdate = post.datetime;
    $('.postArea').prepend('<div class="Post '+postId+'"><div class="posterInfo '+postId+'pInfo"><div class="Pimg '+postId+'pImag"><img src="profile.png" alt=""></div><div class="Pname '+postId+'pNam"><h1>'+fname+' '+lname+'</h1><p>@'+post.u+'</p></div></div><div class="content '+postId+'pContant"><div class="postDate '+postId+'date"><time></time></div></div><div class="postAction"><div class="postLike act"><i style="font-size:30px;color:#999;display:block;" class="far w">&#xf004;<i style="font-size:30px;color:#c60021;display:block;" class="fas bl interA '+postId+'IAL" act="likeing" pId="'+postId+'">&#xf004;</i></i></div><div class="postReply act"><i style="font-size:30px;color:#999;display:block;" class="far w">&#xf075;<i style="font-size:30px;color:#996633;display:block;" class="fas bl interA '+postId+'IAR" act="replying" pId="'+postId+'">&#xf075;</i></i></div><div class="postSave act"><i style="font-size:30px;color:#999;display:block;" class="fa w">&#xf097;<i style="font-size:30px;color:#00802b;display:block;" class="fa bl interA '+postId+'IAS" act="saving" pId="'+postId+'">&#xf02e;</i></i></div></div></div>')
    $('.'+postId+'pContant').prepend(postContent.replace(/(?:\r\n|\r|\n)/g, "<br />"));
    $('.'+postId+'date').html(postdate);
  });

  //global Search
  $('.maincont').on('keyup', '#search',function () {
    var searchRes = $('#search').val().trim();
    if (searchRes.split('')[0] == '@') {
      $('#search').css('color','#999');
    }else {
      $('#search').css('color','black');
    }
    var searchRes = searchRes.replace('@','');
    $('.SRC').empty();
    if (searchRes != '') {
      socket.emit('searchRes', searchRes);
    }else {
      $('.SRC').empty();
    }
  });
  socket.on('sresult', function (s) {
    var sun = s.sun;
    var sfn = s.sfn;
    var sln = s.sln;
    var scn = s.scn;
    for (var i = 0; i < sun.length; i++) {
      if (sun[i] == storedUsername) {
        continue;
      }
      if ($('.'+sun[i]+'').length == 0) {
        if (!sfn[i] && !sln[i]) {
          sfn[i] = 'SharSit';
          sln[i] = 'user'
        }
        if (!sfn[i] && sln[i]) sfn[i] = '';
        if (sfn[i] && !sln[i]) sln[i] = '';
        $('.SRC').append('<div class="SRes '+sun[i]+'" SResId = '+sun[i]+'><div class="Uimg '+sun[i]+'SRimg"><img src="profile.png" alt=""></div><div class="Uname '+sun[i]+'Un"><h1 class="'+sfn[i]+'un">'+sfn[i]+' '+sln[i]+'</h1><p>@'+sun[i]+'</p></div></div>')
        if (scn[i] == 1) {
          $('.'+sfn[i]+'un').append('<i style="font-size:24px;color:#c60021;display: inline-block;padding:0 5px;position:relative; bottom:.5px;" class="fa">&#xf058;</i>')
        }
      }
    }
  });

  //choose a user
  $(".maincont"). on('click', '.SRes', function (e) {
    var sResUser = $(this).attr('SResId');
    socket.emit('selectedusr', sResUser);
  });

  //getting choosen user result
  socket.on('suresult', function (res) {
    var chUser = res.u; var chFname = res.f;
    var chLname = res.l; var chBio = res.b;
    var chCert = res.c; var chFlr = res.fr;
    var chFlg = res.fg;
    if(!chBio) chBio = '';
    if (!chFname && !chLname) {
      chFname = 'SharSit';
      chLname = 'user'
    }
    if (!chFname && chLname) chFname = '';
    if (chFname && !chLname) chLname = '';
    if (chCert == 1) {
      chCert = '<i style="font-size:24px;color:#c60021;display: inline-block;padding:0 5px;position:relative; bottom:.5px;" class="fa">&#xf058;</i>';
    }else {chCert = ''}
    $('.rnav').empty();
    $('.rnav').append('<div class="acInfo '+chUser+'Ainfo"><div class="CusrInfo"><h1 class="Cacuser">'+chFname+' '+chLname+chCert+'</h1><h3 class="Cacuser" id="cacuser">@'+chUser+'</h3><h5 style="color:#999" class="Cacuser"><i style="font-size:14px;color:#999" class="fa">&#xf041;</i>Iran/Tehran</h5></div><div class="CusrInfo"><span>Bio</span><p class="biocontent">'+chBio+'</p></div><div class="CusrInfo flw"><div class="flwr"><span id="followers'+chUser+'">'+chFlr+'</span><br><span>Follower</span></div><div class="flwg"><span id="followings">'+chFlg+'</span><br><span>following</span></div></div><div class="CusrInfo"><button class="FollowB" type="button" name="button">Follow</button></div></div></div>')

  });

  //getting choosen user posts
  socket.on('Cpostload', function (res) {
    $('.mainsec').empty();
    var cpContent = res.p;
    $('.mainsec').append('<div class="postArea '+res.su+'pA" ></div>');
    if (res.c){ var cpCert = '<i style="font-size:24px;color:#c60021;display: inline-block;padding:0 5px;position:relative; bottom:.5px;" class="fa">&#xf058;</i>';
  }else cpCert = '';
    if (!res.f && !res.l) {
      res.f = 'SharSit';
      res.l = 'user';}
    if (!res.f && res.l) res.f = '';
    if (res.f && !res.l) res.l = '';
    for (var i = 0; i < cpContent.length; i++) {
      $('.'+res.su+'pA').prepend('<div class="Post '+res.su+'PoSt"><div class="posterInfo"><div class="Pimg"><img src="mstfsrmd.jpeg" alt=""></div><div class="Pname"><h1>'+res.f+' '+res.l+cpCert+'</h1><p>@'+res.su+'</p></div></div><div class="content">'+cpContent[i].replace(/(?:\r\n|\r|\n)/g, "<br />")+'<div class="postDate"><time>'+cpContent[i].replace('T','<br/>').replace('.000Z','')+'</time></div><div class="postAction"><div class="postLike act"><i style="font-size:30px;color:#999;display:block;" class="far w">&#xf004;<i style="font-size:30px;color:#c60021;display:block;" class="fas bl" id="like">&#xf004;</i></i></div><div class="postReply act"><i style="font-size:30px;color:#999;display:block;" class="far w">&#xf075;<i style="font-size:30px;color:#996633;display:block;" class="fas bl" id="reply">&#xf075;</i></i></div><div class="postSave act"><i style="font-size:30px;color:#999;display:block;" class="fa w">&#xf097;<i style="font-size:30px;color:#00802b;display:block;" class="fa bl" id="save">&#xf02e;</i></i></div></div></div></div>');
    }
  });

  $('.maincont').on('focus', '#search',function () {
    $("#search").css({'width': '100%','border-bottom-right-radius':'0px','border-bottom-left-radius':'0px'});
    $(".SResC").css({'height':'70%','width':'90%'});
    $(".SRC").css('display','block');
  });
  $('.maincont').on('blur', '#search',function () {
    setTimeout(function () {
    $("#search").css({'width': '90%','border-bottom-right-radius':'10px','border-bottom-left-radius':'10px'});
    $(".SResC").css({'height':'0%','width':'81%'});
    $(".SRC").css('display','none');
    $("#search").val('');
    $('.SRC').empty();
  },500)
  });

  //control panel opening
  var ex = 0;
  $('.maincont').on('click', '.fa', function () {
    if (ex == 0) {
      $('.controlnav').css({'box-shadow': '0px 0px 30px rgba(0, 0, 0, .5)','transform': 'translate(0%, -50%) translateZ(1px)','width':' 880%'})
      ex = 1;
    }else {
      $('.controlnav').css({'box-shadow': '4px 4px 20px rgba(0, 0, 0, .5)','transform': 'translate(0%, -50%)','width':' 70%'})
      ex = 0;
    }
    });

  //menu opening
  $('.maincont').on('click', '#menuicon', function () {
    ex = 0;
    $('.menu').css('display','flex');
    $('.blackArea').css({'z-index':'2', 'opacity':'.4'});
    $('.controlnav').css({'box-shadow': '4px 4px 20px rgba(0, 0, 0, .5)','transform': 'translate(0%, -50%)','width':' 70%'});
    $('.profCont').css({'opacity':'1','transform': 'translate(-50%, -50%) translateZ(0px)'});
    setTimeout("$('.bioSec').css({'opacity':'1','transform': 'translateZ(0px)'})",100);
    setTimeout("$('.flw').css({'opacity':'1','transform': 'translateZ(0px)'})",200);
    setTimeout("$('.controlnav').css({'opacity':'1','transform': 'translate(0%, -50%) translateZ(0px)'})",300);
  });
  $('.maincont').on('click', '.blackArea', function () {
    $('.controlnav').css({'box-shadow': '4px 4px 20px rgba(0, 0, 0, .5)','transform': 'translate(0%, -50%)','width':' 70%'});
    $('.profCont').css({'opacity':'0','transform': 'translate(-50%, -50%) translateZ(1.5px)'});
    setTimeout("$('.bioSec').css({'opacity':'0','transform': 'translateZ(1.5px)'})",100);
    setTimeout("$('.flw').css({'opacity':'0','transform': 'translateZ(1.5px)'})",200);
    setTimeout(function () {
      $('.blackArea').css({'opacity':'0'});
      $('.controlnav').css({'opacity':'0','transform': 'translate(0%, -50%) translateZ(1.5px)'})
    },300);
    setTimeout(function () {
      $('.menu').css('display','none');
      $('.blackArea').css({'z-index':'-2'});
    },700)
  });

/*  var x = 'COVID19 UPDATE: New Jersey has 958 new positive cases, #pushing our @cumulative total to 218,738.Sadly, we are reporting two new @confirmed COVID-19 deaths for a #total of 14,415 #lives lost.'
  var s = x.split('');
  var o;
  for (var i = 0; i < s.length; i++) {
    if (s[i] == '#' || s[i] == '@') {
      var res = x.substring(0, s.indexOf(s[i]));
      var k = x.replace(res, '');
      console.log(k);
      var k = k.split('');
      for (var j = 0; j < k.length; j++) {
        o = o + k[j];
        if (k[j] == ' ') {
          break;
        }
      }
    }
  }
  console.log(o.replace('undefined',''));
  console.log(x);*/

  /*handle post action
  var counter = 0;
  $(".interA").click(function () {
    var act = $(event.target).attr('act');
    var pId = $(event.target).attr('pId');
    console.log(act);
    console.log(pId);
  });*/
});

//😊
/**/
