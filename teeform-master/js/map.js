var map
var cb = new Codebird;
var twitter_authed = false;
var torontolatlng = { lat: 43.7869432, lng: -79.1899812}
var latitude, longitude;

function initialize() {
	var mapOptions = {
		center: torontolatlng,
		zoom: 7,
	};
	map = new google.maps.Map(document.getElementById('map-canvas'),
			mapOptions);
}

function add_marker(pos, str, image) {
	var marker = new google.maps.Marker({
		position: pos,
		map: map,
		icon: image,
		animation: google.maps.Animation.DROP,
	});
	var infowindow = new google.maps.InfoWindow({
		content: str
	});
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map, marker);
	});
}

$(function(){
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(handle_geolocation_query, handle_errors);
	} else {
		alert('GeoLocation not ready');
	}
});

function handle_errors(error) {  
	// error handling here
}

function handle_geolocation_query(position){  
	latitude = (position.coords.latitude);
	longitude = (position.coords.longitude); 
}

$(function () {
	$('#message-input').keyup(function(e) {
		if (e.keyCode == 13) {
			// store tweet in var
			var msg_in = $("#message-input").val();
			$("#message-input").val("");
			
			if (msg_in.length > 130) {
				alert("message is too long, please keep it to under 130 chars");
				msg_in = ''
			} else if (msg_in.length == 0) {
				alert("Please enter something to tweet!");
			} else {
				var params = {
					status: msg_in + " #napalmapp",
					lat: latitude,
					long: longitude
				};

				cb.__call(
					"statuses_update",
					params,
					function(reply) {
						console.log(reply)
					});
			}
			populate_tweets();
		}
	});
});

google.maps.event.addDomListener(window, 'load', initialize);

//Twitter
window.addEventListener('load', function() {
	cb.setConsumerKey("gCHc0xXd5pG2EOIovEQyh8Oel", "ZRhqLqVD09UZqCPp6wc4wFiWZigNpGJNCA4HtrWyUPDylxIVSn");

	if (localStorage["token"] && localStorage["token_secret"]) {
		cb.setToken(localStorage["token"], localStorage["token_secret"])
		twitter_authed = true;
		populate_tweets();
	} else {
		cb.__call(
			"oauth_requestToken",
			{oauth_callback: "oob"},
			function (reply) {
				// stores it
				cb.setToken(reply.oauth_token, reply.oauth_token_secret);

				// gets the authorize screen URL
				cb.__call(
					"oauth_authorize",
					{},
					function (auth_url) {
						window.codebird_auth = window.open(auth_url);
					}
				);
			}
		);
	}
	populate_tweets();
	setInterval(populate_tweets, 60000);
}, false);

function check_pin(){
	cb.__call(
			"oauth_accessToken",
			{oauth_verifier: document.getElementById("pin").value},
			function (reply) {
				// store the authenticated token, which may be different from the request token (!)
				cb.setToken(reply.oauth_token, reply.oauth_token_secret);

				localStorage.setItem("token", reply.oauth_token)
					localStorage.setItem("token_secret", reply.oauth_token_secret)
					// if you need to persist the login after page reload,

					twitter_authed = true;
					// consider storing the token in a cookie or HTML5 local storage
			}
			);
}

function tweets_by_hashtag(htag, fn) {
	if (!twitter_authed) {
		return null;
	}
	cb.__call(
			"search_tweets",
			"q=%23" + htag,
			function (reply, rate_limit_status) {
				console.log(rate_limit_status);
				fn(reply);
			});
}

function tweets_by_username(uname, fn) {
	if (!twitter_authed) {
		return null;
	}

	cb.__call(
			"search_tweets",
			"q=%3A" + uname,
			function (reply, rate_limit_status) {
				console.log(rate_limit_status);
				fn(reply);
			});
}

function tweets_by_following(uname, fn) {
	if (!twitter_authed) {
		return null;
	}

	cb.__call(
			"followers_list",
			"screen_name=" + uname,
			function (reply, rate_limit_status) {
				console.log(rate_limit_status);
				fn(reply);
			});
}

function tweets_by_latlong(fn) {
	if (!twitter_authed) {
		return null;
	}

	var bounds = map.getBounds();

	var center = bounds.getCenter();
	var ne = bounds.getNorthEast();

	// r = radius of the earth in statute miles
	var r = 3963.0;

	// Convert lat or lng from decimal degrees into radians (divide by 57.2958)
	var lat1 = center.lat() / 57.2958;
	var lon1 = center.lng() / 57.2958;
	var lat2 = ne.lat() / 57.2958;
	var lon2 = ne.lng() / 57.2958;

	// distance = circle radius from center to Northeast corner of bounds
	var dis = parseInt(r * Math.acos(Math.sin(lat1) * Math.sin(lat2) +
	  Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)));

	cb.__call(
			"search_tweets",
			"q=#napalmapp&geocode=" + center.lat() + "," + center.lng() + "," + dis + "mi",
			function (reply, rate_limit_status) {
				console.log(rate_limit_status);
				fn(reply);
			});
}

function tweet_id_from_reply(reply) {

	var statuses = reply.statuses;
	var tweet_ids = [];
	console.log(statuses);
	for (i = 0; i < statuses.length; i++) {
		tweet_ids.push(statuses[i].id);
	}

	return tweet_ids;
}


var tweets = [];
function populate_tweets(){
	tweets_by_hashtag("napalmapp", function(reply){
		statuses = reply["statuses"]
		for (i in statuses){
			if (tweets.indexOf(statuses[i]["id"]) == -1){
				tweets.push(statuses[i]["id"])
				if (statuses[i]["geo"]){
					status_pos = statuses[i]["geo"]["coordinates"]
					status_latlng = {lat : status_pos[0], lng: status_pos[1]}
					image = statuses[i]["user"]["profile_image_url"]
					add_marker(status_latlng, statuses[i]["text"].replace("#napalmapp", ""), image)
				}
			}
		}
	});
}
