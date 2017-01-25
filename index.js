var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var socketioJwt = require('socketio-jwt');
var jwt = require('express-jwt');
var mongoose = require('mongoose');
var PushBullet = require('pushbullet');

/* Deployment */
server.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
mongoose.connect(process.env.OPENSHIFT_MONGODB_DB_URL);

/* Development */
//server.listen(3001);
//mongoose.connect('mongodb://localhost/messages');

var jwtCheck = jwt({
  secret: new Buffer('HO_BSpKmYZWaYuXRbhuC0zbDUE6dWeMLkdqVTrOzvV8wmMnwBgj8vijMHPBsXVwe', 'base64'),
  audience: 'TjWERMTxpeB9snWo1rSRjLrEhPNNWziz'
});

var chatSchema = mongoose.Schema({
	identifier: Number,
	user: String,
	msg: String,
	tags: [String],
	avatar: String,
	created: {type: Date, default: Date.now}
	});
	
var Chat = mongoose.model('Message', chatSchema);

var userSchema = mongoose.Schema({
	user: String,
	pushToken: String,
	subscriptions: [String]
	});
	
var Users = mongoose.model('User', userSchema);

app.use('/index.html', jwtCheck);

app.get('/', function(req, res) {
      res.sendFile(__dirname + '/index.html');  
    });

	
app.get('/mobileIndex.html', function(req, res) {
      res.sendFile(__dirname + '/mobileIndex.html');  
});
	
app.get('/images/alert.png', function(req, res){
   res.sendFile(__dirname + '/images/alert.png');
});

app.get('/images/return.png', function(req, res){
   res.sendFile(__dirname + '/images/return.png');
});

app.get('/images/key.png', function(req, res){
   res.sendFile(__dirname + '/images/key.png');
});

app.get('/images/ellipsis.png', function(req, res){
   res.sendFile(__dirname + '/images/ellipsis.png');
});

app.get('/images/push.png', function(req, res){
   res.sendFile(__dirname + '/images/push.png');
});

app.get('/images/gov.png', function(req, res){
   res.sendFile(__dirname + '/images/gov.png');
});

app.get('/images/columnSwitch.png', function(req, res){
   res.sendFile(__dirname + '/images/columnSwitch.png');
});

app.get('/json/manifest.json', function(req, res){
   res.sendFile(__dirname + '/json/manifest.json');
});

app.get('/scripts/script.js', function(req, res){
   res.sendFile(__dirname + '/scripts/script.js');
});

app.get('/scripts/mobileScript.js', function(req, res){
   res.sendFile(__dirname + '/scripts/mobileScript.js');
});


app.get('/scripts/jquery.slimscroll.js', function(req, res){
   res.sendFile(__dirname + '/scripts/jquery.slimscroll.js');
});

app.get('/styles/style.css', function(req, res){
   res.sendFile(__dirname + '/styles/style.css');
});

app.get('/styles/mobileStyle.css', function(req, res){
   res.sendFile(__dirname + '/styles/mobileStyle.css');
});

app.get('/users/users.txt', function(req, res){
   res.sendFile(__dirname + '/users/users.txt');
});

app.get('/images/tweet.png', function(req, res){
   res.sendFile(__dirname + '/images/tweet.png');
});

app.get('/images/delete.png', function(req, res){
   res.sendFile(__dirname + '/images/delete.png');
});

app.get('/images/edit.png', function(req, res){
   res.sendFile(__dirname + '/images/edit.png');
});

app.get('/images/favicon.ico', function(req, res){
   res.sendFile(__dirname + '/images/favicon.ico');
});

app.get('/images/mapleleaf.png', function(req, res){
   res.sendFile(__dirname + '/images/mapleleaf.png');
});

app.get('/images/tags/hr.png', function(req, res){
   res.sendFile(__dirname + '/images/tags/hr.png');
});

app.get('/images/tags/announcements.png', function(req, res){
   res.sendFile(__dirname + '/images/tags/announcements.png');
});

app.get('/images/tags/publichealth.png', function(req, res){
   res.sendFile(__dirname + '/images/tags/publichealth.png');
});

app.get('/images/mail.png', function(req, res){
   res.sendFile(__dirname + '/images/mail.png');
});

app.get('/images/time.png', function(req, res){
   res.sendFile(__dirname + '/images/time.png');
});

app.get('/images/checkmark.png', function(req, res){
   res.sendFile(__dirname + '/images/checkmark.png');
});

app.get('/users/av/Default.png', function(req, res){
   res.sendFile(__dirname + '/users/av/Default.png');
});


io.sockets.on('connection', socketioJwt.authorize({
    secret: Buffer('HO_BSpKmYZWaYuXRbhuC0zbDUE6dWeMLkdqVTrOzvV8wmMnwBgj8vijMHPBsXVwe', 'base64'),
    timeout: 15000 // 15 seconds to send the authentication message
  })).on('authenticated', function(socket) {
  });
 

io.sockets.on('connection', function(socket) {
	var query = Chat.find({});
	query.sort('-created').limit(250).exec(function(err,msgs) {
		if(err) throw err;
		socket.emit('load history', msgs);
	});
	
	socket.on('save token', function(username, token){
		Users.find({"user":username}, function(e,r) {
			if (r.length > 0) {
				Users.update({user: username}, {$set:{pushToken:token}}, function(err, result) {
					if (err) throw err;
				});
			}
			else {
				var newUser = new Users({user: username, pushToken: token, subscriptions: []});
				newUser.save(function(err){
					if(err) throw err;
				});	
			}
			socket.emit('allow push');
		});
	});
	
	socket.on('check push', function(username){
		Users.find({"user":username}, function(e,r) {
			if (r.length > 0) {
				if (r.pushToken !== "")
					socket.emit('allow push');
			}
		});
	});
	
	socket.on('push words', function(text){
		var query = Users.find({"user": text}).findOne().exec(function (e, user) {
		if(e) throw e;
			socket.emit('show push words', user.subscriptions);
		});
	});
	
	socket.on('save push words', function(username, pushWords){
		Users.update({user: username}, {$set:{subscriptions:pushWords}}, function(err, result) {
			if (err) throw err;
		});
	});
	
	socket.on('search tags', function(text){
		var query = Chat.find({"msg": {'$regex': new RegExp(text, "i")}});
			query.sort('-created').limit(250).exec(function(err,msgs) {
		if(err) throw err;
		socket.emit('show tags', msgs);
		});
	});
	
	socket.on('delete message', function(id){
		Chat.remove({identifier: id}, function(err, result) {
			if (err) throw err;
		});
	});
	
	socket.on('remove tag', function(id, newTags){
		Chat.update({identifier: id}, {$set:{tags:newTags}}, function(err, result) {
			if (err) throw err;
		});
	});
	
	socket.on('edit message', function(id, msgText){
		Chat.update({identifier: id}, {$set:{msg:msgText}}, function(err, result) {
			if (err) throw err;
		});
	});
	
	socket.on('chat message', function(msg){
		var q = Chat.find({});
		q.findOne().sort('-identifier').exec(function(err,msgOne) {
			var count = 1;
			if(err) throw err;
			if (msgOne != null) {
				count = msgOne.identifier;
				count++;
			}
			sendPushNotes(msg.user, msg.msg);
			var newMsg = new Chat({identifier: count, user: msg.user, msg: msg.msg, tags: msg.tags, avatar: msg.avatar, created: msg.created});
			newMsg.save(function(err){
				if(err) throw err;
				socket.broadcast.emit('chat message', newMsg);
			});		
		});		
	});
	
	function sendPushNotes(user, msg) {
		Users.find({}, function(e, r) {
			for (var i = 0; i < r.length; i++) {
				var match = false;
				var subs = r[i].subscriptions;
				for (var j = 0; j < subs.length; j++) {
					if (msg.indexOf(subs[j]) != -1 && subs[j] !== "")
						match = true;
				}
				if (match && r[i].pushToken !== "" && r[i].user !== user) {
					var token = r[i].pushToken;
					var userPush = new PushBullet(token);
					userPush.devices(function(err, response) {
						userPush.note({}, "PHAC Connect", user.split("@")[0] + ": " + msg, function(e, r) {
						});
					});
				}
			}
		});
	}
});
