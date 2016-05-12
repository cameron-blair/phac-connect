var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var socketioJwt = require('socketio-jwt');
var jwt = require('express-jwt');
var mongoose = require('mongoose');

/* Deployment */
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
//mongoose.connect(process.env.OPENSHIFT_MONGODB_DB_URL);

/* Development */
server.listen(3001);
mongoose.connect('mongodb://localhost/messages');

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

app.use('/index.html', jwtCheck);

app.get('/', function(req, res) {
      res.sendFile(__dirname + '/index.html');  
    });
	

app.get('/images/gov.png', function(req, res){
   res.sendFile(__dirname + '/images/gov.png');
});

app.get('/images/columnSwitch.png', function(req, res){
   res.sendFile(__dirname + '/images/columnSwitch.png');
});

app.get('/scripts/script.js', function(req, res){
   res.sendFile(__dirname + '/scripts/script.js');
});

app.get('/scripts/jquery.slimscroll.js', function(req, res){
   res.sendFile(__dirname + '/scripts/jquery.slimscroll.js');
});

app.get('/styles/style.css', function(req, res){
   res.sendFile(__dirname + '/styles/style.css');
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
	
	socket.on('delete message', function(id){
		Chat.remove({identifier: id}, function(err, result) {
			if (err) {
				console.log(err);
			}
			console.log(result);
		});
	});
	
	socket.on('edit message', function(id, msgText){
		Chat.update({identifier: id}, {$set:{msg:msgText}}, function(err, result) {
			if (err) {
				console.log(err);
			}
			console.log(result);
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
			var newMsg = new Chat({identifier: count, user: msg.user, msg: msg.msg, tags: msg.tags, avatar: msg.avatar, created: msg.created});
			newMsg.save(function(err){
				if(err) throw err;
				io.sockets.emit('chat message', newMsg);
			});		
		});		
	});
});
