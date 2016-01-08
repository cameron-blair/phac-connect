var lock = null;
$(document).ready(function(e) {
   lock = new Auth0Lock('TjWERMTxpeB9snWo1rSRjLrEhPNNWziz', 'phacconnect.auth0.com');
    e.preventDefault();
    lock.show(function(err, profile, token) {
        if (err) {
            //Error callback
            alert('There was an error');
            alert(err);
        } else {
            //Success callback
            userToken = token;

            //Save the JWT token
            localStorage.setItem('userToken', token);

            //Save the profile
            userProfile = profile;


        }
    })
   });
var userProfile;
var userToken;
var username = "Guest";
$('#login').click(function(e){

});
var socket = io();
$('form').submit(function() {
    if ($('#m').val() === "") {
        alert('Please enter text to share.');
    } else {
        socket.emit('authenticated', username + "~" + $('#m').val() + "~" + $('#ddlMsgType').val());
        $('#m').val('');
        $('#ddlMsgType').val("General");
    }
    return false;
});
socket.on('connect', function () {
    socket.on('authenticated', function () {
    var msgArr = msg.split("~");
    var u = msgArr[0];
    var style = msgArr[2];
    var styleString = '';
    var numDivs = $('.msgSpan').length;
    switch (style) {
        case "Government":
            styleString = 'style="background-color:';
            styleString += '#FFE74C"';
            break;
        case "Department":
            styleString = 'style="background-color:';
            styleString += '#6BF178"';
            break;
        case "Group":
            styleString = 'style="background-color:';
            styleString += '#35A7FF"';
            break;
    }
    if (styleString === '') {
        if (numDivs % 2 == 0)
            styleString = 'style="background-color:#fff"';
        else
            styleString = 'style="background-color:#bbb"';
    }
	
    var iden = '<span><span style="font-weight:bold;">' + u + '</span>: <span class="msgSpan">';
	if (checkUser(u))
		iden = '<img src="../users/av/' + u + '.png" style="height:20px;width:20px;border-width:2px;border-style:solid;border-color:#333;border-radius:25px;margin-right:5px;float:left;"/>' + iden;
    $('#messages').prepend($('<div onmouseout="hideButton(this)" onmouseover="showButton(this)" ' + styleString + '>').html(iden + "</span>"));
    $('.msgSpan').first().text(msgArr[1]); // This is to ensure no html can be applied to the messages.
    var share = "<span style='margin-left:10px;'>";
    share += "<span id=\"imgSpan\" style=\"visibility:hidden\"><a target='_blank' style='display:inline-block;' href=\"https://twitter.com/intent/tweet?&text=" + msgArr[1] + " - Shared via PHAC Connect\"><button style='border-radius:5px;color:#333;font-size:.8em;border:1px solid #aaa'><img style=\"width:18px;height:12px;\" src=\"images/tweet.png\"/> Share</button></a></span></span>";
    var msg = $('#messages div').first().html() + share + "</span>";
    $('#messages div').first().html(msg);
})
socket.emit('authenticate', {token: userToken});
});

function checkUser(u) {
	return true;
}

function showButton(span) {
	span.querySelector("#imgSpan").style.visibility = "visible";
}

function hideButton(span) {
	span.querySelector("#imgSpan").style.visibility = "hidden";
}