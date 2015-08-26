var {ToggleButton} = require("sdk/ui/button/toggle");
var panels = require("sdk/panel");
var self = require("sdk/self");
var tabs = require('sdk/tabs');
var ss = require("sdk/simple-storage");
var Request = require("sdk/request").Request;
var pageMod = require("sdk/page-mod");
// Base API URL
var API_URL = "https://openaccessbutton.org/api";
var STORY_BASE_URL = "https://openaccessbutton.org/story/";

// Number of open sidebars
// Used to keep track of when we should toggle the icon
var num_open = 0;
var OABenabled = false;
//This variable will change depending on wether the URL is verified or not
var verifiedOrNot = "Not yet determined";
//The URL of a current journal in the DOAJ, pass onto the sidebar, so that we can change hiperlinks
var DOAJurl = '';

// Button used to toggle sidebar open/closed
var button = ToggleButton({
    id: "open_access_button",
    label: "Open Access Button",
    icon: {
        "16": "./images/oabutton-16.png",
        "32": "./images/oabutton-32.png",
        "64": "./images/oabutton-64.png"
    },
		onClick: handleChange,
		badge: "",
		badgeColor: "#FFFFFF"
});

// Introduction sidebar
var intro_sidebar = require("sdk/ui/sidebar").Sidebar({
			id: 'oabutton-intro-sidebar',
			title: " ",
			onHide: sidebarHidden,
			onShow: sidebarShown,
			url: require("sdk/self").data.url("intro_sidebar.html"),
			onReady: function(worker) {
				worker.port.on("done_click", function() {
					ss.storage.first_run = false;
					handleNavigation();
				});
			}
});

// Signup/signing sidebar
var signup_sidebar = require("sdk/ui/sidebar").Sidebar({
      id: 'oabutton-signup-sidebar',
      title: "Open Access Button",
			onHide: sidebarHidden,
			onShow: sidebarShown,
      url: require("sdk/self").data.url("signup_sidebar.html"),
			onReady: function(worker) {
				// User signup
				worker.port.on("signup_click", function(username, email, password, profession) {
					if (email === "") {
						showNotification("Signup Error", "Email address is blank");
					} else {
						Request({
							url: API_URL + "/register",
							content: {username: username, email: email, password: password, profession: profession},
							onComplete: function(response) {
								if (response.status == 200) {
									var data = response.json;
									ss.storage.username = data.username;
									ss.storage.api_key = data.api_key;
									handleNavigation();
								} else {
									showApiError("Signup Error", response);
								}
							}
						}).post();
					}
				});

				// User login
				worker.port.on("login_click", function(username, password) {
					if (username === "") {
						showNotification("Login Error", "Username is blank");
					} else {
						Request({
							url: API_URL + "/retrieve",
							content: {username: username, password: password},
							onComplete: function(response) {
								if (response.status == 200 && response.json["api_key"] != undefined && response.json["api_key"].length > 0) {
									var data = response.json;
									ss.storage.username = username;
									ss.storage.api_key = data.api_key;
									handleNavigation();
								} else {
									showError("Login Error", "Username or password incorrect");
								}
							}
						}).post();
					}
				});
			}
});

// The main sidebar showing everything else
var sidebar = require("sdk/ui/sidebar").Sidebar({
      id: 'oabutton-sidebar',
      title: " ",
      url: require("sdk/self").data.url("sidebar.html"),
			onHide: sidebarHidden,
			onShow: sidebarShown,
			//Initialise the Verifier
			onReady: function(worker) {
				worker.port.on("page_loaded", function() {
					var monitor = require("sdk/tabs").on("ready", logURL);
					OABenabled = true;

					//Handles changes of the badge
					function changeBadge(DOAJapproved, OASPAapproved){
						if(OASPAapproved || DOAJapproved){
							//Tick mark in unicode
							button.badge = '\u2714';
							button.badgeColor = "#00CC66";
							verifiedOrNot = "Verified";
							worker.port.emit("changeView", verifiedOrNot, DOAJurl);
						}
						else{
							//X mark in unicode
							button.badge = '\u2718';
							button.badgeColor = "#FF4444";
							verifiedOrNot = "Not verified";
							worker.port.emit("changeView", verifiedOrNot, DOAJurl);
						}
					}

					//Post part of the URL to the API, compare to actual URL
					function postToApi(urlGet, url){
						Request({
							//TODO :: Change the url from a local API to a one hosted online!
							url: 'http://127.0.0.1:8000/publishers/' + urlGet + '/?format=json',
							onComplete: function(response) {
								//When we get no response from server, set the badge to hidden, show default screen
								if(response.json[0] == undefined){
									button.badge = '';
									verifiedOrNot = "No data";
									worker.port.emit("changeView", verifiedOrNot, DOAJurl);
								}
								else{
								//Otherwise, we have a responce. Find which of the given journals matches the URL.
									DOAJapproved = false;
									OASPAapproved = false;
									DOAJurl = '';
									for (var i = response.json.length - 1; i >= 0; i--) {
										if(response.json[i]["URL"].substring(1, response.json[i]["URL"].length - 1) == '/'){
											var apiURL = response.json[i]["URL"].substring(0, response.json[i].length - 1);
										}
										else{
											var apiURL = response.json[i]["URL"];
										}
										//Set the variables to the ones given by the API
										if(url.indexOf(apiURL) > -1){
											DOAJapproved = response.json[i]["DOAJapproved"];
											OASPAapproved = response.json[i]["OASPAapproved"];
											DOAJurl = response.json[i]["DOAJurl"];
											break;
										}
									};
									changeBadge(DOAJapproved, OASPAapproved);
								}
							}
						}).get();
					}

					//When we change tab, make sure we change the badge and the screen
					tabs.on('activate', function () {
					  if(OABenabled){
							var url = tabs.activeTab.url;
							var urlGet = url.replace(/www.|http:\/\/|https:\/\//gi, '');
							//Split at first /, as we don't know exactly where to split- i.e. http://www.hindawi.com/journals/psi/2015/747961/
							urlGet = urlGet.split("/")[0];
							//Pass the WHOLE url as well as the split url, so that we can compare and get the right journal
							postToApi(urlGet, url);
						}
					});

					//When open a new url in CURRENT tab, make sure we change the badge and the screen
					function logURL(tab) {
						if(OABenabled){
							var url = tabs.activeTab.url;
							var urlGet = url.replace(/www.|http:\/\/|https:\/\//gi, '');
							//Split at first /, as we don't know exactly where to split- i.e. http://www.hindawi.com/journals/psi/2015/747961/
							urlGet = urlGet.split("/")[0];
							//Pass the WHOLE url as well as the split url, so that we can compare and get the right journal
							postToApi(urlGet, url);
						}
					};
				});

				// Logout
				worker.port.on("logout", function() {
					ss.storage.username = undefined;
					ss.storage.api_key = undefined;
					OABenabled = false;
					button.badge = "";
					var verifiedOrNot = "Not yet determined";
					handleNavigation();
				});

				// Close sidebar
				worker.port.on("close_sidebar", function() {
					sidebar.hide();
					signup_sidebar.hide();
					intro_sidebar.hide();
				});
				
				//Emit whether or not the journal is verified + its URL in the DOAJ
				worker.port.emit("changeView", verifiedOrNot, DOAJurl);
			}
});

// Show notifications to user
function showApiError(title, response) {
	var errors = response.json.errors;

	for(var i=0; i<errors.length; i++) {
		showNotification(title, errors[i]);
	}
}

function showError(title, body) {
	var notifications = require("sdk/notifications");
	notifications.notify({
		title: title,
		text: body
	});
}
showNotification = showError;

// Keep sidebar and button in track
function handleChange (state) {
	if (state.checked) {
		handleNavigation();
	} 
	else {
    	signup_sidebar.hide();
		intro_sidebar.hide();
    	sidebar.hide();
		button.state("window", {checked: false});
	}
}

function sidebarHidden() {
	num_open -= 1;
	if (num_open < 1) {
		button.state("window", {checked: false});
	} else {
		button.state("window", {checked: true});
	}
}

function sidebarShown() {
	num_open += 1;
	if (num_open < 1) {
		button.state("window", {checked: false});
	} else {
		button.state("window", {checked: true});
	}
}

// Only show the signup sidebar if we're logged out
function handleNavigation() {
		// On first run show the introduction sidebar
		if (!(ss.storage.first_run === false)) {
			intro_sidebar.show();
		} else if (typeof ss.storage.api_key === "undefined" || ss.storage.api_key === "") {
			signup_sidebar.show();
		} else {
			sidebar.show();
		}
}

// Keep track of email addresses in the page
pageMod.PageMod({
  include: "*",
  contentScriptFile: self.data.url("js/emails.js"),
  onAttach: function(worker) {
    worker.port.on("emails", function(emails) {
			ss.storage.emails = emails;
		});
  }
});
