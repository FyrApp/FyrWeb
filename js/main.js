var map
var cb = new Codebird;
var twitter_authed = false;

function initialize() {
	var mapOptions = {
		center: { lat: 43.7869432, lng: -79.1899812},
		zoom: 8
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

$('#message-button').click(function() {
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;
	cb.__call(
		"statuses_update",
		{"status": $('#message-input').val(), "lat" : lat, "long" : lon},
		function(reply) {
			console.log(reply);
		});
});

google.maps.event.addDomListener(window, 'load', initialize);

//Twitter
window.onload = function() {
	cb.setConsumerKey("gCHc0xXd5pG2EOIovEQyh8Oel", "ZRhqLqVD09UZqCPp6wc4wFiWZigNpGJNCA4HtrWyUPDylxIVSn");

	if (localStorage["token"] && localStorage["token_secret"]) {
		cb.setToken(localStorage["token"], localStorage["token_secret"])
		$("#pin").hide()
		twitter_authed = true;
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
var foo = '';

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

function tweet_id_from_reply(reply) {

	var statuses = reply.statuses;
	var tweet_ids = [];
	console.log(statuses);
	for (i = 0; i < statuses.length; i++) {
		tweet_ids.push(statuses[i].id);
	}

	return tweet_ids;
}

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
				$("#pin").hide()
				// consider storing the token in a cookie or HTML5 local storage
			}
			);
}

var tweets = [];
function populate_tweets(){
	tweets_by_hashtag("napalmapp", function(reply){
		statuses = reply["statuses"]
		for (i in statuses){
			if (tweets.indexOf(statuses[i]["id"]) == -1){
				tweets.push(statuses[i]["id"])
				if (statuses[i]["place"]){
					status_pos = statuses[i]["place"]["bounding_box"]["coordinates"][0][0]
					status_latlng = {lat : status_pos[1], lng: status_pos[0]}
					image = statuses[i]["user"]["profile_image_url"]
					add_marker(status_latlng, statuses[i]["text"].replace("#napalmapp", ""), image)
				}
			}
		}
	});
}
