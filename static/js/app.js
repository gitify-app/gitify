$(document).ready(function () {
  $("#latest-version").hide();
  $("#screenshot").hide().delay(500).slideToggle(1000,"easeOutBounce");
  $('.scroll-to-top').click(function(){
    $('html, body').animate({scrollTop : 0},800);
    return false;
  });

  $('.section').each(function () {
    $("#" + this.id + " #screenshot").hide();
  });

  $(window).scroll(function(){
      var height = $(window).scrollTop();

      $(".section").each(function() {
        var done = false;

        if (!done && $("#" + this.id + " #screenshot").is(':visible')) {
          console.log("#" + this.id + " #screenshot");
          $("#" + this.id + " #screenshot").show("slide", {direction: 'left'});
          done = true;
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

    $("#download-button").attr("href", downloadURL);
    $("#latest-version .version span").text(release.tag_name);
    $("#latest-version .date span").text(d + "/" + m + "/" + y);
    $("#latest-version").fadeIn(500);
  });
}
