chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);
chrome.runtime.onMessage.addListener(function(message, sender, respond) {
	console.log(message);
	console.log(sender);
	if (message === 'refresh') {
		loadData().then(respond());
	}
});

var ids = [];
var races = [];

function onInit() {
	chrome.browserAction.setBadgeBackgroundColor({ color: "#f7e279" });
	loadData().then(() => chrome.alarms.create('alarm', { periodInMinutes: 1 }));
}

function getRaces() { return races }

function onAlarm(alarm) {
	loadData().then(function() {
		chrome.runtime.sendMessage('refresh');
		chrome.alarms.create('alarm', { periodInMinutes: 1 });
	});
}

function loadData() {
	return new Promise(function(resolve, reject) {
		$.getJSON( "http://api.speedrunslive.com/races", function(json) {
			var count = 0;
			chrome.storage.sync.get({ "gamesList": [] }, function(r) {
				//console.log(r.gamesList);
				var newIds = [];
				races = [];
				json.races.forEach(function(x) {
					//console.log(x.game.id);
					if (r.gamesList.length == 0 || r.gamesList.indexOf(x.game.id.toString()) > -1) {
						races.push(x);
						newIds.push(x.id);
						count++;
						//console.log(count);
						if (ids.indexOf(x.id) === -1) {
							chrome.notifications.create("",{type:"basic", title:x.game.name, message:x.goal, iconUrl: "images/128.png"}, function() {});
						}
					}

				});
				ids = newIds;
				//console.log(count);
				chrome.browserAction.setBadgeText({text:count.toString()});
				resolve();
			});
		});
	});
}
