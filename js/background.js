chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);

var ids = [];

function onInit() {
	chrome.browserAction.setBadgeBackgroundColor({color:"#f7e279"});
	$.getJSON( "http://api.speedrunslive.com/races", function(json) {
		var count = 0;
		chrome.storage.sync.get({"gamesList":[]}, function(r) {
			var newIds = [];
			json.races.forEach(function(x) {
				//console.log(x.game.id);
				if (r.gamesList.indexOf(x.game.id.toString()) > -1) {
					newIds.push(x.id);
					count++;
					console.log(count);
					if (ids.indexOf(x.id) === -1) {
						chrome.notifications.create("", {type:"basic", title:x.game.name, message:x.goal, iconUrl: "images/128.png"}, function(){});
					}
				}
			});
			ids = newIds;
			console.log(count);
			chrome.browserAction.setBadgeText({text:count.toString()});
		});

	});
	chrome.alarms.create('alarm', {periodInMinutes:1});
	
}

function onAlarm(alarm) {
	$.getJSON( "http://api.speedrunslive.com/races", function(json) {
		var count = 0;
		chrome.storage.sync.get({"gamesList":[]}, function(r) {
			console.log(r.gamesList);
			newIds = [];
			json.races.forEach(function(x) {
				console.log(x.game.id);
				if (r.gamesList.indexOf(x.game.id.toString()) > -1) {
					newIds.push(x.id);
					count++;
					console.log(count);
					if (ids.indexOf(x.id) === -1) {
						chrome.notifications.create("",{type:"basic", title:x.game.name, message:x.goal, iconUrl: "images/128.png"}, function() {});
					}
				}

			});
			ids = newIds;
			console.log(count);
			chrome.browserAction.setBadgeText({text:count.toString()});
		});

	});
	chrome.alarms.create('alarm', {periodInMinutes:1});
}