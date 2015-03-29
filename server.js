var express = require('express');
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);
var mongojs = require('mongojs');
var request = require('request');

var port = process.env.PORT || 3000;
// var port = 3000;

var uri = "mongodb://master:golf@ds062097.mongolab.com:62097/golf";
var golferDB = mongojs(uri, ['golfer_reservation_requests']);
var courseDB = mongojs(uri, ['course_reservation_requests']);


app.get('/', function(req, res){

	golferDB.golfer_reservation_requests.find({},function(err,docs){

		var html = "";

		for(var i = 0; i<docs.length; i++){
			docs[i].reservation_requests.forEach(function(reserve){

				html = html + "<div>person: " + docs[i].token + "</div><br/><div>reservation: " + reserve.name + " " + reserve.date + " " + reserve.time + "</div><br/><br/>"

			});
		}

		// docs.forEach(function(people){

		// 	people.reservation_requests.forEach(function(reserve){

		// 		html = html + "<div>person: " + people.token + "</div><br/><div>reservation: " + reserve.FacilityID + " " + reserve.Time + "</div><br/><br/>"

		// 	});

		// });
		res.send(html);
	});
	// res.send('hello world');
});

app.listen(port);

console.log(port);


request.get(
		    {
		    	uri:'https://sandbox.api.gnsvc.com/rest/channel/17652/facilities?q=geo-location&latitude=28.4158&longitude=-81.2989&proximity=25&expand=FacilityDetail.Ratesets',
		     headers: { 'UserName': "Hackathon_Development",
		              	'Password': "6YBkHF86ut7946pDwZhp",
		          		"Access-Control-Allow-Origin": "*"} 
		 },
		    function (error, response, body) {
		        if (!error && response.statusCode == 200) {
		            // console.log(body);
		            filterTeeTimes(JSON.parse(body), {startTime:'08:00:00', endTime:'11:00:00', token:'hi', date:"2015-03-29", price:"$12.50"});


		        }
		    }
		);


// //while connected to a client
io.on('connection', function(socket) {

	socket.emit('auth.tokenReceived', "hi");

	socket.on('reservation.sent', function(data){


		//sends the yo back with a link
		request.get(
		    {
		    	uri:'https://sandbox.api.gnsvc.com/rest/channel/17652/facilities?q=geo-location&latitude=28.4158&longitude=-81.2989&proximity=25&expand=FacilityDetail.Ratesets',
		     headers: { 'UserName': "Hackathon_Development",
		              	'Password': "6YBkHF86ut7946pDwZhp",
		          		"Access-Control-Allow-Origin": "*"} 
		 },
		    function (error, response, body) {
		        if (!error && response.statusCode == 200) {
		            console.log(body);
		            filterTeeTimes(body, data);
		        }
		    }
		);



		// golferDB.golfer_reservation_requests.findAndModify({
  //           query: {_id:mongojs.ObjectId(doc.caseId)},
  //           update: { $push: {"reservation_requests":doc._id}}
  //       });
	});


	socket.on('reservations.get.golfer', function(data){

		golferDB.golfer_reservation_requests.findOne({"token":socket.username}, function(doc){

			sendSorted(doc,socket);

		});


	});


	socket.on('reservations.get.course', function(data){});

	socket.on('auth.user', function(data){

		console.log("halp")
		// request.post(
		//     {
		//     	uri:'https://sandbox.api.gnsvc.com/rest/customers/' + data.userEmail + '/authentication-token?timeout=30',
		//      	headers: { 'UserName': "Hackathon_Development",
		//               	'Password': "6YBkHF86ut7946pDwZhp",
		//           		"Access-Control-Allow-Origin": "*"},
		//         form: {
		// 			"EMail": data.userEmail,
		// 			"Password": data.password
		// 		}

		//  },
		//     function (error, response, body) {
		//         if (!error && response.statusCode == 200) {
		//             console.log(body);
		//             if(body === "Invalid login."){
		//             	socket.emit('auth.tokenDenied');
		//             }else{
		//             	socket.username = body;

		// 				var temp = {
		// 					"token":body,
		// 					"reservation_requests":[]
		// 				}
						
		// 				golferDB.golfer_reservation_requests.find({"token":body}, function(docs){

		// 					if(docs.length == 0){
		// 						golferDB.golfer_reservation_requests.save(temp);
		// 					}

		// 				});
		// 					// golferDB.golfer_reservation_requests.save(temp);

		// 				socket.emit('auth.tokenReceived', body);								            	
		//             }
		//         }
		//     }
		// );

		socket.emit('auth.tokenReceived', "hi");

	});

	// socket.on('test', function(data){
	// 	socket.emit('ack', ßdata);
	// });

});

function filterTeeTimes(getReq, userData){

	getReq.forEach(function (golfCourse) {

		golfCourse.Ratesets.Value.forEach(function (teeTime){
			teeTime.status = "pending";
			teeTime.name = golfCourse.Name;
			// console.log("a");
			var date = teeTime.Time.split('T')[0];
			var time = teeTime.Time.split('T')[1];

			if(date === userData.date){
				// console.log("b");
				var courseTimeSplit = time.split(':');
				var golferStartTimeSplit = userData.startTime.split(':');
				var golferEndTimeSplit = userData.endTime.split(':');

				var courseSeconds = (courseTimeSplit[0]*60*60)+(courseTimeSplit[1]*60)+courseTimeSplit[2];
				var golferStartSeconds = (golferStartTimeSplit[0]*60*60)+(golferStartTimeSplit[1]*60)+golferStartTimeSplit[2];
				var golferEndSeconds = (golferEndTimeSplit[0]*60*60)+(golferEndTimeSplit[1]*60)+golferEndTimeSplit[2];

				if(courseSeconds >= golferStartSeconds && courseSeconds <= golferEndSeconds){	
					// console.log("mongo");
					var temp = {
						status:"pending",
						name:golfCourse.Name,
						price:userData.price,
						date:teeTime.Time.split('T')[0],
						time:teeTime.Time.split('T')[1]
					}

					golferDB.golfer_reservation_requests.update({"token":userData.token},{ $push: {"reservation_requests":temp}},
			        	{new:true}
			        ,function(err, doc){
			        	// console.log("help"+doc);


			      

			        });

					//golferDB.golfer_reservation_requests.update({username:data.username}, {'$inc':{'clues':1}}, {'upsert':true});
					// IF WE HAVE TIME TO HAVE ANOTHER DB FOR COURSES
			        // courseDB.course_reservation_requests.findAndModify({
			        //     query: {token:userData.token},
			        //     update: { $push: {"reservation_requests":teeTime},
			        // 	upsert: true}
			        // });

				}

			}else{

			}
		});

	});

}

function sendSorted(data,socket){

	var accepted = [];
	var pending = [];
	var declined = [];

	// golferDB.golfer_reservation_requests.findOne({"token":"hi"}, function(doc){

	data.reservation_requests.forEach(function(tee){

		if(tee.status === "accepted"){
			accepted.push(tee);
		}

		if(tee.status === "pending"){
			pending.push(tee);
		}

		if(tee.status === "declined"){
			declined.push(tee);
		}

	});


	socket.emit('send.reservations.golfer.accepted', accepted);
	socket.emit('send.reservations.golfer.pending', pending);
	socket.emit('send.reservations.golfer.declined', declined);

						// });

}