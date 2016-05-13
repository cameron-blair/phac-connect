$('button').button();
$('#btnSubmit').button();
$('#banner button').show("fast");

var height = window.innerHeight - 131;
var width = window.innerWidth;
$('#msgControl').width((width-250) + 'px');
if (width < 1450) {
	$('#btnControl').width('75px');
	height = height - 17;
	if (width <= 600)
		$('#msgControl').width('350px');
}
window.onresize = resize;

function resize() {
	height = window.innerHeight  - 131;
	width = window.innerWidth;
	$('#msgControl').width((width-250) + 'px');
	if (width < 1450) {
		$('#btnControl').width('75px');
		height = height - 17;
		if (width <= 600)
			$('#msgControl').width('350px');
		}
	$('#messagesALL').height(height + 'px');
	$('#messagesPH').height(height + 'px');
	$('#messagesA').height(height + 'px');
	$('#messagesHR').height(height + 'px');
	$('.slimScrollDiv').height(height+'px');
	$('#twitter-widget-0').height((height-3) + 'px');
}

var msgsSave = [];
var all = false;
var stream = true;
var filled = true;

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

var lock = null;
$(document).ready(function() {
	$('#dialog').dialog({
		hide: 'fade',
		show: 'fade',
		modal: true,
		draggable: false,
		resizable: false,
		open: function () {
			$('.ui-widget-overlay').addClass('overlay');
			$('.ui-widget-header').addClass('header');
		},
		close: function () {
			$('.ui-widget-overlay').removeClass('overlay');
		},
		autoOpen: false
		});
	$('#personalInfo').dialog({
		hide: 'fade',
		show: 'fade',
		modal: true,
		draggable: false,
		resizable: false,
		open: function () {
			$('.ui-widget-overlay').addClass('overlay');
			$('.ui-widget-header').addClass('header');
		},
		close: function () {
			$('.ui-widget-overlay').removeClass('overlay');
		},
		autoOpen: false
		});
	setTimeout(function() {
		$('#twitter-widget-0').height(height-3);
		$('#twitterA').show('fast');
		$('#twitter').show('fast');
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
var uniqueID = "";
$('#login').click(function(e) {
	e.preventDefault();
	lock.show(function(err, profile, token) {
		if (err) {
			alert('There was an error');
			alert(err);
		} else {
			$('#control').show('slow');
			$('#loginMsg').hide('slow');
			$('#banner button').hide('slow');
			userToken = token;
			localStorage.setItem('userToken', token);
			userProfile = profile;
			image = profile.picture.toString();
			$('#profileIcon').attr('src', image);
			$('#profileIcon').show("slow");
			username = profile.email;
			$('#messagesALL').empty();
			$('#messagesA').empty();
			$('#messagesHR').empty();
			$('#messagesPH').empty();
			for(var i=msgsSave.length-1; i >= 0; i--){
				handleMsg(msgsSave[i]);
			}
		}
	 });
	 
});

$('#liHR').click(function() {
	$('#imgHR').toggleClass("faded");
	$('#chkHR').prop("checked", !$('#chkHR').prop("checked"));
});

$('#liA').click(function() {
	$('#imgA').toggleClass("faded");
	$('#chkA').prop("checked", !$('#chkA').prop("checked"));				
});

$('#liPH').click(function() {
	$('#imgPH').toggleClass("faded");
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
		msgText = msgText.replace(/<[^>]*>/g,"");
		msgText = msgText.replace(/&[^>]*;/g,"");
		
		if (msgText.trim()) {
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
			$('#imgHR').addClass("faded");
			$('#imgA').addClass("faded");
			$('#imgPH').addClass("faded");
		}
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
	uniqueID = msg.identifier + "";
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
	if (filled)
		styleString = 'style="display:none;background-color:';
	else
		styleString = 'style="display:none;border-radius:3px;margin: 2px;border: 2px solid ';
	numDivs = $('#messages' + tag + ' .messageDivs').length;
	switch (tag) {
		case "HR":
			if (numDivs % 2 == 0)
			styleString += '#EAF0CE"';
			else
			styleString += '#DDE3C1"';
			break;
		case "A":
			if (numDivs % 2 == 0)
			styleString += '#F3DAD8"';
			else
			styleString += '#E6CDCB"';
			break;
		case "PH":
			if (numDivs % 2 == 0)
			styleString += '#C1EDCC"';
			else
			styleString += '#B4E0BF"';
			break;
	}
	if (tag === 'ALL') {
	numDivs = $('#messagesALL .messageDivs').length;
		if (numDivs % 2 == 0)
			styleString += '#BED8D4"';
		else
			styleString += '#B1CBC7"';
	}
	
	if (combined)
		tag = "ALL";
		
	var arr = u.split("@");
	var name = arr[0];
	var iden = '<div><span onclick="showInfo(\'' + u + '\',\'' + av  + '\')" src="' + av + '" style="font-weight:bold;cursor:pointer;">' + name + '</span><br/><div class="msgSpan">';
	iden = '<img onclick="showInfo(\'' + u + '\',\'' + av  + '\')" src="' + av + '" style="height:32px;width:32px;border-width:2px;border-style:solid;border-color:#686868;border-radius:25px;margin-right:5px;float:left;cursor:pointer;"/>' + iden;
	$('#messages' + tag).prepend($('<div id="' + uniqueID + '" class="messageDivs ' + uniqueID + '" onmouseout="hideButton(this)" onmouseover="showButton(this)" ' + styleString + '>').html(iden + "</div>"));
	var splitMsg = userMsg.split(" ");
	for (var i = 0; i < splitMsg.length; i++) {
		if (splitMsg[i].indexOf("www") != -1) {
			if (splitMsg[i].indexOf("http") != -1)
				splitMsg[i] = "<a target='_blank' href='" + splitMsg[i] + "'>" + splitMsg[i] + "</a>";
			else
				splitMsg[i] = "<a target='_blank' href='http://" + splitMsg[i] + "'>" + splitMsg[i] + "</a>";
		}
	}
	htmlMsg = splitMsg.join(" ");
	$('#messages' + tag + ' .messageDivs .msgSpan').first().html(htmlMsg);
	var share = "<span style='margin-left:10px;'>";
	var twitterMsg = userMsg.replace(/#/g, "%23");
	twitterMsg = twitterMsg.replace(/&/g, "%26");
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
	share += "<span id=\"imgSpan\" style=\"opacity:0\">";
	if (u === username)
		share += "<img class='msgCheck' title='Click to save changes.' style='display:none;width:12px;height:12px;margin-right:4px;cursor:pointer;' src='images/checkmark.png'/><img class='msgEdit' title='Click to edit this message.' onclick='msgEdit(this)' style='width:12px;height:12px;margin-right:4px;cursor:pointer;' src='images/edit.png'/><img class='msgDelete' onclick='msgDelete(this)' title='Click to delete this message.' style='width:12px;height:12px;margin-right:4px;cursor:pointer;' src='images/delete.png'/>";
	share += "<a target='_blank' title ='Share via Twitter' href='https://twitter.com/intent/tweet?&text=" + twitterMsg + " - " + u + " (%40PHAC_Connect // " + date + ")'><img style='width:12px;height:12px;' src='images/tweet.png'/></a> ";
	share += "<a  title='Share via Email' href='mailto:?subject=PHAC Connect&body=";
	share += userMsg + " - " + u + "(PHAC Connect // " + date + ")";
	share += "'><img style='width:12px;height:12px;' src='images/mail.png'/></a> ";
	share += "<img style='width:12px;height:12px;' title='Posted: " + date + "' src='images/time.png'/>";
	share += "</span></span>";
	var msg = $('#messages' + tag + ' div').first().html() + share + "</span>";
	$('#messages' + tag + ' div').first().html(msg);
	$('#messages' + tag + ' div').first().show('fast');
}

function msgEdit(div) {
	$(div).hide();
	$(div).parent().find('img').hide();
	$(div).parent().find('.msgCheck').show();
	var msgText = $(div).parent().parent().parent().find('.msgSpan').html();
	msgText = msgText.replace(/<[^>]*>/g,"");
	var msgID = $(div).parent().parent().parent().attr('id');
	var editText = "<input class='editingMsg' onblur='msgEditBlur(this)' type='textbox' value='" + msgText + "'/>";
	$(div).parent().parent().parent().find('.msgSpan').html(editText);
	$(div).parent().parent().parent().find('.editingMsg').focus();
}

function msgEditBlur(div) {
	var msgText = $(div).val();
	msgText = msgText.replace(/<[^>]*>/g,"");
	var splitMsg = msgText.split(" ");
	for (var i = 0; i < splitMsg.length; i++) {
		if (splitMsg[i].indexOf("www") != -1) {
			if (splitMsg[i].indexOf("http") != -1)
				splitMsg[i] = "<a target='_blank' href='" + splitMsg[i] + "'>" + splitMsg[i] + "</a>";
			else
				splitMsg[i] = "<a target='_blank' href='http://" + splitMsg[i] + "'>" + splitMsg[i] + "</a>";
		}
	}
	var htmlMsg = splitMsg.join(" ");
	htmlMsg = htmlMsg;
	$(div).parent().parent().parent().find('img').show();
	$(div).parent().parent().parent().find('.msgCheck').hide();
	var msgID = $(div).parent().parent().parent().attr('id');
	if (msgText !== "") {
		socket.emit('edit message', msgID, msgText);
		$('.' + msgID).each(function() {
			$(this).find('.msgSpan').html(htmlMsg);
		});
		for(var i=msgsSave.length-1; i >= 0; i--) {
			if (msgsSave[i].identifier == parseInt(msgID)) {
				msgsSave[i].msg = msgText;
			}
		}
	}
	else {
		$('#messagesALL').empty();
		$('#messagesA').empty();
		$('#messagesHR').empty();
		$('#messagesPH').empty();

		for(var i=msgsSave.length-1; i >= 0; i--){
			handleMsg(msgsSave[i]);
		}
	}
}

function msgDelete(div) {
	var confirm = window.confirm("Do you want to delete the message?");
	var delAll = true;
	var type = "";
	if (confirm) {
		var msgID = $(div).parent().parent().parent().attr('id');
		var color = $(div).parent().parent().parent().attr('style');
		color = color.slice(-15);
		color = color.slice(0,-2);
		switch (color) {
			case "177, 203, 199":
			case "190, 216, 212":
				type = "ALL";
			break;
			case "243, 218, 216":
			case "230, 205, 203":
				type = "A";
			break;
			case "234, 240, 206":
			case "221, 227, 193":
				type = "HR";
			break;
			case "180, 224, 191":
			case "193, 237, 204":
				type = "PH";
			break;
		}
		if (type === "ALL") {
			$('.' + msgID).hide('fast');
			socket.emit('delete message', msgID);
		}
		else {
			$(div).parent().parent().parent().hide('fast');
			var newTags = [];
			for(var i=msgsSave.length-1; i >= 0; i--) {
				if (msgsSave[i].identifier == parseInt(msgID)) {
					newTags = msgsSave[i].tags;
					for (var j = 0; j < newTags.length; j++) {
						if (newTags[j] === type)
							delete newTags[j];
					}
				}
			}
			socket.emit('remove tag', msgID, newTags);
			delAll = false;
		}
	}
	if (delAll) {
		for(var i=msgsSave.length-1; i >= 0; i--) {
			if (msgsSave[i].identifier == parseInt(msgID)) {
				msgsSave.splice(i, 1);
			}
		}
	}
}

function showButton(span) {
	$(span).find("#imgSpan").stop();
	$(span).find("#imgSpan").fadeTo(200,0.6);
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
		$('#columnSwitch').toggleClass('columnSwitchClick');
		$('.slimScrollDiv').width('20%');
		$('#messagesA').show('fast');
		$('#messagesHR').show('fast');
		$('#messagesPH').show('fast');
	}
	else {
		$('#columnSwitch').toggleClass('columnSwitchClick');
		$('.slimScrollDiv').width('0%');
		$('.slimScrollDiv').eq(0).width('80%');
		$('#messagesA').hide('fast');
		$('#messagesHR').hide('fast');
		$('#messagesPH').hide('fast');
	}	
}

function messageStyle() {
	$('#messageStyle').toggleClass('messageStyle');
	$('#messagesALL').empty();
	$('#messagesA').empty();
	$('#messagesHR').empty();
	$('#messagesPH').empty();
	
	if (filled)
		filled = false;
	else
		filled = true;

	for(var i=msgsSave.length-1; i >= 0; i--){
		handleMsg(msgsSave[i]);
	}
}

function selectStream(context) {
	if ($('#td' + context).css('display') !== 'none' && stream) {
		$('#columnSwitch').hide("slow");
		$('#tdALL').hide("fast");
		$('#tdA').hide("fast");
		$('#tdPH').hide("fast");
		$('#tdHR').hide("fast");
		$('#td' + context).stop();
		$('#td' + context).show('fast');
		$('#td' + context).css('width','80%');
		$('.slimScrollDiv').width('0%');
		$('#messagesALL').hide("fast");
		$('#messagesA').hide("fast");
		$('#messagesHR').hide("fast");
		$('#messagesPH').hide("fast");
		$('#messages' + context).stop();
		$('#messages' + context).show('fast');
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
		$('#columnSwitch').show('slow');
		$('#tdALL').show('fast');
		$('#tdA').show('fast');
		$('#tdPH').show('fast');
		$('#tdHR').show('fast');
		$('.slimScrollDiv').width('20%');
		$('#td' + context).css('width','20%');
		$('#messagesALL').show('fast');
		$('#messagesA').show('fast');
		$('#messagesHR').show('fast');
		$('#messagesPH').show('fast');
		stream = true;
	}
}

$('#profileIcon').click(function() {
	$('#dialog').dialog("close");
	$('#personalImg').attr('src', image);
	$('#personalOptions').html('<br/><br/><a href="http://www.gravatar.com/" target="_blank"><button>Change Picture</button></a>&nbsp;<button onclick="reload()">Logout</button>');
	$('#personalEmail').html('<a href="mailto:' + username + '">' + username + '</a>');
	$('#personalInfo').dialog("open");
});

function reload() {
	location.reload();
}

function showInfo(email,image) {
	if (email === username) {
		$('#dialog').dialog("close");
		$('#personalImg').attr('src', image);
		$('#personalOptions').html('<br/><br/><a href="http://www.gravatar.com/" target="_blank"><button>Change Picture</button></a>&nbsp;<button onclick="reload()">Logout</button>');
		$('#personalEmail').html('<a href="mailto:' + username + '">' + username + '</a>');
		$('#personalInfo').dialog("open");
	}
	else {
	$('#personalInfo').dialog("close");
	$('#userImg').attr('src', image);
	$('#userOptions').html('');
	$('#userEmail').html('<a href="mailto:' + email + '">' + email + '</a>');
	$('#dialog').dialog("open");
	}
}