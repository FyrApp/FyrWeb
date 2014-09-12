var map
var cb = new Codebird;
var twitter_authed = false;

function initialize() {
	var mapOptions = {
		center: { lat: 43.7869432, lng: -79.1899812},
		zoom: 16
	};
	map = new google.maps.Map(document.getElementById('map-canvas'),
			mapOptions);
	add_marker({ lat: 43.7869432, lng: -79.1899812}, "boop")
}

function get_img() {
	var user_img = user_by_tweet();
	var img = user_img["profile_image_url"];
	
	if (img == 'null') {
		return default_img;
	} else {
		return img;
	}
}

function add_marker(pos, str) {
	var profile_img = get_img();
	var marker = new google.maps.Marker({
		position: pos,
		map: map,
		icon: profile_img,
		animation: google.maps.Animation.DROP,
	});
	var infowindow = new google.maps.InfoWindow({
		content: str
	});
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map, marker);
	});
}

google.maps.event.addDomListener(window, 'load', initialize);

//Twitter
window.onload = function() {
	var twitter_authed = false;
	cb.setConsumerKey("gCHc0xXd5pG2EOIovEQyh8Oel", "ZRhqLqVD09UZqCPp6wc4wFiWZigNpGJNCA4HtrWyUPDylxIVSn");

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
				tweet_ids = tweet_id_from_reply(reply);
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
				// consider storing the token in a cookie or HTML5 local storage
			}
			);
}
