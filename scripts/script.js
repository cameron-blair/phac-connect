var height = window.innerHeight - 114;
var msgsSave = [];
var all = false;
var stream = true;

$('#messagesALL').slimScroll({
	height: height + 'px',
	width: '20%'
});
$('#messagesPH').slimScroll({
	height: height + 'px',
	width: '20%'
});
$('#messagesA').slimScroll({
	height: height + 'px',
	width: '20%'
});
$('#messagesHR').slimScroll({
	height: height + 'px',
	width: '20%'
});

$('#login').button();
$('#login').html('Log in');
$('#btnSubmit').button();

var lock = null;
$(document).ready(function() {
	setTimeout(function() {
		$('#twitter-widget-0').height(height-3);
	},3000);
	lock = new Auth0Lock('TjWERMTxpeB9snWo1rSRjLrEhPNNWziz', 'phacconnect.auth0.com');
});
var userProfile;
var msgText = "";
var tags = [];
var now = "";
var userToken;
var username = "Guest";
var image = "";
$('#login').click(function(e) {
	e.preventDefault();
	lock.show(function(err, profile, token) {
		if (err) {
			alert('There was an error');
			alert(err);
		} else {				
			$('#control').css("display", "");
			$('#loginMsg').css("display", "none");
			userToken = token;
			localStorage.setItem('userToken', token);
			userProfile = profile;
			image = profile.picture.toString();
			$('#login').html(profile.email);
			var emailArr = profile.email.split("@");
			username = emailArr[0];
		}
	 })
	 
});

$('#liHR').click(function() {
	$('#imgHR').toggleClass("borderBottom");
	$('#chkHR').prop("checked", !$('#chkHR').prop("checked"));
});

$('#liA').click(function() {
	$('#imgA').toggleClass("borderBottom");
	$('#chkA').prop("checked", !$('#chkA').prop("checked"));				
});

$('#liPH').click(function() {
	$('#imgPH').toggleClass("borderBottom");
	$('#chkPH').prop("checked", !$('#chkPH').prop("checked"));
});

$('#tdALL').click(function() {
	if (all)
		rotateColumn();
	selectStream('ALL');
});

$('#tdHR').click(function() {
	if (all)
		rotateColumn();
	selectStream('HR');
});

$('#tdA').click(function() {
	if (all)
		rotateColumn();
	selectStream('A');
});

$('#tdPH').click(function() {
	if (all)
		rotateColumn();
	selectStream('PH');
});


var socket = io();
$('form').submit(function(e) {
tags = [];
e.preventDefault();
	if ($('#m').val() !== "") {
		msgText = $('#m').val();
		$("input[name='tags']:checked").each(function() {
			tags.push($(this).val());
		});
		now = new Date();
		image = userProfile.picture;
		socket.emit('chat message', {user: username, msg: msgText, tags: tags, avatar: image, created: now});
		$('#m').val('');
		$('#chkHR').prop("checked", false);
		$('#chkA').prop("checked", false);
		$('#chkPH').prop("checked", false);
		$('#imgHR').removeClass("borderBottom");
		$('#imgA').removeClass("borderBottom");
		$('#imgPH').removeClass("borderBottom");
	}
	return false;
});

socket.on('connect', function() {}).emit('authenticate', {
	token: userToken
});

socket.on('load history', function(msgs){
	msgsSave = msgs;
	for(var i=msgs.length-1; i >= 0; i--){
		handleMsg(msgs[i]);
	}
});

socket.on('chat message', function(msg) {
	msgsSave.unshift(msg);
	handleMsg(msg);
});

function handleMsg(msg) {
	var u = msg.user;
	var av = msg.avatar;
	if (!av) {
		av = "./users/av/Default.png";
	}
	var tags = msg.tags;
	var userMsg = msg.msg;
	var date = msg.created;
	date = date.substring(0,10) + ", " + date.substring(11,16);
	userMsg = userMsg.replace(/;/g, "");
	userMsg = userMsg.replace(/&/g, "and");
	if (tags.length == 0)
		sendMessage('ALL', u, av, date, userMsg, false);
	else {
		sendMessage('ALL', u, av, date, userMsg, false);
		if (all) {
			for (var i=0; i < tags.length; i++)
				sendMessage(tags[i], u, av, date, userMsg, true);
		}
		else {
			for (var i=0; i < tags.length; i++)
				sendMessage(tags[i], u, av, date, userMsg, false);
		}
	}
}

function sendMessage(tag, u, av, date, userMsg, combined) {
	var styleString = "";
		numDivs = $('#messages' + tag + ' .messageDivs').length;
	switch (tag) {
		case "HR":
			styleString = 'style="background-color:';
			if (numDivs % 2 == 0)
			styleString += '#FFE74C"';
			else
			styleString += '#EDD53A"';
			break;
		case "A":
			styleString = 'style="background-color:';
			if (numDivs % 2 == 0)
			styleString += '#6BF178"';
			else
			styleString += '#59DF66"';
			break;
		case "PH":
			styleString = 'style="background-color:';
			if (numDivs % 2 == 0)
			styleString += '#35A7FF"';
			else
			styleString += '#2695ED"';
			break;
	}
	if (tag === 'ALL') {
	numDivs = $('#messagesALL .messageDivs').length;
		if (numDivs % 2 == 0)
			styleString = 'style="background-color:#fff"';
		else
			styleString = 'style="background-color:#ededed"';
	}
	
if (combined)
	tag = "ALL";

	var iden = '<span><span style="font-weight:bold;">' + u + '</span>: <span class="msgSpan">';
	iden = '<img src="' + av + '" style="height:20px;width:20px;border-width:2px;border-style:solid;border-color:#333;border-radius:25px;margin-right:5px;float:left;"/>' + iden;
	$('#messages' + tag).prepend($('<div class="messageDivs" onmouseout="hideButton(this)" onmouseover="showButton(this)" ' + styleString + '>').html(iden + "</span>"));
	$('#messages' + tag + ' .messageDivs .msgSpan').first().text(userMsg); // This is to ensure no html can be applied to the messages.
	var share = "<span style='margin-left:10px;'>";
	var twitterMsg = userMsg.replace(/#/g, "%23");
	/*
	Working on stripping hashtags and allow them to be clickable
	var hashSplit = userMsg.split("");
	var hashStart = [];
	var hashEnd = [];
	var last = -1;
	for (var i = 0; i < hashSplit.length; i++) {
		if (hashSplit[i] == '#') {
			hashStart.push(i);
			last = i;
		}
	}
	*/
	share += "<span id=\"imgSpan\" style=\"opacity:0\"><a target='_blank' style='display:inline-block;' href='https://twitter.com/intent/tweet?&text=" + twitterMsg + " - " + u + " (%40PHAC_Connect // " + date + ")'><img style='width:12px;height:12px;' src='images/tweet.png'/></a> ";
	share += "<a style='display:inline-block;' href='mailto:?subject=PHAC Connect&body=";
	share += userMsg + " - " + u + "(PHAC Connect // " + date + ")";
	share += "'><img style='width:12px;height:12px;' src='images/mail.png'/></a> ";
	share += "<img style='width:12px;height:12px;' title='Posted: " + date + "' src='images/time.png'/>";
	share += "</span></span>";
	var msg = $('#messages' + tag + ' div').first().html() + share + "</span>";
	$('#messages' + tag + ' div').first().html(msg);
}

function showButton(span) {
	$(span).find("#imgSpan").stop();
	$(span).find("#imgSpan").fadeTo(200,1);
}

function hideButton(span) {
	$(span).find("#imgSpan").stop();
	$(span).find("#imgSpan").fadeTo(200,0);
}

function rotateColumn() {
    if (all) {
		$('td').attr("disabled",true);
		all = false;
		}
	else {
		all = true;
		}
	$('#messagesALL').empty();
	$('#messagesA').empty();
	$('#messagesHR').empty();
	$('#messagesPH').empty();

	for(var i=msgsSave.length-1; i >= 0; i--){
		handleMsg(msgsSave[i]);
	}

	if ($('#messagesA').css('display') === 'none') {
		for (var i = 0; i <= 90 ; i++) {
			$('#columnSwitch').css('transform', 'rotate(' + i + 'deg)');
		}
		$('.slimScrollDiv').width('20%');
		$('#messagesA').css('display', '');
		$('#messagesHR').css('display', '');
		$('#messagesPH').css('display', '');
	}
	else {
		for (var i = 90; i >= 0 ; i--) {
			$('#columnSwitch').css('transform', 'rotate(' + i + 'deg)');
		}
		$('.slimScrollDiv').width('0%');
		$('.slimScrollDiv').eq(0).width('80%');
		$('#messagesA').css('display', 'none');
		$('#messagesHR').css('display', 'none');
		$('#messagesPH').css('display', 'none');
	}	
}

function selectStream(context) {
	if ($('#td' + context).css('display') !== 'none' && stream) {
		$('#columnSwitch').css('display', 'none');
		$('#tdALL').css('display','none');
		$('#tdA').css('display','none');
		$('#tdPH').css('display','none');
		$('#tdHR').css('display','none');
		$('#td' + context).css('display','');
		$('#td' + context).css('width','80%');
		$('.slimScrollDiv').width('0%');
		$('#messagesALL').css('display', 'none');
		$('#messagesA').css('display', 'none');
		$('#messagesHR').css('display', 'none');
		$('#messagesPH').css('display', 'none');
		$('#messages' + context).css('display', '');
		switch(context) {
			case "ALL":
				$('.slimScrollDiv').eq(0).width('80%');
			break;
			case "A":
				$('.slimScrollDiv').eq(1).width('80%');
			break;
			case "HR":
				$('.slimScrollDiv').eq(2).width('80%');
			break;
			case "PH":
				$('.slimScrollDiv').eq(3).width('80%');
			break;
		}
		stream = false;
	}
	else {
		$('#columnSwitch').css('display', '');
		$('#tdALL').css('display','');
		$('#tdA').css('display','');
		$('#tdPH').css('display','');
		$('#tdHR').css('display','');
		$('.slimScrollDiv').width('20%');
		$('#td' + context).css('width','20%');
		$('#messagesALL').css('display', '');
		$('#messagesA').css('display', '');
		$('#messagesHR').css('display', '');
		$('#messagesPH').css('display', '');
		stream = true;
	}
}