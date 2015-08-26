window.onload = function() {
	document.getElementById("done_button").onclick = function() {
		addon.port.emit("done_click");
		return false;
	}
}
