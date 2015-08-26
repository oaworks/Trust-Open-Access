var all_emails = document.documentElement.innerHTML.toLowerCase().match(/([a-z0-9_\.\-\+]+@[a-z0-9_\-]+(\.[a-z0-9_\-]+)+)/g);
if (all_emails == null) {
	self.port.emit("emails", []);
} else {
	var emails = [];

	for (var i=0; i<all_emails.length; i++) {
		var email = all_emails[i];
		if (!((email.indexOf("@elsevier.com") > -1) || (email.indexOf("@nature.com") > -1) || (email.indexOf("@sciencemag.com") > -1) || (email.indexOf("@springer.com") > -1))) {
			emails.push(email);
		}
	}

	self.port.emit("emails", emails);
}
