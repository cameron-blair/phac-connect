$('button').button();
$('#btnSubmit').button();
$('#banner button').show("fast");

var height = window.innerHeight - 131;
var width = window.innerWidth;
$('#msgControl').width((width-250) + 'px');
if (width < 1450) {
	$('#btnControl').width('75px');
	height = height - 17;
	if (width <= 600) {
		$('#msgControl').width('350px');
		$('#tdALL').prop('disabled', true);
		$('#tdA').prop('disabled', true);
		$('#tdHR').prop('disabled', true);
		$('#tdPH').prop('disabled', true);
	}
}

if (width > 600) {
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
}
window.onresize = resize;

function resize() {
	height = window.innerHeight  - 131;
	width = window.innerWidth;
	$('#msgControl').width((width-250) + 'px');
	if (width < 1450) {
		$('#btnControl').width('75px');
		height = height - 17;
		if (width <= 600) {
			$('#msgControl').width('350px');
			$('#tdALL').prop('disabled', true);
			$('#tdA').prop('disabled', true);
			$('#tdHR').prop('disabled', true);
			$('#tdPH').prop('disabled', true);
		}
	}
	
	if (width <= 600)
		height = height - 78;
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

var scrollWidth = '20%';

if (width <= 600)
	scrollWidth = '25%';

$('#messagesALL').slimScroll({
	height: height + 'px',
	width: scrollWidth
});
$('#messagesPH').slimScroll({
	height: height + 'px',
	width: scrollWidth
});
$('#messagesA').slimScroll({
	height: height + 'px',
	width: scrollWidth
});
$('#messagesHR').slimScroll({
	height: height + 'px',
	width: scrollWidth
});

var lock = null;
$(document).ready(function() {
	lock = new Auth0Lock('TjWERMTxpeB9snWo1rSRjLrEhPNNWziz', 'phacconnect.auth0.com');
	var token = localStorage.getItem('userToken');
	if (token) {
		lock.getProfile(token, function(err, profile) {
		$('h1').html('Yes');
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
	}
	if (Notification.permission !== 'granted')
		$('#pushNotes').show();
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
	$('#confirmDelete').dialog({
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
		autoOpen: false,
		buttons:
			[
				{
					text: "Delete",
					"class": 'deleteButton',
					click: function() {
						$(this).dialog("close");
						msgDeleteConfirm();
						}
				},
				{
					text: "Cancel",
					click: function() {
						$(this).dialog("close");
					}
				}
			]
	});
	$('#errorImage').dialog({
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
		autoOpen: false,
		buttons: {
			"OK": function() {
				$(this).dialog("close");
			}
		}
	});
	$('#errorCategory').dialog({
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
		autoOpen: false,
		buttons: {
			"OK": function() {
				$(this).dialog("close");
			}
		}
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
	$('#searchResults').dialog({
		hide: 'fade',
		show: 'fade',
		modal: true,
		width: 500,
		height: 500,
		maxHeight: 500,
		draggable: false,
		resizable: false,
		open: function () {
			$('.ui-widget-overlay').addClass('overlay');
			$('.ui-widget-header').addClass('header');
		},
		close: function () {
			$('.ui-widget-overlay').removeClass('overlay');
			$('#searchResultsDiv').html("");
		},
		autoOpen: false
	});
	setTimeout(function() {
		$('#twitter-widget-0').height(height-3);
		$('#twitterA').show('fast');
		$('#twitter').show('fast');
	},3000);
	if (width <= 600)
		rotateColumn();
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
	lock.show({
      icon:            'http://i.imgur.com/ppn0iya.png',
      rememberLastLogin:  true
    });
	lock.show(function(err, profile, token) {
		$('h1').html('Yes');
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

var socket = io();
$('form').submit(function(e) {
tags = [];
e.preventDefault();
	if ($('#m').val() !== "") {
		msgText = $('#m').val();
		msgText = msgText.replace(/<[^>]*>/g,"");
		msgText = msgText.replace(/&[^>]*;/g,"");
		var splitMsg = msgText.split(" ");
		for (var i = 0; i < splitMsg.length; i++) {
			if (splitMsg[i].charAt(0) === "#") {
				if (!(/^[a-zA-Z0-9]+$/.test(splitMsg[i].slice(1)))) {
					$('#errorCategory').dialog("open");
					$('#m').val(msgText);
					return;
				}
				else
					ga('send', 'event', 'Used hashtag', splitMsg[i]);
			}
			
			if (splitMsg[i].indexOf('.png') != -1 || [i].indexOf('.gif') != -1 || splitMsg[i].indexOf('.jpg') != -1) {
				var imgUrl = "";
				if (splitMsg[i].indexOf('http') == -1)
					imgUrl = 'http://' + splitMsg[i];
				else
					imgUrl = splitMsg[i];
				var checkImg = jQuery.ajax({type: "HEAD", url: imgUrl, async: false});
				if (checkImg.status !== 200) {
					$('#errorImage').dialog("open");
					$('#m').val(msgText);
					return;
					}
				else
					ga('send', 'event', 'Attached image', imgUrl);
			}
		}
		
		if (msgText.trim()) {
			$("input[name='tags']:checked").each(function() {
				var tagName = $(this).val();
				tags.push(tagName);
				ga('send', 'event', 'Sent to stream', tagName);
			});
			now = new Date();
			image = userProfile.picture;
			socket.emit('chat message', {user: username, msg: msgText, tags: tags, avatar: image, created: now});
			var highest = 0;
			for (var i = 0; i < msgsSave.length; i++) {
				if (msgsSave[i].identifier > highest)
					highest = msgsSave[i].identifier;
			}
			highest++;
			handleMsg({identifier: highest, user: username, msg: msgText, tags: tags, avatar: image, created: now.toISOString()}, false);
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
		handleMsg(msgs[i], false);
	}
});

socket.on('show tags', function(msgs){
	for(var i=msgs.length-1; i >= 0; i--){
		handleMsg(msgs[i], true);
	}
});

socket.on('chat message', function(msg) {
	msgsSave.unshift(msg);
	handleMsg(msg, false);
	if (Notification.permission === 'granted') {
		var notification = new Notification('PHAC Connect',
			{
				icon: 'http://i.imgur.com/ppn0iya.png',
				body: 'A new message has been shared.'
			});
		notification.onclick = function() {
			window.open('http://nodejs-phacconnect.rhcloud.com');
		};
		self.registration.showNotification(notification);
	}
});

function handleMsg(msg, search) {
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
	if (tags.length == 0) {
		if (!search)
			sendMessage('ALL', u, av, date, userMsg, false);
		else
			sendResults('ALL', u, av, date, userMsg, false);
	}
	else {
		if (!search)
			sendMessage('ALL', u, av, date, userMsg, false);
		else
			sendResults('ALL', u, av, date, userMsg, false);
		if (all) {
			for (var i=0; i < tags.length; i++) {
				if (!search)
					sendMessage(tags[i], u, av, date, userMsg, true);
				else
					sendResults(tags[i], u, av, date, userMsg, true);
			}
		}
		else {
			for (var i=0; i < tags.length; i++)
				if (!search)
					sendMessage(tags[i], u, av, date, userMsg, false);
				else
					sendResults(tags[i], u, av, date, userMsg, false);
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
				styleString += '#f7b267"';
			else
				styleString += '#ffcc81"';
			break;
		case "A":
			if (numDivs % 2 == 0)
				styleString += '#ff8360"';
			else
				styleString += '#ff9d7a"';
			break;
		case "PH":
			if (numDivs % 2 == 0)
				styleString += '#79ce7b"';
			else
				styleString += '#93e895"';
			break;
	}
	if (tag === 'ALL') {
	numDivs = $('#messagesALL .messageDivs').length;
		if (numDivs % 2 == 0)
			styleString += '#8eb8e5"';
		else
			styleString += '#a8d2ff"';
	}
	
	if (combined)
		tag = "ALL";
		
	var arr = u.split("@");
	var name = arr[0];
	var iden = '<div><span onclick="showInfo(\'' + u + '\',\'' + av  + '\')" src="' + av + '" style="font-weight:bold;cursor:pointer;">' + name + '</span><br/><div class="msgSpan">';
	iden = '<img id="avatar" onclick="showInfo(\'' + u + '\',\'' + av  + '\')" src="' + av + '" style="height:32px;width:32px;border-width:2px;border-style:solid;border-color:#333;border-radius:32px;margin-right:5px;float:left;cursor:pointer;"/>' + iden;
	$('#messages' + tag).prepend($('<div id="' + uniqueID + '" class="messageDivs ' + uniqueID + '" onmouseout="hideButton(this)" onmouseover="showButton(this)" ' + styleString + '>').html(iden + "</div>"));
	var splitMsg = userMsg.split(" ");
	var newMsg = [];
	var imgDiv = "";
	for (var i = 0; i < splitMsg.length; i++) {
		
		if (splitMsg[i].charAt(0) === "#") {
			splitMsg[i] = "<a style='cursor:pointer;font-weight:bold;' title='Search for category.' onclick='searchResults(\"" + splitMsg[i] + "\")'>" + splitMsg[i] + "</a>";
		}
		
		if (splitMsg[i].indexOf("www") != -1 || splitMsg[i].indexOf('.png') != -1 || splitMsg[i].indexOf('.gif') != -1 || splitMsg[i].indexOf('.jpg') != -1) {
			if (splitMsg[i].indexOf("http") != -1) {
				if (splitMsg[i].indexOf('.png') != -1 || splitMsg[i].indexOf('.gif') != -1 || splitMsg[i].indexOf('.jpg') != -1) {
					imgDiv += "<a class='msgImgLink' href='" + splitMsg[i] + "' target='_blank'><img class='msgImg' src='" + splitMsg[i] + "' width='200px' height='100%' /></a>";
					splitMsg[i] = "";
				}
				else
					splitMsg[i] = "<a target='_blank' href='" + splitMsg[i] + "'>" + splitMsg[i] + "</a>";
				}
			else {
				if (splitMsg[i].indexOf('.png') != -1 || [i].indexOf('.gif') != -1 || splitMsg[i].indexOf('.jpg') != -1) {
					imgDiv += "<a class='msgImgLink' href='http://" + splitMsg[i] + "' target='_blank'><img class='msgImg' src='http://" + splitMsg[i] + "' width='200px' height='100%' /></a>";
					splitMsg[i] = "";
				}
				else
					splitMsg[i] = "<a target='_blank' href='http://" + splitMsg[i] + "'>" + splitMsg[i] + "</a>";
			}
			if (splitMsg[i] !== "")
				newMsg.push(splitMsg[i]);
		}
		else
			newMsg.push(splitMsg[i]);
	}
	htmlMsg = newMsg.join(" ");
	$('#messages' + tag + ' .messageDivs .msgSpan').first().html(htmlMsg + "<div class='msgImgDiv'>" + imgDiv + "</div>");
	var share = "<span style='margin-left:10px;'>";
	var twitterMsg = userMsg.replace(/#/g, "%23");
	twitterMsg = twitterMsg.replace(/&/g, "%26");
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

function sendResults(tag, u, av, date, userMsg, combined) {
	var styleString = "";
	if (filled)
		styleString = 'style="background-color:';
	else
		styleString = 'style="border-radius:3px;margin: 2px;border: 2px solid ';
	numDivs = $('#messages' + tag + ' .messageDivs').length;
	switch (tag) {
		case "HR":
			if (numDivs % 2 == 0)
				styleString += '#f7b267"';
			else
				styleString += '#ffcc81"';
			break;
		case "A":
			if (numDivs % 2 == 0)
				styleString += '#ff8360"';
			else
				styleString += '#ff9d7a"';
			break;
		case "PH":
			if (numDivs % 2 == 0)
				styleString += '#79ce7b"';
			else
				styleString += '#93e895"';
			break;
	}
	if (tag === 'ALL') {
	numDivs = $('#messagesALL .messageDivs').length;
		if (numDivs % 2 == 0)
			styleString += '#8eb8e5"';
		else
			styleString += '#a8d2ff"';
	}
	
	if (combined)
		tag = "ALL";
		
	var arr = u.split("@");
	var name = arr[0];
	var iden = '<div><span onclick="showInfo(\'' + u + '\',\'' + av  + '\')" src="' + av + '" style="font-weight:bold;cursor:pointer;">' + name + '</span><br/><div class="msgSpan">';
	iden = '<img id="avatar" onclick="showInfo(\'' + u + '\',\'' + av  + '\')" src="' + av + '" style="height:32px;width:32px;border-width:2px;border-style:solid;border-color:#333;border-radius:32px;margin-right:5px;float:left;cursor:pointer;"/>' + iden;
	$('#searchResultsDiv').prepend($('<div id="' + uniqueID + '" class="messageDivs ' + uniqueID + '" onmouseout="hideButton(this)" onmouseover="showButton(this)" ' + styleString + '>').html(iden + "</div>"));
	var splitMsg = userMsg.split(" ");
	var newMsg = [];
	var imgDiv = "";
	for (var i = 0; i < splitMsg.length; i++) {

		if (splitMsg[i].indexOf("www") != -1 || splitMsg[i].indexOf('.png') != -1 || splitMsg[i].indexOf('.gif') != -1 || splitMsg[i].indexOf('.jpg') != -1) {
			if (splitMsg[i].indexOf("http") != -1) {
				if (splitMsg[i].indexOf('.png') != -1 || splitMsg[i].indexOf('.gif') != -1 || splitMsg[i].indexOf('.jpg') != -1) {
					imgDiv += "<a class='msgImgLink' href='" + splitMsg[i] + "' target='_blank'><img class='msgImg' src='" + splitMsg[i] + "' width='200px' height='100%' /></a>";
					splitMsg[i] = "";
				}
				else
					splitMsg[i] = "<a target='_blank' href='" + splitMsg[i] + "'>" + splitMsg[i] + "</a>";
				}
			else {
				if (splitMsg[i].indexOf('.png') != -1 || [i].indexOf('.gif') != -1 || splitMsg[i].indexOf('.jpg') != -1) {
					imgDiv += "<a class='msgImgLink' href='http://" + splitMsg[i] + "' target='_blank'><img class='msgImg' src='http://" + splitMsg[i] + "' width='200px' height='100%' /></a>";
					splitMsg[i] = "";
				}
				else
					splitMsg[i] = "<a target='_blank' href='http://" + splitMsg[i] + "'>" + splitMsg[i] + "</a>";
			}
			if (splitMsg[i] !== "")
				newMsg.push(splitMsg[i]);
		}
		else
			newMsg.push(splitMsg[i]);
	}
	htmlMsg = newMsg.join(" ");
	$('#searchResultsDiv .messageDivs .msgSpan').first().html(htmlMsg + "<div class='msgImgDiv'>" + imgDiv + "</div>");
	var share = "<span style='margin-left:10px;'>";
	var twitterMsg = userMsg.replace(/#/g, "%23");
	twitterMsg = twitterMsg.replace(/&/g, "%26");
	share += "<span id=\"imgSpan\" style=\"opacity:0\">";
	if (u === username)
		share += "<img class='msgCheck' title='Click to save changes.' style='display:none;width:12px;height:12px;margin-right:4px;cursor:pointer;' src='images/checkmark.png'/><img class='msgEdit' title='Click to edit this message.' onclick='msgEdit(this)' style='width:12px;height:12px;margin-right:4px;cursor:pointer;' src='images/edit.png'/>";
	share += "<a target='_blank' title ='Share via Twitter' href='https://twitter.com/intent/tweet?&text=" + twitterMsg + " - " + u + " (%40PHAC_Connect " + date + ")'><img style='width:12px;height:12px;' src='images/tweet.png'/></a> ";
	share += "<a  title='Share via Email' href='mailto:?subject=PHAC Connect&body=";
	share += userMsg + " - " + u + " (PHAC Connect " + date + ")";
	share += "'><img style='width:12px;height:12px;' src='images/mail.png'/></a> ";
	share += "<img style='width:12px;height:12px;' title='Posted: " + date + "' src='images/time.png'/>";
	share += "</span></span>";
	var msg = $('#searchResultsDiv div').first().html() + share + "</span>";
	$('#searchResultsDiv div').first().html(msg);
}

function msgEdit(div) {
	$(div).hide();
	$(div).parent().find('img').hide();
	$(div).parent().find('.msgCheck').show();
	var msgText = $(div).parent().parent().parent().find('.msgSpan').html();
	var imgText = "";
	var imgTextReplaceArr = [];
	if (msgText.indexOf('<div class="msgImgDiv">') != -1) {
		imgText = msgText.slice(0, -6);
		imgText = imgText.substring(imgText.indexOf('<div class="msgImgDiv">')+23,imgText.length);
		var imgArr = imgText.split(" ");
		for (var i = 0; i < imgArr.length; i++ ) {
			if (imgArr[i].indexOf("href=") != -1)
				imgTextReplaceArr.push(imgArr[i].substring(6,imgArr[i].length-1));
		}
	}
	msgText = msgText.replace(/<[^>]*>/g,"");
	var msgID = $(div).parent().parent().parent().attr('id');
	var imgTextReplace = "";
	if (imgTextReplaceArr.length > 0)
		imgTextReplace = imgTextReplaceArr.join(" ");
	if (msgText !== "" && imgTextReplace !== "")
		imgTextReplace = " " + imgTextReplace;
	var editText = "<input class='editingMsg' onblur='msgEditBlur(this)' type='textbox' value='" + msgText + imgTextReplace + "'/>";
	$(div).parent().parent().parent().find('.msgSpan').html(editText);
	$(div).parent().parent().parent().find('.editingMsg').focus();
}



function msgEditBlur(div) {
	var msgText = $(div).val();
	msgText = msgText.replace(/<[^>]*>/g,"");
	var splitMsg = msgText.split(" ");
	var newMsg = [];
	var imgDiv = "";
	for (var i = 0; i < splitMsg.length; i++) {
		if (splitMsg[i].charAt(0) === "#")
			splitMsg[i] = "<a style='cursor:pointer;font-weight:bold;' title='Search for category.' onclick='searchResults(\"" + splitMsg[i] + "\")'>" + splitMsg[i] + "</a>";
		if (splitMsg[i].indexOf("www") != -1 || splitMsg[i].indexOf('.png') != -1 || splitMsg[i].indexOf('.gif') != -1 || splitMsg[i].indexOf('.jpg') != -1) {
			if (splitMsg[i].indexOf("http") != -1) {
				if (splitMsg[i].indexOf('.png') != -1 || splitMsg[i].indexOf('.gif') != -1 || splitMsg[i].indexOf('.jpg') != -1) {
					imgDiv += "<a class='msgImgLink' href='" + splitMsg[i] + "' target='_blank'><img class='msgImg' src='" + splitMsg[i] + "' width='200px' height=100%' /></a>";
					splitMsg[i] = "";
				}
				else
					splitMsg[i] = "<a target='_blank' href='" + splitMsg[i] + "'>" + splitMsg[i] + "</a>";
				}
			else {
				if (splitMsg[i].indexOf('.png') != -1 || [i].indexOf('.gif') != -1 || splitMsg[i].indexOf('.jpg') != -1) {
					imgDiv += "<a class='msgImgLink' href='http://" + splitMsg[i] + "' target='_blank'><img class='msgImg' src='http://" + splitMsg[i] + "' width='200px' height='100%' /></a>";
					splitMsg[i] = "";
				}
				else
					splitMsg[i] = "<a target='_blank' href='http://" + splitMsg[i] + "'>" + splitMsg[i] + "</a>";
			}
			if (splitMsg[i] !== "")
				newMsg.push(splitMsg[i]);
		}
		else
			newMsg.push(splitMsg[i]);
	}
	var htmlMsg = newMsg.join(" ");
	$(div).parent().parent().parent().find('img').show();
	$(div).parent().parent().parent().find('.msgCheck').hide();
	var msgID = $(div).parent().parent().parent().attr('id');
	if (msgText !== "") {
		socket.emit('edit message', msgID, msgText);
		$('.' + msgID).each(function() {
			$(this).find('.msgSpan').html(htmlMsg + "<div class='msgImgDiv'>" + imgDiv + "</div>");
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
			handleMsg(msgsSave[i], false);
		}
	}
}

function msgDelete(div) {
	currentDiv = div;
	$('#confirmDelete').dialog("open");
}

function msgDeleteConfirm() {
	var delAll = true;
	var type = "";
	var msgID = $(currentDiv).parent().parent().parent().attr('id');
	var color = $(currentDiv).parent().parent().parent().attr('style');
	color = color.slice(-15);
	color = color.slice(0,-2);
	switch (color) {
		case "142, 184, 229":
		case "168, 210, 255":
			type = "ALL";
		break;
		case "255, 131, 96":
		case "255, 157, 122":
			type = "A";
		break;
		case "247, 178, 103":
		case "255, 204, 129":
			type = "HR";
		break;
		case "121, 206, 123":
		case "147, 232, 149":
			type = "PH";
		break;
	}
	if (type === "ALL") {
		$('.' + msgID).hide('fast');
		socket.emit('delete message', msgID);
	}
	else {
		$(currentDiv).parent().parent().parent().hide('fast');
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
	var toggleString = "";
	if (!all)
		toggleString = "To single column.";
	else
		toggleString = "To multiple columns.";
	ga('send', 'event', 'Toggle columns', toggleString);
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
		handleMsg(msgsSave[i], false);
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
		if (scrollWidth === '20%') {
			$('.slimScrollDiv').eq(0).width('80%');
		}
		else {
			$('.slimScrollDiv').eq(0).width('100%');
			$('#legend').css('margin-bottom', '0px');
			$('#messagesALL').height((height - 78) + 'px');
			$('.slimScrollDiv').height((height - 78) + 'px');
		}
		$('#messagesA').hide('fast');
		$('#messagesHR').hide('fast');
		$('#messagesPH').hide('fast');
	}	
}

function messageStyle() {
	var messageStyle = "";
	if (filled)
		messageStyle = "To border.";
	else
		messageStyle = "To filled."
	ga('send', 'event', 'Toggle message style', messageStyle);
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
		handleMsg(msgsSave[i], false);
	}
}

function selectStream(context) {
	ga('send', 'event', 'Focus Stream', context);
	if ($('#td' + context).css('display') !== 'none' && stream) {
		$('#columnSwitch').hide("slow");
		$('#tdALL').hide("fast");
		$('#tdA').hide("fast");
		$('#tdPH').hide("fast");
		$('#tdHR').hide("fast");
		$('#td' + context).stop();
		$('#td' + context).show('fast');
		var scrollDiv = '80%';
		if (width <= 600)
			scrollDiv = '100%';
		$('#td' + context).css('width',scrollDiv);
		$('.slimScrollDiv').width('0%');
		$('#messagesALL').hide("fast");
		$('#messagesA').hide("fast");
		$('#messagesHR').hide("fast");
		$('#messagesPH').hide("fast");
		$('#messages' + context).stop();
		$('#messages' + context).show('fast');
		switch(context) {
			case "ALL":
				$('.slimScrollDiv').eq(0).width(scrollDiv);
			break;
			case "A":
				$('.slimScrollDiv').eq(1).width(scrollDiv);
			break;
			case "HR":
				$('.slimScrollDiv').eq(2).width(scrollDiv);
			break;
			case "PH":
				$('.slimScrollDiv').eq(3).width(scrollDiv);
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
		var scrollDivWidth = '20%';
		if (width <= 600)
			scrollDivWidth = '100%';
		$('.slimScrollDiv').width(scrollDivWidth);
		$('#td' + context).css('width',scrollDivWidth);
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
	localStorage.removeItem('userToken');
	location.reload();
}

function showInfo(email,image) {
	ga('send', 'event', 'Show Info', email);
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

function searchResults(text) {
	ga('send', 'event', 'Search tags');
	socket.emit('search tags', text);
	$('#personalInfo').dialog("close");
	$('#dialog').dialog("close");
	$('#searchResults').dialog("open");

}

function getPermission() {
	if (!Notification) {
		alert('Notifications are not compatible with this browser.');
		return;
	}
	if (Notification.permission !== 'granted')
		Notification.requestPermission();
		
	$('#pushNotes').hide('slow');
}