$(document).ready(function () {
  $("#latest-version").hide();
  $(".screenshot").hide();
  $("#screenshot").delay(500).slideToggle(1000,"easeOutBounce");

  $('.scroll-to-top').click(function() {
    $('html, body').animate({scrollTop : 0},800);
    return false;
  });

  $(window).scroll(function(){
    $(".section").each(function() {
      var section = $(this);
      var sectionScreenshot = section.find(".screenshot");

      var direction;
      if (section.hasClass("alt")) {
        direction = "left";
      } else {
        direction = "right";
      }

      if (sectionScreenshot.css('display') == 'none' && isScrolledIntoView(section)) {
        sectionScreenshot.show("slide", {
          duration: 1000,
          direction: direction
        });
      }
    });
  });

  getLatestReleaseDetails();
});

function getLatestReleaseDetails() {
  $.getJSON("https://api.github.com/repos/ekonstantinidis/gitify/releases/latest").done(function (release) {
    var asset = release.assets[0];
    var downloadURL = "https://github.com/ekonstantinidis/gitify/releases/download/" + release.tag_name + "/" + asset.name;

    var releaseDate = new Date(release.created_at);
    var d = releaseDate.getDate();
    var m =  releaseDate.getMonth() + 1;
    var y = releaseDate.getFullYear();

    $("#download-apple").attr("href", downloadURL);
    $("#latest-version .version span").text(release.tag_name);
    $("#latest-version .date span").text(d + "/" + m + "/" + y);
    $("#latest-version").fadeIn(500);
  });
}

function isScrolledIntoView(elem) {
  var $elem = $(elem);
  var $window = $(window);

  var docViewTop = $window.scrollTop();
  var docViewBottom = docViewTop + $window.height();

  var elemTop = $elem.offset().top;
  var elemBottom = elemTop + $elem.height();

  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}
