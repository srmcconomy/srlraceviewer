$.getJSON( "http://api.speedrunslive.com/games", function(json) {
	var count = 0;
	chrome.storage.sync.get({"gamesList":[]}, function(result) {
		$("#loading").hide();
		var gamesList = result.gamesList;
		json.games.forEach(function(x) {
			var html;
			if (gamesList.indexOf(x.id.toString())>-1) {
				html = '<div><input type="checkbox" checked=true id="check" value="' + x.id + '">' + x.name + '</div>';
			} else {
				html = '<div><input type="checkbox" id="check" value="' + x.id + '">' + x.name + '</div>';
			}
			$('#listcontainer').append(html);
		});
		$("#listcontainer").slideDown(5000);
	});


});
$(function() {
	$("#listcontainer").on("change", "#check", function(e) {

		if (e.target.checked) {
			chrome.storage.sync.get({"gamesList":[]}, function(r) {
				r.gamesList.push(e.target.value);
				chrome.storage.sync.set({"gamesList":r.gamesList}, chrome.extension.getBackgroundPage().loadData);
			});
		}else {
			chrome.storage.sync.get({"gamesList":[]}, function(r) {
				if (r.gamesList.indexOf(e.target.value)>-1) {
					r.gamesList.splice(r.gamesList.indexOf(e.target.value));
					chrome.storage.sync.set({"gamesList":r.gamesList}, chrome.extension.getBackgroundPage().loadData);
				}
			});
		}
	});
});