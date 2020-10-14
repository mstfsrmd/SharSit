$(document).ready(function () {
  var socket = io();

  $('.sform').submit(function (event) {
    event.preventDefault();
    var usrname = $('#usrname').val();
    var email = $('#email').val();
    var pass = $("#pass").val();
    var rpass = $("#rpass").val();
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


  //getting Authentication code
  socket.on('code', function (code) {
  });

});



/*
setTimeout("$('.Shed').html('<h1>wellcome!</h1>')",2500);
setTimeout("$('.Sheader').css('opacity','1')",2500);
setTimeout("$('.Sheader').css('transition','all .2')",2900);
setTimeout("$('.Sheader').css({'top':'40%'})",4000);

setTimeout("$('.Sheader').css({'left':'50%','top':'60%'})",2000);
setTimeout("$('.Shed').html('<h1>wellcome!</h1>')",2500);
setTimeout("$('.Sheader').css('opacity','1')",2500);
setTimeout("$('.Sheader').css('transition','all .2')",2900);
setTimeout("$('.Sheader').css({'top':'40%'})",4000);
setTimeout(function () {
  $('.addprofpic').css({'display':'block'});
},4000);
setTimeout(function () {
  $('.addprofpic').css({'opacity':'1'});
  $('.skip').css({'display':'block'});
},4500);*/
