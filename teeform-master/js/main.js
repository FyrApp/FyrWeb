$(document).ready(appReady);

function appReady() {

	// Menu Snapper
	var snapper = new Snap({
		element: document.getElementById("content"),
		disable: "right",
		touchToDrag: false,
	});

	$(document).on("click", "#toolbar-menu", function(){
		snapper.open("left")
	});

	snapper.on("animated", function(){
		$("body").width("0%").width("100%"); /* Partial fix for issue #002 */
	});

	// Page Changing
	var currPage = "";
	var pageStack = new Array();

	$(document).on("touchstart", ".link", function(event){
		event.stopPropagation();
		event.preventDefault();
		if(event.handled !== true) {
			changePage($(this).data("page"))
		event.handled = true;
		} else {
			return false;
		}
	})

	function changePage (page) {

		snapper.close();

		// Parsing page request
		if (page == "back") {
			page = lastPage.pop()
		}

		// Switching page
		$(".page").each(function(){
			if ($(this).data("page") == page) {

				// Header hiding
				if ($(this).hasClass("noheader")) {
					$("#toolbar").hide()
				} else {
					$("#toolbar").show()
				}

				// Page animations
				if (page == "login"){
					$(this).slideDown();
				} else {
					$(this).show()
				}
			} else {

				// Page animations
				if (currPage == "login"){
					$(this).slideUp()
				} else {
					$(this).hide()
				}
			}
		});

		// Special page cases
		switch(page){
			case "login":
				snapper.disable();
				break;
			default:
				break;
		}

		currPage = page;

	}
	changePage("login");
	var interval = setInterval(login, 1000);

	// Authentication
	$(document).on("touchstart", ".btn.login", login);
	$('[data-page="login"] input').bind('keypress', function(e) {
		if(e.keyCode==13){
			login();
		}
	});

	function login(){
		// TODO oauth authentication.
		if (twitter_authed) {
			document.activeElement.blur();
			$(".btn.login i").show();

			// on success
			changePage("notifs");

			google.maps.event.trigger(map, 'resize');
			map.setCenter(torontolatlng);

			$(".btn.login i").hide();
			snapper.enable();
			clearInterval(interval);
		}
	}
}
