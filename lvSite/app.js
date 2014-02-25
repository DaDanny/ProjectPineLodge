
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var chat = require('./routes/chat');
var socketio = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/boot', routes.bootstrap);
app.get('/test',routes.test);
app.get('/old',routes.old);
app.get('/chat',chat.main);

var server = app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = socketio.listen(server);
var clients = {};


var socketsOfClients = {};
io.sockets.on('connection', function(socket){
	socket.on('set username', function(userName){
		if(clients[userName] == undefined){
			clients[userName] = socket.id;
			socketsOfClients[socket.id] = userName;
			userNameAvailable(socket.id,userName);
			userJoined(userName);
		}
		else{
			userNameAlreadyInUse(socket.id,userName);
		}
	});

	socket.on('message', function(msg){
		var srcUser;
		if(msg.inferSrcUser){
			srcUser = socketsOfClients[socket.id];
		}
		else{
			srcUser = msg.source;
		}
		//User wants to send message to everyone in chat
		if(msg.target == "All"){
			io.sockets.emit('message',
			{
				"source": srcUser,
				"message": msg.message,
				"target": msg.target
			});
		}
		//User is sending message to specific user
		else{
			io.sockets.sockets[clients[msg.target]].emit('message',
			{
				"source": srcUser,
				"message": msg.message,
				"target": msg.target
			});

		}
	})

	socket.on('disconnect', function(){
		var uName = socketsOfClients[socket.id];
		delete socketsOfClients[socket.id];
		delete clients[uName];

		userLeft(uName);
	})
})

function userJoined(uName){
	Object.keys(socketsOfClients).forEach(function(sId){
		io.sockets.sockets[sId].emit('userJoined',{"userName": uName});
	})
}

function userLeft(uName){
	io.sockets.emit('userLeft',{"userName":uName});
}

function userNameAvailable(sId, uName){
	setTimeout(function(){
		console.log('Sending welcome msg to ' + uName + ' at '+sId);
		io.sockets.sockets[sId].emit('welcome', {"userName":uName,"currentUsers": JSON.stringify(Object.keys(clients))});
	}, 500);
}

function userNameAlreadyInUse(sId, uName){
	setTimeout(function(){
		io.sockets.sockets[sId].emit('error',{"userNameInUse" :true});
	}, 500);
};
