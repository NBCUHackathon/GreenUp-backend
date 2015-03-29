/*
SAVVYSERVER
*/


//Server Init Stuff
var http = require("http");
var server = http.createServer(requestHandler);
function requestHandler(req, res) {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write("Hello World");
    res.end();
}

//require db npm packages
var mongojs = require('mongojs');
var request = require('request');

//Socket.io init
var io = require('socket.io')(server);

var uri = "mongodb://master:golf@ds062097.mongolab.com:62097/golf";
var golferDB = mongojs(uri, ['golfer_reservation_requests']);
var courseDB = mongojs(uri, ['course_reservation_requests']);

server.listen(9999);

var tokenGen = 0;
var tokens = ["sdbf78ybf78bf7bf7896dfn987fgny7dfgn78dfgn7bfsuoybiuyfgy79dfgn678fdn6789dfgn7689dfg6779dfgn67dfgn","dng7896n6789dfgh67dfgh678dfgh867dfgh867dfgh678fdgh678dfgh7869fdgh786dfgh6789678"];


// //while connected to a client
io.on('connection', function(socket) {

	// socket.emit('auth.tokenReceived', "hi");

	socket.on('reservation.sent', function(data){

		data.token = socket.username;
		data.token = "sdbf78ybf78bf7bf7896dfn987fgny7dfgn78dfgn7bfsuoybiuyfgy79dfgn678fdn6789dfgn7689dfg6779dfgn67dfgn";
		console.log(data.token);
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
		            // console.log(body);
		            filterTeeTimes(JSON.parse(body), data);
		        }
		    }
		);



		// golferDB.golfer_reservation_requests.findAndModify({
  //           query: {_id:mongojs.ObjectId(doc.caseId)},
  //           update: { $push: {"reservation_requests":doc._id}}
  //       });
	});


	socket.on('reservations.get.golfer', function(data){

		golferDB.golfer_reservation_requests.findOne({"token":"sdbf78ybf78bf7bf7896dfn987fgny7dfgn78dfgn7bfsuoybiuyfgy79dfgn678fdn6789dfgn7689dfg6779dfgn67dfgn"}, function(doc){

			sendSorted(doc);
			// socket.emit('send.reservations.golfer.accepted', "accepted");
			// socket.emit('send.reservations.golfer.pending', "pending");
			// socket.emit('send.reservations.golfer.declined', "declined");
			// socket.emit('ack',"yes");
		});

		// socket.emit('send.reservations.golfer.accepted', "accepted");
		// 	socket.emit('send.reservations.golfer.pending', "pending");
		// 	socket.emit('send.reservations.golfer.declined', "declined");
	});

	function sendSorted(data){

		var accepted = [];
		var pending = [];
		var declined = [];

		// golferDB.golfer_reservation_requests.findOne({"token":"hi"}, function(doc){
		if(data != null){
			console.log("not null");
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
		}

		socket.emit('send.reservations.golfer.accepted', accepted);
		socket.emit('send.reservations.golfer.pending', pending);
		socket.emit('send.reservations.golfer.declined', declined);

		console.log("sent?");

							// });

	}


	socket.on('facilities.getAll', function(data){

	});

	socket.on('reservations.get.course', function(data){});

	socket.on('auth.user', function(data){

		// console.log("halp")
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

		//         console.log(response.statusCode + " " + error);
		//     }
		// );

		// socket.emit('auth.tokenReceived', "hi");

		socket.username = tokens[tokenGen];

		var temp = {
			"token":tokens[tokenGen],
			"reservation_requests":[]
		}
		
		golferDB.golfer_reservation_requests.find({"token":tokens[tokenGen]}, function(err, docs){

			if(docs.length == 0){
				golferDB.golfer_reservation_requests.save(temp);
			}

		});
			// golferDB.golfer_reservation_requests.save(temp);

		socket.emit('auth.tokenReceived', tokens[tokenGen]);	

		tokenGen++;
		tokenGen = tokenGen%2;							

	});

	socket.on("facilities.getAllInCountry", function(data) {
		console.log('received request for getallincoutry');
		request.get({
		    uri:"https://sandbox.api.gnsvc.com/rest/channel/17652/facilities?q=list&skip=0&take=5000&expand=",
		    headers: { 'UserName': "Hackathon_Development",
		              	'Password': "6YBkHF86ut7946pDwZhp",
		          		"Access-Control-Allow-Origin": "*"}
		 },
		    function (error, response, body) {
		        if (!error && response.statusCode == 200) {
		        	// console.log("sending : "+ body);
		            // console.log(body);
		           	socket.emit('facility.receiveAllInCountry', {facilities: body});

		        }
		    }
		);
	});

	socket.on('facilities.getFacilityByLatLonAndRange', function(data){
		//sends the yo back with a link
		console.log("got data. searching lat: "+ data.lat  + " lon: "+ data.lon + " range: "+ data.range);
		request.get({
		    uri:'https://sandbox.api.gnsvc.com/rest/channel/17652/facilities?q=geo-location&latitude='+data.lat+'&longitude='+data.lon+'&proximity='+data.range,
		    headers: { 'UserName': "Hackathon_Development",
		              	'Password': "6YBkHF86ut7946pDwZhp",
		          		"Access-Control-Allow-Origin": "*"}
		 },
		    function (error, response, body) {
		        if (!error && response.statusCode == 200) {
		        	// console.log("sending : "+ body);
		            // console.log(body);
		           	socket.emit('facility.receiveFacilitiesByLatLonRange', {facilities: body});

		        }
		    }
		);
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
			// var date = new Date(Date.parse(teeTime.Time)).valueOf;
			// if((date >= userData.start.valueOf()) && (date <= userData.end.valueOf())){
			// 	console.log("passed date");
			// 	var temp = {
			// 			status:"pending",
			// 			name:golfCourse.Name,
			// 			cost:userData.price,
			// 			date:teeTime.Time.split('T')[0],
			// 			time:teeTime.Time.split('T')[1]
			// 		}

			// 		golferDB.golfer_reservation_requests.update({"token":userData.token},{ $push: {"reservation_requests":temp}},
			//         	{new:true}
			//         ,function(err, doc){
			//         	console.log("help"+doc);


			      

			//         });
			// }

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
						cost:userData.price,
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