var map
var cb = new Codebird;

function initialize() {
	var mapOptions = {
		center: { lat: 43.7869432, lng: -79.1899812},
		zoom: 16
	};
	map = new google.maps.Map(document.getElementById('map-canvas'),
			mapOptions);
	add_marker({ lat: 43.7869432, lng: -79.1899812}, "boop", "")
}

function add_marker(pos, str, profile_img) {
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
