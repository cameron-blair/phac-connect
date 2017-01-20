$('#banner button').show("fast");

var allowPush = false;

var msgsSave = [];
var all = true;
var stream = true;
var filled = true;
var username = "Guest";

var height = window.innerHeight;
var width = window.innerWidth;

$('#searchResults').width(width-(width*.2));
$('#searchResults').css("max-height", height-(height*.2));
$('#searchResultsDiv').css("max-height", height-(height*.3));

$(window).on("orientationchange", function() {
	window.setTimeout(function() {
	height = window.innerHeight;
	width = window.innerWidth;

	$('#searchResults').width(width-(width*.2));
	$('#searchResults').css("max-height", height-(height*.2));
	$('#searchResultsDiv').css("max-height", height-(height*.3));
	
	if (username === "Guest")
		$('#messagesALL').height(height - 110);
	else
		$('#messagesALL').height(height - 188);
	}, 200);
});

var parentDiv;

function checkParents(div) {
	if (!isNaN($(div).attr('id'))) {
		parentDiv = div;
		return;
	}
	else
		checkParents($(div).parent()[0]);
}

$('#messagesALL').on('swipeleft', function(e) {
	var div = e.target;
	if ($(e.target).attr('id') !== 'messagesALL') {
		checkParents(div);
		if ($(parentDiv).find('#userName').html() === username.split("@")[0]) {
			$(parentDiv).css("margin-bottom", "-8px");
//			$(parentDiv).hide("slide", {direction: "left"}, function () {
				$(parentDiv).css("margin-bottom", "");
				$(parentDiv).find('#avatar').hide();
				$(parentDiv).find('#msgTextDiv').hide();
				$(parentDiv).find('#msgIconDiv').hide();
				$(parentDiv).find('#msgOptions').hide();
				$(parentDiv).find('#msgEditDiv').hide();
//				$(parentDiv).slideToggle();
				$(parentDiv).find('#msgDeleteDiv').show();
//			});
		}
	}
});

$('#messagesALL').on('swiperight', function(e) {
	var div = e.target;
	if ($(e.target).attr('id') !== 'messagesALL') {
		checkParents(div);
		if ($(parentDiv).find('#userName').html() === username.split("@")[0]) {
			$(parentDiv).css("margin-bottom", "-8px");
//			$(parentDiv).hide("slide", {direction: "right"}, function () {
				$(parentDiv).css("margin-bottom", "");
				$(parentDiv).find('#msgOptions').hide();
				$(parentDiv).find('.editingMsg').show();
				$(parentDiv).find('.msgSpan').hide();
				msgEdit(div);
//				$(parentDiv).slideToggle();
//			});
		}
	}
});

function getMsgInfo(div) {
	checkParents(div);
	$(parentDiv).find('#avatar').hide();
	$(parentDiv).find('#msgTextDiv').hide();
	$(parentDiv).find('#msgIconDiv').hide();
	$(parentDiv).find('#msgOptions').show();
}

function returnMsg(div) {
	checkParents(div);
	$(parentDiv).find('#msgOptions').hide();
	$(parentDiv).find('#msgDeleteDiv').hide();
	$(parentDiv).find('#msgEditDiv').hide();
//	$(parentDiv).hide(function() {
		$(parentDiv).find('#msgIconDiv').css("height", "");
		$(parentDiv).find('#msgIconDiv').css("padding-top", "");
		$(parentDiv).find('.msgSpan').show();
		$(parentDiv).find('.editingMsg').hide();
		$(parentDiv).find('.msgCheck').hide();
		$(parentDiv).find('#returnIcon').hide();
		$(parentDiv).find('#avatar').show();
		$(parentDiv).find('#msgTextDiv').show();
		$(parentDiv).find('#msgIconDiv').show();
		$(parentDiv).show();
//	});
}

$('#messagesALL').height(height - 110);

$.mobile.loading().hide();

function checkToken() {
	var address = window.location.href;
	if (address.indexOf("#") != -1) {
		address = address.split("#")[1];
		var token = address.split("=")[1];
		socket.emit('save token', username, token);
	}
}

var lock = null;
$(document).ready(function() {
	lock = new Auth0Lock('TjWERMTxpeB9snWo1rSRjLrEhPNNWziz', 'phacconnect.auth0.com');
	var token = localStorage.getItem('userToken');
	if (token) {
		$('#messagesALL').height(height-188);
		lock.getProfile(token, function(err, profile) {
		if (err) {
		} else {
			$('#control').show('slow');
			$('#loginMsg').hide('slow');
			$('#login').hide('slow');
			userToken = token;
			localStorage.setItem('userToken', token);
			userProfile = profile;
			image = profile.picture.toString();
			$('#profileIcon').attr('src', image);
			$('#profileIcon').show("slow");
			username = profile.email;
			$('#messagesALL').empty();
			for(var i=msgsSave.length-1; i >= 0; i--){
				handleMsg(msgsSave[i], false);
			}
			socket.emit('check push', username);
		}
		checkToken();
	 });
	}
});
var userProfile;
var msgText = "";
var tags = [];
var now = "";
var userToken;
var image = "";
var uniqueID = "";
$('#login').click(function(e) {
	$('#messagesALL').height(height-188);
	lock.show({
      icon:            'http://i.imgur.com/ppn0iya.png',
      rememberLastLogin:  true
    });
	lock.show(function(err, profile, token) {
		if (err) {
		} else {
			$('#control').show('slow');
			$('#loginMsg').hide('slow');
			$('#login').hide('slow');
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
			socket.emit('check push', username);
		}
	 });
	 
});

$('#liHR').on("click", function() {
	$('#imgHR').toggleClass("faded");
	$('#chkHR').prop("checked", !$('#chkHR').prop("checked"));
});

$('#liA').on("click", function() {
	$('#imgA').toggleClass("faded");
	$('#chkA').prop("checked", !$('#chkA').prop("checked"));				
});

$('#liPH').on("click", function() {
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
					$('#errorCategory').popup("open");
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
					$('#errorImage').popup("open");
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
			msgsSave.unshift({identifier: highest, user: username, msg: msgText, tags: tags, avatar: image, created: now.toISOString()});
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

function savePushWords() {
	var words = $('.pushWords');
	var wordsArr = [];
	$(words).each(function() {
		wordsArr.push($(this).text());
	});
	socket.emit("save push words", username, wordsArr);
}

function addWord() {
	var newWord = $('#pushNoteWords').val();
	$('#pushNoteWords').val("");
	$('#notesContent').append('<div class="pushWords" onclick="removeWord(this)">' + newWord + '</div>');
	savePushWords();
}

function removeWord(div) {
	$(div).remove();
	savePushWords();
}

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

socket.on('allow push', function(){
	allowPush = true;
});

socket.on('show push words', function(words){
	$('#notesContent').html('<input id="pushNoteWords" type="text" placeholder="Enter word to follow" value=""/> <button id="addButton" onclick="addWord()">+</button><br/>');
	for (var i = 0; i < words.length; i++) {
		$('#notesContent').append('<div class="pushWords" onclick="removeWord(this)">' + words[i] + '</div>');
	}
});

socket.on('chat message', function(msg) {
	msgsSave.unshift(msg);
	handleMsg(msg, false);
/*	if (Notification.permission === 'granted') {
		var notification = new Notification('PHAC Connect',
			{
				icon: 'http://i.imgur.com/ppn0iya.png',
				body: 'A new message has been shared.'
			});
		notification.onclick = function() {
			window.open('http://nodejs-phacconnect.rhcloud.com');
		};
	}
*/
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
	var time = date.substring(11,16);
	time = (parseInt(time.substring(0,2)) - 4) + time.substring(2) + " ET";
	date = date.substring(0,10) + ", " + time;
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
				if (tags[i] !== null) {
					if (!search)
						sendMessage(tags[i], u, av, date, userMsg, true);
					else
						sendResults(tags[i], u, av, date, userMsg, true);
				}
			}
		}
		else {
			for (var i=0; i < tags.length; i++) {
				if (tags[i] !== null) {
					if (!search)
						sendMessage(tags[i], u, av, date, userMsg, false);
					else
						sendResults(tags[i], u, av, date, userMsg, false);
				}
			}
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
	var iden = '<div id="msgTextDiv"><span id="userName" onclick="showInfo(\'' + u + '\',\'' + av  + '\')" src="' + av + '" style="font-weight:bold;cursor:pointer;">' + name + '</span><br/><input class="editingMsg" style="display:none" type="textbox"/><div class="msgSpan">';
	iden = '<img id="avatar" onclick="showInfo(\'' + u + '\',\'' + av  + '\')" src="' + av + '" style="height:50px;width:50px;border-width:2px;border-style:solid;border-color:#333;border-radius:50px;margin-right:5px;float:left;cursor:pointer;"/>' + iden;
	$('#messages' + tag).prepend($('<div id="' + uniqueID + '" class="messageDivs ' + uniqueID + '" ' + styleString + '>').html(iden + "</div>"));
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
	var share = "<div id='msgIconDiv'><span style='margin-left:10px;'>";
	var twitterMsg = userMsg.replace(/#/g, "%23");
	twitterMsg = twitterMsg.replace(/&/g, "%26");
	share += "<span id=\"imgSpan\">";
	share += "<img id='returnIcon' onclick='returnMsg(this)' style='display:none;opacity:0.6;width:40px;height:40px;margin-right:20px;' src='images/return.png'/><img class='msgCheck' onclick='msgEditBlur(this)' style='display:none;width:40px;height:40px;margin-right:20px;' src='images/checkmark.png'/><img onclick='getMsgInfo(this)' style='opacity:0.6;width:auto;height:20px;' src='images/ellipsis.png'/>";
	share += "</span></span></div>";
	share += "<div id='msgOptions'>";
	share += "<div style='margin:5px;text-align:center;'><p>Posted: " + date + "</p><div>";
	share += "<img onclick='returnMsg(this)' style='opacity:0.6;width:40px;height:40px;margin-right:20px;' src='images/return.png'/>";
	share += "<a target='_blank' title ='Share via Twitter' href='https://twitter.com/intent/tweet?&text=" + twitterMsg + " - " + u + " (%40PHAC_Connect // " + date + ")'><img style='opacity:0.6;width:40px;height:40px;margin-right:20px;' src='images/tweet.png'/></a> ";
	share += "<a  title='Share via Email' href='mailto:?subject=PHAC Connect&body=";
	share += userMsg + " - " + u + "(PHAC Connect // " + date + ")";
	share += "'><img style='opacity:0.6;width:40px;height:40px;' src='images/mail.png'/></a> ";
	share += "</div></div>";
	share+= "</div>";
	share += "<div id='msgDeleteDiv'>";
	share += "<div style='color:#000;background-color:#f00;margin:-5px;padding:5px;text-align:center;'><p>Delete this message?</p><div>";
	share += "<img onclick='returnMsg(this)' style='width:40px;height:40px;margin-right:20px;' src='images/return.png'/>";
	share += "<img class='msgDelete' onclick='msgDelete(this)' style='width:40px;height:40px;margin-right:20px;' src='images/delete.png'/>"
	share += "</div></div>";
	share+= "</div>";	
	var msg = $('#messages' + tag + ' div').first().html() + share;
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
	var iden = '<div><span onclick="showInfo(\'' + u + '\',\'' + av  + '\')" src="' + av + '" style="font-weight:bold;cursor:pointer;">' + name + '</span><br/><div class="msgSpan" style="margin-left:0">';
	$('#searchResultsDiv').prepend($('<div id="' + uniqueID + '" class="messageDivs ' + uniqueID + '" ' + styleString + '>').html(iden + "</div>"));
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
}

function msgEdit(div) {
	checkParents(div);
	var msgText = $(parentDiv).find('.msgSpan').first().html();
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
	var msgID = $(parentDiv).attr('id');
	var imgTextReplace = "";
	if (imgTextReplaceArr.length > 0)
		imgTextReplace = imgTextReplaceArr.join(" ");
	if (msgText !== "" && imgTextReplace !== "")
		imgTextReplace = " " + imgTextReplace;
	$(parentDiv).find('.msgCheck').show();
	$(parentDiv).find('#returnIcon').show();
	var editText = msgText + imgTextReplace;
	$(parentDiv).find('.editingMsg').val(editText);
	$(parentDiv).find('#msgIconDiv').css("height", "50px");
	$(parentDiv).find('#msgIconDiv').css("padding-top", "5px");
}



function msgEditBlur(div) {
	checkParents(div);
	$(parentDiv).find('#returnIcon').hide();
	$(parentDiv).find('.msgCheck').hide();
	$(parentDiv).find('#msgIconDiv').css("height", "");
	$(parentDiv).find('#msgIconDiv').css("padding-top", "");
	var msgText = $(parentDiv).find('.editingMsg').val();
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
	var msgID = $(parentDiv).attr('id');
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
		$(parentDiv).find('.editingMsg').val("");
		$(parentDiv).find('.editingMsg').hide();
		$(parentDiv).find('.msgSpan').show();
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
	checkParents(div);
	var delAll = true;
	var type = "";
	var msgID = $(parentDiv).attr('id');
	var color = $(parentDiv).attr('style');
	color = color.slice(-15);
	color = color.slice(0,-2);
	switch (color) {
		case "142, 184, 229":
		case "168, 210, 255":
			type = "ALL";
		break;
		case "(255, 131, 96":
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
		$(parentDiv).hide('fast');
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

$('#profileIcon').click(function() {
	$('#dialog').popup("close");
	$('#personalImg').attr('src', image);
	if (allowPush) {
			$('#personalOptions').html('<a href="http://www.gravatar.com/" target="_blank"><button>Change Picture</button></a>&nbsp;<button onclick="reload()">Logout</button>');
			notesContent();
		}
		else {
			$('#personalOptions').html('<a href="http://www.gravatar.com/" target="_blank"><button>Change Picture</button></a>&nbsp;<button onclick="reload()">Logout</button>');
			$('#notesContent').html('Allow PHAC Connect to send notifications with <a href="https://www.pushbullet.com/authorize?client_id=hNeDLXhFEM02fbzKwQrSBIEKQJcYMpAK&redirect_uri=http%3A%2F%2Fnodejs-phacconnect.rhcloud.com%2F&response_type=token&scope=everything">PushBullet.</a>');
		}
	$('#personalEmail').html('<a href="mailto:' + username + '">' + username + '</a>');
	$('#personalInfo').popup("open");
});

function notesContent() {
	socket.emit('push words', username);
}

function reload() {
	localStorage.removeItem('userToken');
	location.reload();
}

function reloadReturn() {
	$('#messagesALL').empty();
	$('#messagesA').empty();
	$('#messagesHR').empty();
	$('#messagesPH').empty();

	for(var i=msgsSave.length-1; i >= 0; i--){
		handleMsg(msgsSave[i], false);
	}
}

function showInfo(email,image) {
	ga('send', 'event', 'Show Info', email);
	if (email === username) {
		$('#dialog').popup("close");
		$('#personalImg').attr('src', image);
		if (allowPush) {
			$('#personalOptions').html('<a href="http://www.gravatar.com/" target="_blank"><button>Change Picture</button></a>&nbsp;<button onclick="reload()">Logout</button>');
			notesContent();
		}
		else {
			$('#personalOptions').html('<a href="http://www.gravatar.com/" target="_blank"><button>Change Picture</button></a>&nbsp;<button onclick="reload()">Logout</button>');
			$('#notesContent').html('Allow PHAC Connect to send notifications with <a href="https://www.pushbullet.com/authorize?client_id=hNeDLXhFEM02fbzKwQrSBIEKQJcYMpAK&redirect_uri=http%3A%2F%2Fnodejs-phacconnect.rhcloud.com%2F&response_type=token&scope=everything">PushBullet.</a>');
		}
		$('#personalEmail').html('<a href="mailto:' + username + '">' + username + '</a>');
		$('#personalInfo').popup("open");
	}
	else {
	$('#personalInfo').popup("close");
	$('#userImg').attr('src', image);
	$('#userOptions').html('');
	$('#userEmail').html('<a href="mailto:' + email + '">' + email + '</a>');
	$('#dialog').popup("open");
	}
}

function searchResults(text) {
	ga('send', 'event', 'Search tags');
	socket.emit('search tags', text);
	$('#personalInfo').popup("close");
	$('#dialog').popup("close");
	$('#searchResults').popup("open");

}

/*
function getPermission() {
	if (!Notification) {
		alert('Notifications are not compatible with this browser.');
		return;
	}
	if (Notification.permission !== 'granted')
		Notification.requestPermission();
		
	$('#pushNotes').hide('slow');
}
*/