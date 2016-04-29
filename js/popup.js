chrome.runtime.onMessage.addListener(function (message, sender, respond) {
  if (message === 'refreshed') {
    update();
  }
})

function cloneRace(race) {
  var newRace = {};
  newRace.goal = race.goal;
  newRace.state = race.statetext;
  newRace.game = race.game;
  newRace.goal = race.numentrants;
  newRace.goal = race.time;
  newRace.entrants = {};
  for (var e in race.entrants) {
    newRace.entrants[e] = cloneEntrant(race.entrants[e]);
  }
  return newRace;
}

function cloneEntrant(entrant) {
  var newEntrant = {};
  newEntrant.place = entrant.place;
  newEntrant.message = entrant.message;
  newEntrant.displayname = entrant.displayname;
  newEntrant.twitch = entrant.twitch;
  newEntrant.state = entrant.state;
  newEntrant.statetext = entrant.statetext;
  return newEntrant;
}

function newRace(race, id) {
  var goal = race.goal.replace(/https?:\/\/[^\s]+/, '<a data-url="$&">$&</a>')
  var right;
  if (race.state == 3) {
    var sec = Math.floor(Date.now() / 1000) - race.time;
    right = `<div class="right"><strong><span class="numentrants">${race.numentrants} Entrant${race.numentrants === 1 ? '' : 's'}</span></strong><br><span class="green time" data-sec="${sec}">${toTime(sec)}</span></div>`;
  } else {
    right = `<div class="right"><strong><span class="numentrants">${race.numentrants} Entrant${race.numentrants === 1 ? '' : 's'}</span></strong><br><span class="state">${race.statetext}</state></div>`;
  }
  var entrantsTable = "";
  for (var j in race.entrants) {
    var entrant = race.entrants[j];
    entrantsTable += newEntrant(entrant, j);
  }
  return `<div id="${id}">
<div class="racebar">
  <div class="race_img" style="background-image: url('http://cdn.speedrunslive.com/images/games/${race.game.abbrev}.jpg');"></div>
  <div class="left"><span class="gamename"><strong>${race.game.name}</strong></span><br><span class="goal">${goal}</span></div>
  ${right}
</div>
<div id="ls_entrants" style="display:none">
  <table id="raceTable"><tbody><tr>
    <td colspan="3">
      <div id="entrantsBar" class="numentrants">${race.numentrants} Entrant${race.numentrants === 1 ? '' : 's'}</div>
    </td>
    ${entrantsTable}
  </tr></tbody></table>
</div>
</div>`;
}

function newEntrant(entrant, id) {
  var entrantHtml = '<tr id="id">'
  if (entrant.place > 9000) {
    entrantHtml += '<td class = "place"></td>';
  } else if (entrant.place === 1) {
    entrantHtml += '<td class = "place"><span class="gold">1st</span></td>';
  } else if (entrant.place === 2) {
    entrantHtml += '<td class = "place"><span class="silver">2nd</span></td>';
  } else if (entrant.place === 3) {
    entrantHtml += '<td class = "place"><span class="bronze">3rd</span></td>';
  } else {
    var placetext;
    if (entrant.place % 10 === 1 && entrant.place % 100 !== 11) {
      placetext = entrant.place + 'th';
    } else if (entrant.place % 10 === 2 && entrant.place % 100 !== 12) {
      placetext = entrant.place + 'nd';
    } else if (entrant.place % 10 === 3 && entrant.place % 100 !== 13) {
      placetext = entrant.place + 'rd';
    } else {
      placetext = entrant.place + 'th';
    }
    entrantHtml += '<td class = "place"><span>' + placetext + '</span></td>';
  }

  entrantHtml +=
    `<td class="entrant"${entrant.message && entrant.message.length > 0 ? ` title="${entrant.message}"` : ''} data-url="${entrant.twitch}">
  <a>${entrant.displayname}</a>
  <span class="small grey">${entrant.trueskill == 0 ? 'unranked' : entrant.trueskill}</span>
</td>`;
  if (entrant.statetext == "Forfeit") {
    entrantHtml += '<td colspan="2" class="red state">Forfeit</td>';
  } else if (entrant.statetext == "Finished") {
    entrantHtml += `<td colspan="2" class="state">${toTime(entrant.time)}</td>`;
  } else {
    entrantHtml += '<td colspan="2" class="state"></td>';
  }

  entrantHtml += '</tr>';
  return entrantHtml;
}

function updateRace(race, currentRace, id) {
  var elem = $(`#${id}`)
  if (race.goal !== currentRace.goal) {
    elem.find('.goal').html(race.goal.replace(/https?:\/\/[^s]+/, '<a data-url="$&">$&</a>'))
  }
  if (race.state !== currentRace.state) {
    if (race.state == 3) {
      elem.remove('.state')
      if (!elem.find('.time')) {
        var sec = Math.floor(Date.now() / 1000) - race.time;
        elem.find('.right').append(`<span class="green time" data-sec="${sec}">${toTime(sec)}</span>`);
      }
    } else {
      elem.remove('.time');
      if (!elem.find('.state')) {
        elem.find('.right').append(`<span class="state">${race.statetext}</state>`);
      }
    }
  }
  if (race.time !== currentRace.time) {
    if (!elem.find('.time')) {
      var sec = Math.floor(Date.now() / 1000) - race.time;
      elem.find('.right').append(`<span class="green time" data-sec="${sec}">${toTime(sec)}</span>`);
    }
  }
  if (race.numentrants !== currentRace.numentrants) {
    elem.find('.numentrants').html(`${race.numentrants} Entrant${race.numentrants === 1 ? '' : 's'}`);
  }
  for (var e in race.entrants) {
    var entrant = race.entrants[e];
    if (currentRace.entrants.hasOwnProperty(e)) {
      var currentEntrant = currentRace.entrants[e];
      updateEntrant(entrant, currentEntrant, e, elem);
    } else {
      elem.find('#raceTable tbody').append(newEntrant(entrant, e));
    }
  }
  for (var e in currentRace.entrants) {
    if (!race.entrants.hasOwnProperty(e)) {
      elem.find('#raceTable tbody').remove(`#${e}`)
    }
  }
}

function updateEntrant(entrant, currentEntrant, id, elem) {
  var entrantElem = elem.find(`#${id}`);
  if (entrant.place !== currentEntrant.place) {
    if (entrant.place > 9000) {
      entrantElem.find('.place').html('');
    } else if (entrant.place === 1) {
      entrantElem.find('.place').html('<span class="gold">1st</span>');
    } else if (entrant.place === 2) {
      entrantElem.find('.place').html('<span class="silver">2nd</span>');
    } else if (entrant.place === 3) {
      entrantElem.find('.place').html('<span class="bronze">3rd</span>');
    } else {
      var placetext;
      if (entrant.place % 10 === 1 && entrant.place % 100 !== 11) {
        placetext = entrant.place + 'th';
      } else if (entrant.place % 10 === 2 && entrant.place % 100 !== 12) {
        placetext = entrant.place + 'nd';
      } else if (entrant.place % 10 === 3 && entrant.place % 100 !== 13) {
        placetext = entrant.place + 'rd';
      } else {
        placetext = entrant.place + 'th';
      }
      entrantElem.find('.place').html(`<span>${placetext}</span>`);
    }
  }
  if (entrant.message !== currentEntrant.message) {
    if (entrant.message.length > 0) {
      entrantElem.find('.entrant').attr('title', entrant.message)
    } else {
      entrantElem.find('entrant').removeAttr('title')
    }
  }
  if (entrant.state !== currentEntrant.state) {
    if (entrant.statetext == "Forfeit") {
      entrantElem.find('.state').addClass('red').html('Forfeit');
    } else if (entrant.statetext == "Finished") {
      entrantElem.find('.state').removeClass('red').html(toTime(entrant.time));
    } else {
      entrantElem.find('.state').removeClass('red').html('');
    }
  }
}

var background;
var races = {};
var currentRaces = {};
function update() {
  chrome.runtime.getBackgroundPage(function(background) {
    races = background.getRaces();
    $("#loading").hide();
    for (var id in races) {
      var race = races[id]
      if (currentRaces.hasOwnProperty(id)) {
        var currentRace = currentRaces[id];
        updateRace(race, currentRace, id);
      } else {
        var race = races[id];
        $('#listcontainer').append(newRace(race, id));
      }
    }
    for (var id in currentRaces) {
      if (!races.hasOwnProperty(id)) {
        $('#listcontainer').remove(`#${id}`)
      }
    }
    if (Object.keys(races).length === 0) {
      $("#noraces").show();
    }
    currentRaces = {};
    for (var r in races) {
      currentRaces[r] = cloneRace(races[r]);
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
    $(this).addClass('animate');
    setTimeout(() => $(this).removeClass('animate'), 500)
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
  chrome.runtime.sendMessage('refresh!', update);
}
