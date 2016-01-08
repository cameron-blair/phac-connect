/**var lock = null;
			$(document).ready(function() {
				lock = new Auth0Lock('TjWERMTxpeB9snWo1rSRjLrEhPNNWziz', 'phacconnect.auth0.com');
			}); **/
			var userProfile;
			var msgText = "";
			var type = "";
			var userToken;
			var username = "Guest";
			$('#login').click(function(e) {
				e.preventDefault();
				/**lock.show(function(err, profile, token) {
					if (err) {
						alert('There was an error');
						alert(err);
					} else {**/
						$('#control').css("display", "");
						$('#loginMsg').css("display", "none");
						//userToken = token;
						//localStorage.setItem('userToken', token);
						//userProfile = profile;
						//$('#login').html(profile.email);
						//var emailArr = profile.email.split("@");
						//username = emailArr[0];
					//}
				//})
			});
			var socket = io.connect("http://nodejs-phacconnect.rhcloud.com:8000");
			$('form').submit(function(e) {
			e.preventDefault();
				if ($('#m').val() !== "") {
					msgText = $('#m').val();
					type = $('#ddlMsgType').val();
					socket.emit('chat message', {user: username, msg: msgText, type: type});
					$('#m').val('');
					$('#ddlMsgType').val("General");
				}
				return false;
			});
			//socket.on('connect', function() {}).emit('authenticate', {
			//	token: userToken
			//}); // send the jwt
			
			//socket.on('load history', function(msgs){
			//	for(var i=msgs.length-1; i >= 0; i--){
			//		handleMsg(msgs[i]);
			//	}
			//});

			socket.on('chat message', function(msg) {
				handleMsg(msg);
			});
			
			function handleMsg(msg) {
				var u = msg.user;
				var style = msg.type;
				var userMsg = msg.msg;
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
						styleString = 'style="background-color:#bbb"';
				}

				var iden = '<span><span style="font-weight:bold;">' + u + '</span>: <span class="msgSpan">';
				iden = '<img src="../users/av/Cameron.png" style="height:20px;width:20px;border-width:2px;border-style:solid;border-color:#333;border-radius:25px;margin-right:5px;float:left;"/>' + iden;
				$('#messages').prepend($('<div onmouseout="hideButton(this)" onmouseover="showButton(this)" ' + styleString + '>').html(iden + "</span>"));
				$('.msgSpan').first().text(userMsg); // This is to ensure no html can be applied to the messages.
				var share = "<span style='margin-left:10px;'>";
				share += "<span id=\"imgSpan\" style=\"visibility:hidden\"><a target='_blank' style='display:inline-block;' href=\"https://twitter.com/intent/tweet?&text=" + userMsg + " - Shared via PHAC Connect\"><button style='border-radius:5px;color:#333;font-size:.8em;border:1px solid #aaa'><img style=\"width:18px;height:12px;\" src=\"images/tweet.png\"/> Share</button></a></span></span>";
				var msg = $('#messages div').first().html() + share + "</span>";
				$('#messages div').first().html(msg);
				
			}

			function showButton(span) {
				span.querySelector("#imgSpan").style.visibility = "visible";
			}

			function hideButton(span) {
				span.querySelector("#imgSpan").style.visibility = "hidden";
			}