			var lock = null;
			$(document).ready(function() {
				lock = new Auth0Lock('TjWERMTxpeB9snWo1rSRjLrEhPNNWziz', 'phacconnect.auth0.com');
			});
			var userProfile;
			var msgText = "";
			var type = "";
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
			var socket = io();
			$('form').submit(function(e) {
			e.preventDefault();
				if ($('#m').val() !== "") {
					msgText = $('#m').val();
					type = $('#ddlMsgType').val();
					now = new Date();
					image = userProfile.picture;
					socket.emit('chat message', {user: username, msg: msgText, type: type, avatar: image, created: now});
					$('#m').val('');
					$('#ddlMsgType').val("General");
				}
				return false;
			});

			socket.on('connect', function() {}).emit('authenticate', {
				token: userToken
			}); // send the jwt
			
			socket.on('load history', function(msgs){
				for(var i=msgs.length-1; i >= 0; i--){
					handleMsg(msgs[i]);
				}
			});

			socket.on('chat message', function(msg) {
				handleMsg(msg);
			});
			
			function handleMsg(msg) {
				var u = msg.user;
				var av = msg.avatar;
				if (!av) {
					av = "./users/av/Default.png";
				}
				var style = msg.type;
				var userMsg = msg.msg;
				var date = msg.created;
				date = date.substring(0,10) + ", " + date.substring(11,16);
				userMsg = userMsg.replace(/;/g, "");
				userMsg = userMsg.replace(/&/g, "and");
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
						styleString = 'style="background-color:#ededed"';
				}

				var iden = '<span><span style="font-weight:bold;">' + u + '</span>: <span class="msgSpan">';
				iden = '<img src="' + av + '" style="height:20px;width:20px;border-width:2px;border-style:solid;border-color:#333;border-radius:25px;margin-right:5px;float:left;"/>' + iden;
				$('#messages').prepend($('<div onmouseout="hideButton(this)" onmouseover="showButton(this)" ' + styleString + '>').html(iden + "</span>"));
				$('.msgSpan').first().text(userMsg); // This is to ensure no html can be applied to the messages.
				var share = "<span style='margin-left:10px;'>";
				share += "<span id=\"imgSpan\" style=\"opacity:0\"><a target='_blank' style='display:inline-block;' href='https://twitter.com/intent/tweet?&text=" + userMsg + " - " + u + " (PHAC Connect :: " + date + ")'><button class='shareButton'><img style='width:18px;height:12px;' src='images/tweet.png'/> Twitter</button></a> ";
				share += "<a style='display:inline-block;' href='mailto:?subject=PHAC Connect&body=";
				share += userMsg + " - " + u + "(PHAC Connect :: " + date + ")";
				share += "'><button class='shareButton'><img style='width:18px;height:12px;' src='images/mail.png'/> Email</button></a> ";
				share += "<em>Posted: " + date + "</em>";
				share += "</span></span>";
				var msg = $('#messages div').first().html() + share + "</span>";
				$('#messages div').first().html(msg);
			}

			function showButton(span) {
				$(span).find("#imgSpan").stop();
				$(span).find("#imgSpan").fadeTo(200,1);
			}

			function hideButton(span) {
				$(span).find("#imgSpan").stop();
				$(span).find("#imgSpan").fadeTo(200,0);
			}