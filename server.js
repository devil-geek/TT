// modules =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mosca = require('mosca');
var settings = {
	port: 1883
};

var reset = '\u001b[37m';
var red = '\u001b[31m';
var green =  '\u001b[32m';
var yellow = '\u001b[33m';
var blue = '\u001b[34m';
var margenta = '\u001b[35m';
var cyan =  '\u001b[36m';
//var white =  '\u001b[0m'; reset color


var mqttserver = new mosca.Server(settings);
// configuration ===========================================

// config files
var db = require('./config/db');

var port = process.env.PORT || 8080; // set our port
// mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port);
mqttserver.attachHttpServer(app);
console.log(margenta + 'Magic happens on port: '+ reset + port); 			// shoutout to the user

mqttserver.on('ready',function(){
		console.log(green + "MQTT server online puerto: "+ reset + settings.port + "\n");
});


mqttserver.on('clientConnected',function(client){
		console.log(blue + "Cliente conectado id: "+ reset + client.id +"\n");
});

mqttserver.on('clientDisconnected',function(client){
		console.log(red + "Cliente desconectado id: "+ reset + client.id +"\n");
		
		var msg = {
			topic: client.id + "/status",
			payload: "Offline",
			qos: 0,
			retain: true
		}

		mqttserver.publish(msg);
});

mqttserver.on('subscribed',function(topic, client){
		console.log(yellow + "Cliente id: "+ reset + client.id + yellow+" suscrito a "+ reset + topic +"\n");
});


mqttserver.on('published',function(packet, client){
	if(client != undefined){
		console.log(cyan + "Cliente id: "+ reset + client.id + cyan +
					" publico a "+ reset + packet.topic + cyan +
					" contenido: "+ reset + Buffer(packet.payload).toString() +"\n");
	}
});



exports = module.exports = app; 						// expose app
