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
      setTimeout("$('.Sform').remove()",2000);
      setTimeout("$('.Sheader').css({'left':'50%','top':'60%'})",2000);
      setTimeout("$('.Shed').html('<h1>wellcome!</h1>')",2500);
      setTimeout("$('.Sheader').css('opacity','1')",2500);
      setTimeout("$('.Sheader').css('transition','all .2')",2900);
      setTimeout("$('.Sheader').css({'top':'40%'})",4000);
      setTimeout(function () {
        $('.addprofpic').css({'display':'block'})
      },4000);
      setTimeout(function () {
        $('.addprofpic').css({'opacity':'1'})
      },4500);
    }
  });
});
