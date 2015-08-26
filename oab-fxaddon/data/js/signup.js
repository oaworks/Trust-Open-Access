window.onload = function() {
	// Switch between different forms
	document.getElementById("show_login_button").onclick = function() {
		showSignin();
		return false;
	}
	document.getElementById("show_register_button").onclick = function() {
		showRegister();
		return false;
	}
	document.getElementById("back_button_signin").onclick = function() {
		showMain();
		return false;
	}
	document.getElementById("back_button_register").onclick = function() {
		showMain();
		return false;
	}

	// Signup
	document.getElementById("signup_button").onclick = function() {
		var username = document.getElementById("username").value;
		var email = document.getElementById("email").value;
		var password = document.getElementById("password").value;
		var profession = document.getElementById("profession").value;
		addon.port.emit("signup_click", username, email, password, profession);
	}

	// Login
	document.getElementById("login_button").onclick = function() {
		var username = document.getElementById("signin_username").value;
		var password = document.getElementById("signin_password").value;
		addon.port.emit("login_click", username, password);
	}

	// Just redirect to a page on the website for now
	document.getElementById("forgot_password").onclick = function() {
		var username = document.getElementById("signin_username").value;
		window.open("http://openaccessbutton.org/firefox/forgot_password?username=" + encodeURI(username));
	}

	showMain();
}

function showMain() {
	document.getElementById("choose_group").style.display = 'block';
	document.getElementById("signin_group").style.display = 'none';
	document.getElementById("register_group").style.display = 'none';
}

function showSignin() {
	document.getElementById("choose_group").style.display = 'none';
	document.getElementById("signin_group").style.display = 'block';
	document.getElementById("register_group").style.display = 'none';
}

function showRegister() {
	document.getElementById("choose_group").style.display = 'none';
	document.getElementById("signin_group").style.display = 'none';
	document.getElementById("register_group").style.display = 'block';
}
