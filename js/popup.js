var i = 0;
var background;
var races = [];
$(document).ready(function () {
  background = chrome.extension.getBackgroundPage();
  races = background.getRaces();
  $("#loading").hide();
  var count = 0;
  for (x of races) {
    count++;
    $('#listcontainer').append('<div id="item' + i + '"><a class="racebar"></a></div>');
    $('#item' + i + ' .racebar').append('<div class="race_img" style="background-image: url(\'http://cdn.speedrunslive.com/images/games/' + x.game.abbrev + '.jpg\');"></div>');
    $('#item' + i + ' .racebar').append('<div class="left"><strong>' + x.game.name + '</strong><br>' + x.goal + '</div>');
    if (x.state == 3) {
      var sec = Math.floor(Date.now() / 1000) - x.time;
      $('#item' + i + ' .racebar').append('<div class="right"><strong>' + x.numentrants + ' Entrant' + (x.numentrants === 1 ? '' : 's') + '</strong><br><span class="green time" data-sec="' + sec + '">' + toTime(sec) + '</div>');
    } else {
      $('#item' + i + ' .racebar').append('<div class="right"><strong>' + x.numentrants + ' Entrant' + (x.numentrants === 1 ? '' : 's') + '</strong><br>' + x.statetext + '</div>');
    }
    $('#item' + i).append('<div id="ls_entrants"><table id="raceTable"><tbody><tr><td colspan="3"><div id="entrantsBar">' + x.numentrants + ' Entrant' + (x.numentrants === 1 ? '' : 's') + '</div></td></tr></tbody></table></div>');
    $('#item' + i + ' #ls_entrants').hide();
    for (var key in x.entrants) {
      var html = '<tr>'
      var y = x.entrants[key];


      if (y.place > 9000) {

        html += '<td></td>';
      } else if (y.place === 1) {
        html += '<td><span class="gold">1st</span></td>';
      } else if (y.place === 2) {
        html += '<td><span class="silver">2nd</span></td>';
      } else if (y.place === 3) {
        html += '<td><span class="bronze">3rd</span></td>';
      } else {
        var placetext;
        if (y.place % 10 === 1 && y.place != 11) {
          placetext = y.place + 'th';
        } else if (y.place % 10 === 2 && y.place != 12) {
          placetext = y.place + 'nd';
        } else if (y.place % 10 === 3 && y.place != 13) {
          placetext = y.place + 'rd';
        } else {
          placetext = y.place + 'th';
        }
        html += '<td><span>' + placetext + '</span></td>';
      }

      html += '<td class="entrant"' + (y.message && y.message.length > 0 ? ' title="' + y.message : '') + ' data-url="' + y.twitch + '"><a>' + y.displayname + '</a><span class="small grey"> ' + (y.trueskill == 0 ? 'unranked' : y.trueskill) + '</span></td>';
      if (y.statetext == "Forfeit") {
        html += '<td colspan="2" class="red">Forfeit</td>';
      } else if (y.statetext == "Finished") {
        html += '<td colspan="2">' + toTime(y.time) + '</td>';
      } else {
        html += '<td colspan="2"></td>';
      }

      html += '</tr>';
      $('#item' + i + ' div table tbody').append(html);
    }
    $('#item' + i + ' .racebar').bind("click", function () {
      $(this).next().toggle("fast");
    });
    i++;
  }
  if (count === 0) {
    $("#noraces").show();
  }
  //$("#listcontainer").slideDown(100*(count > 9 ? 9 : count));
  setInterval(tick, 1000);

});

$(function () {
  $('body').on("click", ".entrant a", onNameClick);
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
  //console.log($(".time").html());
  $(".time").each(function () {
    //console.log(this);
    $(this).attr("data-sec", parseInt($(this).attr("data-sec")) + 1);
    $(this).html(toTime($(this).attr("data-sec")));
  });
}
