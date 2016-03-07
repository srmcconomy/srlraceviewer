chrome.runtime.onMessage.addListener(function(message, sender, respond) {
  if (message === 'refresh') {
    update();
  }
})

function htmlForEntrant(entrant) {
  var entrantHtml = '<tr>'
  if (entrant.place > 9000) {
    entrantHtml += '<td></td>';
  } else if (entrant.place === 1) {
    entrantHtml += '<td><span class="gold">1st</span></td>';
  } else if (entrant.place === 2) {
    entrantHtml += '<td><span class="silver">2nd</span></td>';
  } else if (entrant.place === 3) {
    entrantHtml += '<td><span class="bronze">3rd</span></td>';
  } else {
    var placetext;
    if (entrant.place % 10 === 1 && entrant.place != 11) {
      placetext = entrant.place + 'th';
    } else if (entrant.place % 10 === 2 && entrant.place != 12) {
      placetext = entrant.place + 'nd';
    } else if (entrant.place % 10 === 3 && entrant.place != 13) {
      placetext = entrant.place + 'rd';
    } else {
      placetext = entrant.place + 'th';
    }
    entrantHtml += '<td><span>' + placetext + '</span></td>';
  }

  entrantHtml +=
`<td class="entrant"${entrant.message && entrant.message.length > 0 ? ` title="${entrant.message}"` : ''} data-url="${entrant.twitch}">
  <a>${entrant.displayname}</a>
  <span class="small grey">${entrant.trueskill == 0 ? 'unranked' : entrant.trueskill}</span>
</td>`;
  if (entrant.statetext == "Forfeit") {
    entrantHtml += '<td colspan="2" class="red">Forfeit</td>';
  } else if (entrant.statetext == "Finished") {
    entrantHtml += `<td colspan="2">${toTime(entrant.time)}</td>`;
  } else {
    entrantHtml += '<td colspan="2"></td>';
  }

  entrantHtml += '</tr>';
  return entrantHtml;
}


var i = 0;
var background;
var races = [];
function update() {
  chrome.runtime.getBackgroundPage(function(background) {
    races = background.getRaces();
    $("#loading").hide();
    for (var i = 0; i < races.length; i++) {
      var race = races[i];
      var goal = race.goal;
      if (goal.match(/^http:\/\/[^\s]+$/)) {
        goal = `<a data-url="${goal}">${goal}</a>`;
      }
      var right;
      if (race.state == 3) {
        var sec = Math.floor(Date.now() / 1000) - race.time;
        right = `<div class="right"><strong>${race.numentrants} Entrant${race.numentrants === 1 ? '' : 's'}</strong><br><span class="green time" data-sec="${sec}">${toTime(sec)}</span></div>`;
      } else {
        right = `<div class="right"><strong>${race.numentrants} Entrant${race.numentrants === 1 ? '' : 's'}</strong><br>${race.statetext}</div>`;
      }
      var entrantsTable = "";
      for (var j in race.entrants) {
        var entrant = race.entrants[j];
        entrantsTable += htmlForEntrant(entrant);
      }
      var html =
  `<div>
    <div class="racebar">
      <div class="race_img" style="background-image: url('http://cdn.speedrunslive.com/images/games/${race.game.abbrev}.jpg');"></div>
      <div class="left"><strong>${race.game.name}</strong><br>${goal}</div>
      ${right}
    </div>
    <div id="ls_entrants" style="display:none">
      <table id="raceTable"><tbody><tr>
        <td colspan="3">
          <div id="entrantsBar">${race.numentrants} Entrant${race.numentrants === 1 ? '' : 's'}</div>
        </td>
        ${entrantsTable}
      </tr></tbody></table>
    </div>
  </div>`;
      $('#listcontainer').append(html);
    }
    if (i === 0) {
      $("#noraces").show();
    }
  });
}

$(function () {
  $('body').on("click", ".entrant a", onNameClick);
  $('body').on("click", '.racebar', function () {
    $(this).next().toggle("fast");
  });
  $('body').on('click', '.racebar a', function(e){
    e.stopPropagation();
    chrome.tabs.create({
      "url": $(e.target).attr("data-url")
    });
  });
  $('#refresh').on('click', function(e) {
    refresh();
  })
  setInterval(tick, 1000);
  update();
});

function zeroFill(x) {
  var z = '00';
  z += x;
  return z.slice(-2);
}

function toTime(sec) {
  return zeroFill(Math.floor(sec / 3600)) + ':' + zeroFill(Math.floor((sec % 3600) / 60)) + ':' + zeroFill(Math.floor(sec % 60));
}



function onNameClick(e) {
  var twitch = $(e.target).attr("data-url");
  if (typeof twitch == "undefined") {
    twitch = $(e.target).parent().attr("data-url");
  }
  var url = "http://www.twitch.tv/" + twitch;

  chrome.tabs.create({
    "url": url
  });
}

function tick() {
  $(".time").each(function () {
    $(this).attr("data-sec", parseInt($(this).attr("data-sec")) + 1);
    $(this).html(toTime($(this).attr("data-sec")));
  });
}

function refresh() {
  chrome.runtime.sendMessage('refresh', update);
}
