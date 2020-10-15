$(document).ready(function () {
  var socket = io();

  var usrname;

  $('#usrname').on('input', function () {
    var onusrname = $(this).val();
    console.log(onusrname);
    socket.emit('onusrname', onusrname);
    socket.on('isUsr', function (isUsr) {
      if (onusrname != '') {
        if (isUsr != '') {
          $('.Serror').html('>'+isUsr+'<')
        }else {
          $('.Serror').html('');
        }
      }else {
        $('.Serror').html('');
      }
    })
  });


  $('.sform').submit(function (event) {
    usrname = $('#usrname').val();
    var email = $('#email').val();
    var pass = $("#pass").val();
    var rpass = $("#rpass").val();
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
      var emailIsOk = 'email is ok';
      socket.emit('emailIsOk', emailIsOk);
      $('.form2').css('opacity','0');
      $('.Sheader').css({'top':'40%','left':'50%','transition':'all .2'})
      setTimeout(function () {
        $('.form2').remove();
        $('.Shed').html('<h1>wellcome!</h1>');
        $('.Sheader').css('opacity','1')
      },2500);
      setTimeout(function () {
        $('.addprofpic').css({'display':'block'});
      },4000);
      setTimeout(function () {
        $('.addprofpic').css({'opacity':'1'});
        $('.skip').css({'display':'block'});
      },4500);
      }
  });


  $('.skip').click(function (e) {
    $('.addprofpic').css({'opacity':'0'});
    $('.Sheader').css('opacity','0');
    setTimeout(function () {
      $('.addprofpic').css({'display':'none'});
      $('.Sheader').css({'left':'80%','top':'50%','font-size':'40px','text-align':'left','width':'40%','height':'30%'});
      $('.Sheader').html('<h1>You can complete<br>your profile now!');
    },2000);
    setTimeout(function () {
      $('.Sheader').css({'opacity':'1'});
      $('.Sheader').css({'display':'block'});
    },2500);
    setTimeout(function () {
      $('.Uinfo').css({'height':'80%'});
    },3000);
    setTimeout(function () {
      $('.uinfo').css({'opacity':'1'});
    },3300);
    e.preventDefault();
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


  /*var move = 0;
  setInterval(function () {
    move++;
    $('.sun').css('transform','translate('+move+'px,0px)');
    $('.sun2').css('transform','translate('+2*move+'px,0px)');
    var e = $('.sun2').position().left;
    if (e > 2000) {
      $('.sun2').css('left','-100%');
      $('.sun2').css('transform','translate('+2*move+'px,0px)');
    }
  },100)*/


});



/**/
