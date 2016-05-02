function position_cb(position) {
	var str = "You are accessing this site from (" + position.coords.latitude + ", " + position.coords.longitude + ")";
	$("#location").text(str);
	reportAnalytics();
}

function reportAnalytics() {
	var analytics = {
		'ts': new Date(),
		'url': window.location,
		'cookies': document.cookie,
		'callback': 'lambda a: print(a)'
	};
	console.log(analytics);
	$.ajax({
		contentType: "application/json",
		processData: false,
		data: JSON.stringify(analytics),
		url: "/record_analytics",
		type: "POST"
	});
}


$(document).ready(function() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(position_cb, reportAnalytics);
	} else {
		reportAnalytics();
	}
});
