chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);
chrome.runtime.onMessage.addListener(function (message, sender, respond) {
  if (message === 'refresh!') {
    loadData()
  }
});

var races = {};

function onInit() {
  chrome.browserAction.setBadgeBackgroundColor({
    color: "#f7e279"
  });
  loadData().then(() => chrome.alarms.create('alarm', {
    periodInMinutes: 1
  }));
}

function getRaces() {
  return races
}

function onAlarm(alarm) {
  loadData().then(function () {
    chrome.alarms.create('alarm', {
      periodInMinutes: 1
    });
  });
}

function loadData() {
  return new Promise(function (resolve, reject) {
    $.getJSON("http://api.speedrunslive.com/races", function (json) {
      chrome.storage.sync.get({
        "gamesList": []
      }, function (r) {
        var newRaces = {};
        json.races.forEach(function (x) {
          if (r.gamesList.length == 0 || r.gamesList.indexOf(x.game.id.toString()) > -1) {
            if (!races.hasOwnProperty(x.id)) {
              chrome.notifications.create("", {
                type: "basic",
                title: x.game.name,
                message: x.goal,
                iconUrl: "images/128.png"
              }, function () {});
            }
            newRaces[x.id] = x;
          }
        });
        races = newRaces;
        chrome.browserAction.setBadgeText({
          text: '' + Object.keys(races).length
        });
        chrome.runtime.sendMessage('refreshed');
        resolve();
      });
    });
  });
}
