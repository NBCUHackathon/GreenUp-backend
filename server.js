var express = require('express');
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);
var mongojs = require('mongojs');
var request = require('request');

var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(port);

// var uri = "mongodb://pacific-brook-1:HackMCO2015@ds062097.mongolab.com:62097/golf";
// var golferDB = mongojs(uri, ['golfer_reservation_requests']);
// var courseDB = mongojs(uri, ['course_reservation_requests']);


// //while connected to a client
io.on('connection', function(socket) {

	socket.on('reservation.sent', function(data){






		// golferDB.golfer_reservation_requests.findAndModify({
  //           query: {_id:mongojs.ObjectId(doc.caseId)},
  //           update: { $push: {"reservation_requests":doc._id}}
  //       });
	});


	socket.on('reservations.get.golfer', function(data){});


	socket.on('reservations.get.course', function(data){});

});