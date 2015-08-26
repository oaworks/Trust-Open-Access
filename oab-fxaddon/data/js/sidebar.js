window.onload = function(result) {
	addon.port.emit("page_loaded");
	document.getElementById("logout_button").onclick = function() {
		addon.port.emit("logout");
		return false;
	}

	document.getElementById("done_button").onclick = function() {
		showLoaded();
		addon.port.emit("close_sidebar");
	}
}

addon.port.on("changeView", function(result, url){
	if(result == "Verified"){
		$("#loading").hide();
		$("#noData").hide();
		$("#approved").show();
		$("#notApproved").hide();
	}
	else if(result == "Not verified"){
		$("#loading").hide();		
		$("#noData").hide();
		$("#approved").hide();
		$("#notApproved").show();
	}
	else if(result == "Not yet determined"){
		$("#loading").show();
		$("#noData").hide();
		$("#approved").hide();
		$("#notApproved").hide();
	}
	else{
		$("#loading").hide();
		$("#noData").show();
		$("#approved").hide();
		$("#notApproved").hide();
	}
});

// Styling of links
$(document).ready(function() {
	$(".left").css("margin-right", ($(".underlined").width() - $(".left").width() - $(".rightt").width() - $(".centralright").width() - $(".centralleft").width() - 1)/3);
	$(".centralleft").css("margin-right", (($(".underlined").width() - $(".left").width() - $(".rightt").width() - $(".centralright").width() - $(".centralleft").width() - 1)/3));
	$(".centralright").css("margin-right", (($(".underlined").width() - $(".left").width() - $(".rightt").width() - $(".centralright").width() - $(".centralleft").width() - 1)/3));
});
$(window).resize(function() {
	$(".left").css("margin-right", ($(".underlined").width() - $(".left").width() - $(".rightt").width() - $(".centralright").width() - $(".centralleft").width() - 1)/3);
	$(".centralleft").css("margin-right", (($(".underlined").width() - $(".left").width() - $(".rightt").width() - $(".centralright").width() - $(".centralleft").width() - 1)/3));
	$(".centralright").css("margin-right", (($(".underlined").width() - $(".left").width() - $(".rightt").width() - $(".centralright").width() - $(".centralleft").width() - 1)/3));
});
