var map

function initialize() {
	var mapOptions = {
		center: { lat: 43.7869432, lng: -79.1899812},
		zoom: 16
	};
	map = new google.maps.Map(document.getElementById('map-canvas'),
			mapOptions);
	add_marker({ lat: 43.7869432, lng: -79.1899812}, "boop")
}

function add_marker(pos, str) {
	var marker = new google.maps.Marker({
		position: pos,
		map: map,
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
