			var height = window.innerHeight - 122;
			document.getElementById("messagesHR").style.height = height + "px";
			document.getElementById("messagesA").style.height = height + "px";
			document.getElementById("messagesPH").style.height = height + "px";
			document.getElementById("messagesALL").style.height = height + "px";
			
			var lock = null;
			$(document).ready(function() {
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
				console.log(msg.tags);
				var u = msg.user;
				var av = msg.avatar;
				if (!av) {
					av = "./users/av/Default.png";
				}
				var tags = msg.tags;
				var userMsg = msg.msg;
				console.log(userMsg);
				var date = msg.created;
				date = date.substring(0,10) + ", " + date.substring(11,16);
				userMsg = userMsg.replace(/;/g, "");
				userMsg = userMsg.replace(/&/g, "and");
				var numDivs = 0;
				if (tags.length == 0) {
					sendMessage('ALL', u, av, date, userMsg, numDivs);
				}
				else {
					sendMessage('ALL', u, av, date, userMsg, numDivs);
					for (var i=0; i < tags.length; i++)
						sendMessage(tags[i], u, av, date, userMsg, numDivs);
				}
			}
			
			function sendMessage(tag, u, av, date, userMsg, numDivs) {
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

				var iden = '<span><span style="font-weight:bold;">' + u + '</span>: <span class="msgSpan">';
				iden = '<img src="' + av + '" style="height:20px;width:20px;border-width:2px;border-style:solid;border-color:#333;border-radius:25px;margin-right:5px;float:left;"/>' + iden;
				$('#messages' + tag).prepend($('<div class="messageDivs" onmouseout="hideButton(this)" onmouseover="showButton(this)" ' + styleString + '>').html(iden + "</span>"));
				$('#messages' + tag + ' .messageDivs .msgSpan').first().text(userMsg); // This is to ensure no html can be applied to the messages.
				var share = "<span style='margin-left:10px;'>";
				share += "<span id=\"imgSpan\" style=\"opacity:0\"><a target='_blank' style='display:inline-block;' href='https://twitter.com/intent/tweet?&text=" + userMsg + " - " + u + " (PHAC Connect :: " + date + ")'><img style='width:12px;height:12px;' src='images/tweet.png'/></a> ";
				share += "<a style='display:inline-block;' href='mailto:?subject=PHAC Connect&body=";
				share += userMsg + " - " + u + "(PHAC Connect :: " + date + ")";
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