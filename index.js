var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var socketioJwt = require('socketio-jwt');
var jwt = require('express-jwt');
var mongoose = require('mongoose');
server.listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
//server.listen(3001);

var jwtCheck = jwt({
  secret: new Buffer('HO_BSpKmYZWaYuXRbhuC0zbDUE6dWeMLkdqVTrOzvV8wmMnwBgj8vijMHPBsXVwe', 'base64'),
  audience: 'TjWERMTxpeB9snWo1rSRjLrEhPNNWziz'
});

mongoose.connect(process.env.OPENSHIFT_MONGODB_DB_URL);
//mongoose.connect('mongodb://localhost/messages');

var chatSchema = mongoose.Schema({
	user: String,
	msg: String,
	type: String,
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

app.get('/scripts/script.js', function(req, res){
   res.sendFile(__dirname + '/scripts/script.js');
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
app.get('/images/mail.png', function(req, res){
   res.sendFile(__dirname + '/images/mail.png');
});

app.get('/users/av/Cameron.png', function(req, res){
   res.sendFile(__dirname + '/users/av/Cameron.png');
});


io.sockets.on('connection', socketioJwt.authorize({
    secret: Buffer('HO_BSpKmYZWaYuXRbhuC0zbDUE6dWeMLkdqVTrOzvV8wmMnwBgj8vijMHPBsXVwe', 'base64'),
    timeout: 15000 // 15 seconds to send the authentication message
  })).on('authenticated', function(socket) {
  });

io.sockets.on('connection', function(socket) {

	var query = Chat.find({});
	query.sort('-created').limit(80).exec(function(err,msgs) {
		if(err) throw err;
		socket.emit('load history', msgs);
	});
	socket.on('chat message', function(msg){
		var newMsg = new Chat({user: msg.user, msg: msg.msg, type: msg.type});
		newMsg.save(function(err){
			if(err) throw err;
			io.sockets.emit('chat message', msg);
		});
	});
});
